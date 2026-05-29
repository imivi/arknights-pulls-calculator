import * as aq from 'arquero'
import { ResourceAdjustments } from "../stores/useResourceAdjustmentsStore"
import dayjs from "dayjs"
import { convertPullsToResources, convertResourcesToPulls } from "./utils"
import { CalendarRow, UserSettings } from '../types'


type EventDaysTable = {
    day: string[]
    event_id: string[]
    day_of_event: number[]
}

type ResourcesTable = {
    amount: number[]
    confirmed: number[]
    day: string[]
    resource: number[]
    source: string[]
}


type Tables = {
    days: Record<string, any[]>,
    events: Record<string, any[]>,
    eventDays: EventDaysTable,
    resources: ResourcesTable
}


export function runPipeline(userSettings: UserSettings, tables: Tables) {

    const todayStr = dayjs().format('YYYY-MM-DD')

    const dt_cleared_reruns = aq.table({
        event_id: userSettings.clearedReruns,
        cleared_rerun: userSettings.clearedReruns.map(_ => 1),
    })

    const dt_max_pulls = aq.table({
        day: Object.keys(userSettings.maxPullsToSpend),
        user_max_pulls: Object.values(userSettings.maxPullsToSpend),
    })

    const dt_days = aq.table(tables.days)
        .params({ today: todayStr })
        .filter((d: any, params: any) => d.day >= params.today) // Only include days from today onwards
    const dt_events = aq.table(tables.events)
    const dt_event_days = aq.table(tables.eventDays)

    const dt_resources = aq.table(tables.resources)
    // console.log(getDailyCertsResources(1.5))
    const dt_certs = aq.from(getDailyCertsResources(userSettings.certsPerDay, dt_days.objects().map((d: any) => d.day)))
    const dt_res_adjustments = aq.from(getDailyUserResources(userSettings.resourceAdjustments))
    const dt_res_farming = aq.from({
        day: dt_days.objects().map((d: any) => d.day),
        orundum: Array(dt_days.count()).fill(userSettings.orundumPerDay), // make array
    })
    const dt_all_resources = dt_resources
        .concat(dt_certs)
        .params({ claimedDay: userSettings.claimedDay })
        .filter((d: any, params: any) => !params.claimedDay || d.day !== params.claimedDay)
        .concat(dt_res_adjustments)

    // console.log(dt_all_resources.filter(row => row.resource === 4).objects())

    const dt_merged = dt_days
        .join_left(dt_event_days, 'day')
        .join_left(dt_events, 'event_id')
        .join_left(dt_cleared_reruns, 'event_id')
        .join_left(dt_all_resources, 'day')
        .derive({
            // Fill missing values with 0
            cleared_rerun: (d: any) => d.cleared_rerun ?? 0,
            // Add info on monthly card
            has_monthly_card: userSettings.monthlyCard ? 1 : 0,
        })
        .orderby('day')


    const dt_filtered = dt_merged
        // If user is F2P, exclude resources from monthly cards
        .filter((row: any) => row.source !== 'monthly_card' || row.has_monthly_card === 1)
        // If user cleared reruns, exclude resources from those days
        .filter((row: any) => row.source !== "event_stages" || row.cleared_rerun === 0)
        // If user did not clear a rerun, exclude the orundum from intel certs
        .filter((row: any) => !(row.source === "intel" && row.cleared_rerun === 0))
        // If user did not clear a rerun, exclude the certs from welfare tokens
        .filter((row: any) => !(row.source === "tokens" && row.cleared_rerun === 0))


    const dt_res_gained_by_day = dt_filtered
        .select(['day', 'resource', 'amount'])
        // Sum the same resources for each day
        .groupby('day', 'resource')
        .rollup({ amount: (d: any) => aq.op.sum(d.amount) })
        // Pivot to create columns for each resource
        .groupby('day')
        .pivot(
            { key: (d: any) => d.resource },
            { value: (d: any) => aq.op.sum(d.amount) }
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
            orundum_gained: (d: any) => d.orundum_gained ?? 0,
            tickets_gained: (d: any) => d.tickets_gained ?? 0,
            op_gained: (d: any) => d.op_gained ?? 0,
            certs_gained: (d: any) => d.certs_gained ?? 0,
        })
        .join_left(dt_max_pulls, 'day')
        .derive({
            user_max_pulls: (d: any) => d.user_max_pulls ?? 0,
        })
        .orderby('day')

    // loop over each day to calculate spent resources and cumulative total resources
    // (insert resource spending values into resources_gained table)


    // console.log(dt_res_gained_by_day.objects())
    // throw new Error('debug')




    const res_gained_by_day = dt_res_gained_by_day.objects()

    const resourcesSpentFromPulling: ResourceChange[] = []

    res_gained_by_day.forEach((row: CalendarRow, i: number) => {

        const today = (i === 0)

        const maxPullsToday: number = row.user_max_pulls

        if (today) {
            row['orundum_spendable'] = row['orundum_gained'] + userSettings.startingOrundum
            row['tickets_spendable'] = row['tickets_gained'] + userSettings.startingTickets
            row['op_spendable'] = row['op_gained'] + userSettings.startingOp

            // console.log({ certs_gained: row['certs_gained'], startingCerts: userSettings.startingCerts })
            row['certs_leftover'] = row['certs_gained'] + userSettings.startingCerts
        }
        else {
            const yesterday = res_gained_by_day[i - 1]
            row['orundum_spendable'] = row['orundum_gained'] + yesterday['orundum_leftover']
            row['tickets_spendable'] = row['tickets_gained'] + yesterday['tickets_leftover']
            row['op_spendable'] = row['op_gained'] + yesterday['op_leftover']

            row['certs_leftover'] = yesterday['certs_leftover'] + row['certs_gained']
        }

        // Spend resources for pulls
        const spendablesResources = {
            orundum: row['orundum_spendable'],
            tickets: row['tickets_spendable'],
            op: userSettings.spendOp ? row['op_spendable'] : 0,
            certs: 0, // doesn't matter
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
            row['op_spent'] = userSettings.spendOp ? spent.op : 0

            // Save leftover resources after pulling
            row['orundum_leftover'] = remaining.orundum
            row['tickets_leftover'] = remaining.tickets
            row['op_leftover'] = userSettings.spendOp ? remaining.op : row['op_spendable']
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
        if (pullsSpent > 0) {
            resourcesSpentFromPulling.push({
                day: row.day,
                resource: 1,
                amount: -row.orundum_spent,
                confirmed: 1,
                source: 'pulls',
            })
            resourcesSpentFromPulling.push({
                day: row.day,
                resource: 2,
                amount: -row.tickets_spent,
                confirmed: 1,
                source: 'pulls',
            })
            resourcesSpentFromPulling.push({
                day: row.day,
                resource: 3,
                amount: -row.op_spent,
                confirmed: 1,
                source: 'pulls',
            })
        }
    })

    const dt_resources_spent_from_pulling = aq.from(resourcesSpentFromPulling)
    const dt_all_resources_incl_pulls = dt_all_resources.concat(dt_resources_spent_from_pulling).orderby('day')

    // Group resources gained/spentby day
    const all_resources_gained_or_spent_by_day: Record<string, ResourceChange[]> = {}
    dt_all_resources_incl_pulls.objects().forEach((row: any) => {
        if (!all_resources_gained_or_spent_by_day[row.day]) {
            all_resources_gained_or_spent_by_day[row.day] = []
        }
        all_resources_gained_or_spent_by_day[row.day].push({
            amount: row.amount,
            confirmed: row.confirmed,
            day: row.day,
            resource: row.resource,
            source: row.source,
        })
    })

    const dt_final_calendar = aq.from(res_gained_by_day)
        .join_left(dt_days, 'day')
        .join_left(dt_event_days, 'day')
        .join_left(dt_events, 'event_id')
        .orderby('day')
        .derive({
            max_pulls_leftover: (d: any) => aq.op.max(d.pulls_available_incl_op),
            max_orundum_leftover: (d: any) => aq.op.max(d.orundum_leftover),
            max_tickets_leftover: (d: any) => aq.op.max(d.tickets_leftover),
            max_op_leftover: (d: any) => aq.op.max(d.op_leftover),
            max_certs_leftover: (d: any) => aq.op.max(d.certs_leftover),
            max_pulls_spent: (d: any) => aq.op.max(d.pulls_spent),
            free_pulls: 0,
        })

    return {
        dt_merged,
        dt_filtered,
        dt_certs,
        dt_res_adjustments,
        dt_all_resources,
        dt_final_calendar,
        dt_all_resources_incl_pulls,
        dt_res_gained_by_day,
        res_gained_by_day,
        dt_days,
        dt_events,
        dt_event_days,
        dt_resources,
        dt_resources_spent_from_pulling,
        all_resources_gained_or_spent_by_day,
    }
}




export type ResourceChange = {
    amount: number
    confirmed: number
    day: string
    resource: number
    source: string
}

function getDailyCertsResources(certsPerDay: number, days: string[]): ResourceChange[] {

    // Add certs from daily recruitment
    if (certsPerDay === 0)
        return []

    const dailyCerts: ResourceChange[] = []
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


function getDailyUserResources(userResources: ResourceAdjustments): ResourceChange[] {
    const dailyUserResources: ResourceChange[] = []
    Object.entries(userResources).forEach(([key, adjustment]) => {
        if (!key.includes(':')) {
            throw new Error(`Invalid resource adjustment key: ${key}`)
        }
        const [day, resource] = key.split(':')
        const { amount, description } = adjustment

        // console.log({ day, resource, amount, description })

        if (resource == "orundum") {
            dailyUserResources.push({
                amount,
                confirmed: 1,
                day,
                resource: 1, // Orundum
                source: description,
            })
        }
        else if (resource == "tickets") {
            dailyUserResources.push({
                amount,
                confirmed: 1,
                day,
                resource: 2, // Tickets
                source: description,
            })
        }
        else if (resource == "op") {
            dailyUserResources.push({
                amount,
                confirmed: 1,
                day,
                resource: 3, // OP
                source: description,
            })
        }
        else if (resource == "certs") {
            dailyUserResources.push({
                amount,
                confirmed: 1,
                day,
                resource: 4, // Gold certs
                source: description,
            })
        }
    })
    return dailyUserResources
}
