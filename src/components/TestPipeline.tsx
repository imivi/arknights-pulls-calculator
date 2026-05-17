import { useState } from "react"
import tables from "../data/tables.json"
import * as aq from 'arquero'
import { AllUserResources } from "../stores/useUserResourcesStore"

type Resource = {
    amount: number
    confirmed: number
    day: string
    resource: number
    source: string
}

function getDailyCertsResources(certsPerDay: number): Resource[] {

    // Add certs from daily recruitment
    if (certsPerDay === 0)
        return []

    const dailyCerts: Resource[] = []
    for (const day of tables.days.day) {
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

    const dt_cleared_reruns = aq.from(userSettings.clearedReruns.map(id => ({ event_id: id, cleared_rerun: 1 })))
    const dt_max_pulls = aq.from(Object.entries(userSettings.maxPullsToSpend).map(([day, amount]) => ({ day, max_pulls: amount })))

    const dt_days = aq.table(days)
    const dt_events = aq.table(events)
    const dt_event_days = aq.table(eventDays)

    const dt_resources = aq.table(resources)
    // console.log(getDailyCertsResources(1.5))
    const dt_certs = aq.from(getDailyCertsResources(userSettings.certsPerDay))
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
            '1': 'orundum',
            '2': 'tickets',
            '3': 'op',
            '4': 'certs',
        })
        // Fill missing values with 0
        .derive({
            orundum: d => d.orundum ?? 0,
            tickets: d => d.tickets ?? 0,
            op: d => d.op ?? 0,
            certs: d => d.certs ?? 0,
        })
        .join_left(dt_max_pulls, 'day')
        .derive({
            max_pulls: d => d.max_pulls ?? 0,
        })
        .orderby('day')

    // loop over each day to calculate spent resources and cumulative total resources
    // (insert resource spending values into resources_gained table)

    // ...

    return (
        <main>
            <p>Rows (full): {dt_merged.objects().length}</p>
            <p>Rows (filtered): {dt_filtered.objects().length}</p>

            <Tabs dts={{
                'Daily Certs': dt_certs.objects(),
                'User Resources': dt_user_resources.orderby('day').objects(),
                'All Resources': dt_all_resources.orderby('day').objects(),
                'Merged': dt_merged.objects(),
                'Filtered': dt_filtered.objects(),
                'Resources Gained by Day': dt_res_gained_by_day.objects(),
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
                {headers.map(h => <th style={{ border: '1px solid #000', textAlign: 'left', padding: '0.5rem' }}>{h}</th>)}
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