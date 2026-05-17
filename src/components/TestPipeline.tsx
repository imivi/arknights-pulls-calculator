import { useState } from "react"
import tables from "../data/tables.json"
import * as aq from 'arquero'
import { AllUserResources } from "../stores/useUserResourcesStore"
import dayjs from "dayjs"
import { convertPullsToResources, convertResourcesToPulls } from "../utils/utils"

type Resource = {
    amount: number
    confirmed: number
    day: string
    resource: number
    source: string
}

function getDailyCertsResources(certsPerDay: number, days: string[]): Resource[] {

    // Add certs from daily recruitment
    if (certsPerDay === 0)
        return []

    const dailyCerts: Resource[] = []
    for (const day of days) {
        dailyCerts.push({
            amount: certsPerDay,
            confirmed: 1,
            day,
            resource: 4, // Gold certs
            source: 'recruitment',
        })
    }

    return dailyCerts
}


function getDailyUserResources(userResources: AllUserResources): Resource[] {
    const dailyUserResources: Resource[] = []
    Object.entries(userResources).forEach(([day, resources]) => {
        const { orundum, tickets, op, certs } = resources
        if (orundum) {
            dailyUserResources.push({
                amount: orundum.value,
                confirmed: 1,
                day,
                resource: 1, // Orundum
                source: orundum.description,
            })
        }
        if (tickets) {
            dailyUserResources.push({
                amount: tickets.value,
                confirmed: 1,
                day,
                resource: 2, // Tickets
                source: tickets.description,
            })
        }
        if (op) {
            dailyUserResources.push({
                amount: op.value,
                confirmed: 1,
                day,
                resource: 3, // OP
                source: op.description,
            })
        }
        if (certs) {
            dailyUserResources.push({
                amount: certs.value,
                confirmed: 1,
                day,
                resource: 4, // Gold certs
                source: certs.description,
            })
        }
    })
    return dailyUserResources
}


export default function TestPipeline() {

    const { days, events, eventDays, resources } = tables

    const userSettings = {
        startingOrundum: 10_000,
        startingTickets: 20,
        startingOp: 200,
        startingCerts: 50,
        monthlyCard: false,
        claimedDay: '2026-05-16',
        certsPerDay: 1.5,
        clearedReruns: [
            'exodus_rerun',
            'reunion_lim_rerun',
        ],
        maxPullsToSpend: {
            '2026-07-16': 176,
        },
        // resources added or subtracted by the user
        userResources: {
            '2026-06-02': {
                orundum: { value: 1_000, description: 'user_input' },
                tickets: { value: 38, description: 'user_input' },
                op: { value: 10, description: 'user_input' },
                certs: { value: -258, description: 'user_input' },
            },
        },
    }

    const todayStr = dayjs().format('YYYY-MM-DD')

    const dt_cleared_reruns = aq.from(userSettings.clearedReruns.map(id => ({ event_id: id, cleared_rerun: 1 })))
    const dt_max_pulls = aq.from(Object.entries(userSettings.maxPullsToSpend).map(([day, amount]) => ({ day, user_max_pulls: amount })))

    const dt_days = aq.table(days)
        .params({ today: todayStr })
        .filter((d, params) => d.day >= params.today) // Only include days from today onwards
    const dt_events = aq.table(events)
    const dt_event_days = aq.table(eventDays)

    const dt_resources = aq.table(resources)
    // console.log(getDailyCertsResources(1.5))
    const dt_certs = aq.from(getDailyCertsResources(userSettings.certsPerDay, dt_days.objects().map(d => d.day)))
    const dt_user_resources = aq.from(getDailyUserResources(userSettings.userResources))
    const dt_all_resources = dt_resources.concat(dt_certs).concat(dt_user_resources)

    // console.log(dt_all_resources.filter(row => row.resource === 4).objects())

    const dt_merged = dt_days
        .join_left(dt_event_days, 'day')
        // .join_left(dt_events, 'event_id')
        .join_left(dt_cleared_reruns, 'event_id')
        .join_left(dt_all_resources, 'day')
        .derive({
            // Fill missing values with 0
            cleared_rerun: d => d.cleared_rerun ?? 0,
            // Add info on monthly card
            has_monthly_card: userSettings.monthlyCard ? 1 : 0,
        })
        .orderby('day')


    const dt_filtered = dt_merged
        // If user is F2P, exclude resources from monthly cards
        .filter(row => row.source !== 'monthly_card' || row.has_monthly_card === 1)
        // If user cleared reruns, exclude resources from those days
        .filter((row) => row.source !== "event_stages" || row.cleared_rerun === 1)
        // If user did not clear a rerun, exclude the orundum from intel certs
        .filter((row) => !(row.source === "intel" && row.cleared_rerun === 0))
        // If user did not clear a rerun, exclude the certs from welfare tokens
        .filter((row) => !(row.source === "tokens" && row.cleared_rerun === 0))


    const dt_res_gained_by_day = dt_filtered
        .select(['day', 'resource', 'amount'])
        // Sum the same resources for each day
        .groupby('day', 'resource')
        .rollup({ amount: d => aq.op.sum(d.amount) })
        // Pivot to create columns for each resource
        .groupby('day')
        .pivot(
            { key: d => d.resource },
            { value: d => aq.op.sum(d.amount) }
        )
        // Rename the columns
        .rename({
            '1': 'orundum_gained',
            '2': 'tickets_gained',
            '3': 'op_gained',
            '4': 'certs_gained',
        })
        // Fill missing values with 0
        .derive({
            orundum_gained: d => d.orundum_gained ?? 0,
            tickets_gained: d => d.tickets_gained ?? 0,
            op_gained: d => d.op_gained ?? 0,
            certs_gained: d => d.certs_gained ?? 0,
        })
        .join_left(dt_max_pulls, 'day')
        .derive({
            user_max_pulls: d => d.user_max_pulls ?? 0,
        })
        .orderby('day')

    // loop over each day to calculate spent resources and cumulative total resources
    // (insert resource spending values into resources_gained table)

    const res_gained_by_day = dt_res_gained_by_day.objects()

    const resourcesSpentFromPulling: Resource[] = []

    res_gained_by_day.forEach((row, i) => {

        const today = (i === 0)

        const maxPullsToday: number = row.user_max_pulls

        if (today) {
            row['orundum_spendable'] = row['orundum_gained'] + userSettings.startingOrundum
            row['tickets_spendable'] = row['tickets_gained'] + userSettings.startingTickets
            row['op_spendable'] = row['op_gained'] + userSettings.startingOp
        }
        else {
            const yesterday = res_gained_by_day[i - 1]
            row['orundum_spendable'] = row['orundum_gained'] + yesterday['orundum_leftover']
            row['tickets_spendable'] = row['tickets_gained'] + yesterday['tickets_leftover']
            row['op_spendable'] = row['op_gained'] + yesterday['op_leftover']
        }

        // Spend resources for pulls
        const spendablesResources = {
            op: row['op_spendable'],
            tickets: row['tickets_spendable'],
            orundum: row['orundum_spendable'],
        }
        const pullsInclOP = convertResourcesToPulls(spendablesResources, true)
        const pullsExclOP = convertResourcesToPulls(spendablesResources, false)

        row['pulls_available_incl_op'] = pullsInclOP
        row['pulls_available_excl_op'] = pullsExclOP

        // Spend pulls but only up to the available total
        const pullsSpent = Math.min(pullsInclOP + pullsExclOP, maxPullsToday)

        if (pullsSpent > 0) {
            // Calculate resources spent from pulls
            const { spent, remaining } = convertPullsToResources(spendablesResources, pullsSpent)

            row['pulls_spent'] = pullsSpent

            // Set spent resources for pulls
            row['orundum_spent'] = spent.orundum
            row['tickets_spent'] = spent.tickets
            row['op_spent'] = spent.op

            // Save leftover resources after pulling
            row['orundum_leftover'] = remaining.orundum
            row['tickets_leftover'] = remaining.tickets
            row['op_leftover'] = remaining.op
        }
        // No pulls spent, so no resources spent
        else {
            row['pulls_spent'] = 0

            // Set spent resources for pulls
            row['orundum_spent'] = 0
            row['tickets_spent'] = 0
            row['op_spent'] = 0

            // Save leftover resources after pulling (same as spendable)
            row['orundum_leftover'] = row['orundum_spendable']
            row['tickets_leftover'] = row['tickets_spendable']
            row['op_leftover'] = row['op_spendable']
        }

        // Save resources spent from pulling (will be added to dt_all_resources)
        resourcesSpentFromPulling.push({
            day: row.day,
            resource: 1,
            amount: row.orundum_spent,
            confirmed: 1,
            source: 'pulls',
        })
        resourcesSpentFromPulling.push({
            day: row.day,
            resource: 2,
            amount: row.tickets_spent,
            confirmed: 1,
            source: 'pulls',
        })
        resourcesSpentFromPulling.push({
            day: row.day,
            resource: 3,
            amount: row.op_spent,
            confirmed: 1,
            source: 'pulls',
        })
    })

    // const dt_after_pulling = aq.from(res_gained_by_day)

    return (
        <main>
            <p>Rows (full): {dt_merged.objects().length}</p>
            <p>Rows (filtered): {dt_filtered.objects().length}</p>

            <Tabs dts={{
                '📅 Days': dt_days.objects(),
                '💰 Daily Certs': dt_certs.objects(),
                '🏦 User Resources': dt_user_resources.orderby('day').objects(),
                '🏦 All Resources': dt_all_resources.orderby('day').objects(),
                '🔄 Merged': dt_merged.objects(),
                '🔍 Filtered': dt_filtered.objects(),
                '💰 Resources Gained by Day': dt_res_gained_by_day.objects(),
                '💰 Res after pulling': res_gained_by_day,
            }} />

            {/* <TableDisplay rows={dt_days.objects()} />
            <TableDisplay rows={dt_events.objects()} />
            <TableDisplay rows={dt_resources.objects()} /> */}
        </main>
    )
}


function Tabs({ dts }: { dts: Record<string, any> }) {
    const [activeTab, setActiveTab] = useState(0)

    return (
        <div>
            {Object.entries(dts).map(([label, dt], i) => (
                <button key={i} onClick={() => setActiveTab(i)}>{label}</button>
            ))}
            {Object.values(dts).map((dt, i) => (
                activeTab === i && <TableDisplay key={i} rows={dt} />
            ))}
        </div>
    )
}



function TableDisplay({ rows }: { rows: Record<string, string | number>[] }) {
    if (rows.length === 0) return <p>No data</p>

    const headers = Object.keys(rows[0])

    return <table style={{ borderCollapse: 'collapse', border: '1px solid #000', textAlign: 'left', padding: '0.5rem' }}>
        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', borderBottom: '2px solid #000' }}>
            <tr style={{ border: '1px solid #000' }}>
                {headers.map(h => <th key={h} style={{ border: '1px solid #000', textAlign: 'left', padding: '0.5rem' }}>{h}</th>)}
            </tr>
        </thead>
        <tbody>
            {rows.map((row, i) => (
                <tr key={i}>
                    {Object.values(row).map((v, j) => (
                        <td key={j} style={{ border: '1px solid #ddd', textAlign: 'left', padding: '2px 5px' }}>{v}</td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
}