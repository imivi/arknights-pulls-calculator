import daysData from "../data/daily_resources.json"
import { Resources } from "./resources"
import { BaseValues, Day, resources, ResourcesGainedInfo, Settings, UserValues } from "../types"
import { convertPullsToResources, convertResourcesToPulls, sum } from "./utils"


export function getDays(): BaseValues[] {

    // Add data on event ops for every day of each event (instead of just the first day)
    // Maps the event_id with the list of event ops
    const allEventOps: Record<string, string[]> = {}
    for (const day of daysData) {
        if (day.event_id && day.event_ops.length > 0) {
            allEventOps[day.event_id] = day.event_ops
        }
    }

    const days: BaseValues[] = daysData.map(day => {

        const orundum = day.resourcesGained.orundum.map(res => ({ ...res }))
        const tickets = day.resourcesGained.tickets.map(res => ({ ...res }))
        const op = day.resourcesGained.op.map(res => ({ ...res }))

        const free_monthly_card = day.resourcesGained.orundum.findIndex(res => res.source === "free_monthly_card") >= 0

        const event_ops = (day.event_id && day.event_id in allEventOps) ? allEventOps[day.event_id] : []

        return {
            date: day.date,
            event_id: day.event_id,
            event_link: day.event_link,
            event_name: day.event_name,
            event_ops,
            eventDay: day.eventDay,
            freePulls: day.freePulls,
            free_monthly_card,
            rowSpan: 0,

            // To be calculated later
            // rowSpan: 0,
            // pullsSpent: 0,
            // pullsAvailable: 0,
            // pullsAvailableFromOP: 0,
            // pullsAvailableWithoutOP: 0,

            defaultResourcesInfo: { orundum, tickets, op }, // Resources that come from the google sheet values
        }
    })

    return [...days]
}




/** Ignore certain resources for F2P and reruns,
 *  and add orundum from purple certs for reruns.
 *  Also ignore all resources for the first today
 *  if it was marked as cleared.
 */
export function addUserData(baseDays: BaseValues[], settings: Settings): (BaseValues & UserValues)[] {

    const days: (BaseValues & UserValues)[] = []

    baseDays.forEach((today, i) => {

        const rewardsClaimed = i === 0 && settings.firstDayCleared
        const isRerun = today.event_id?.endsWith("rerun")
        const rerunCleared = today.event_id && settings.clearedReruns.includes(today.event_id)

        const activeResourcesInfo: ResourcesGainedInfo = {
            orundum: [],
            op: [],
            tickets: rewardsClaimed ? [] : [...today.defaultResourcesInfo.tickets].filter(info => info.value !== 0),
        }

        // Exclude some ORUNDUM sources
        activeResourcesInfo.orundum = rewardsClaimed ? [] : today.defaultResourcesInfo.orundum.filter(info => {

            // For F2P, exclude orundum from monthly card
            if (!settings.activeMonthlyCard && info.source === "monthly_card")
                return false

            // On reruns, exclude orundum (from purple certs) for first-timers
            if (isRerun && !rerunCleared && info.source === "intel")
                return false

            return info.value !== 0
        })

        // Exclude some OP sources
        activeResourcesInfo.op = rewardsClaimed ? [] : today.defaultResourcesInfo.op.filter(info => {

            if (info.value === 0)
                return false

            // On reruns, exclude stage OP rewards for veterans
            if (isRerun && rerunCleared && info.source === "event_stages") {
                return false
            }

            // For F2P, exclude OP from monthly card
            if (!settings.activeMonthlyCard && info.source === "monthly_card")
                return false

            return info.value !== 0
        })

        // Add custom user resources (spent or gained, e.g. OP from packs, tickets from gold certs store)
        if (today.date in settings.userResources) {
            const userResources = settings.userResources[today.date]
            for (const res of resources) {
                if (res in userResources) {
                    const { value, description } = userResources[res]
                    if (value !== 0) {
                        activeResourcesInfo[res].push({
                            value,
                            source: description || "other",
                        })
                    }
                }
            }
        }

        const spendablePulls = settings.spendablePulls[today.date] || 0

        days.push({
            ...today,
            rewardsClaimed,
            activeResourcesInfo,
            spendablePulls,
        })
    })

    return days
}



export function calculateDailyTotals(baseDays: (BaseValues & UserValues)[], settings: Settings): Day[] {

    const days: Day[] = []

    baseDays.forEach((today, i) => {

        const resourcesGainedToday = calculateResourcesGainedToday(today.activeResourcesInfo)
        const cumulativeResources = new Resources().copyFrom(resourcesGainedToday)

        // These are the cumulative resources, excluding the resources spent on pulls TODAY
        // const spendableResourcesGainedToday = calculateResourcesGainedToday(today.activeResourcesInfo, false)
        // const spendableResources = new Resources().copyFrom(spendableResourcesGainedToday)

        // If first day, cumulative = todays_resources + starting_resources
        if (i === 0) {
            cumulativeResources.add(settings.startingResources)
        }
        // If future day, cumulative = todays_resources + prev_days_resources
        else {
            const yesterday = days[i - 1]
            cumulativeResources.add(yesterday.cumulativeResources)
        }

        const cumulativeSpendableResources = cumulativeResources.clone()

        let pullsAvailableWithoutOP = convertResourcesToPulls(cumulativeResources, false)
        let pullsAvailableTotal = convertResourcesToPulls(cumulativeResources, true)

        // Spend pulls but only up to the available total
        const pullsSpent = Math.min(pullsAvailableTotal, today.spendablePulls)

        if (pullsSpent > 0) {
            // Calculate resources spent from pulls
            const { spent, remaining } = convertPullsToResources(cumulativeResources, pullsSpent)

            // Update resources based on pulls spent
            cumulativeResources.copyFrom(remaining)

            // Recalculate pulls available after spending resources
            // pullsAvailableWithoutOP = convertResourcesToPulls(cumulativeResources, false)
            // pullsAvailableTotal = convertResourcesToPulls(cumulativeResources, true)

            // Add info on spent resources (for tooltips)
            for (const res of resources) {
                const value = Math.abs(spent[res])
                if (value > 0) {
                    today.activeResourcesInfo[res].push({
                        value: -value,
                        source: "pulls",
                    })
                }
            }

            resourcesGainedToday.subtract(spent)
        }

        const pullsAvailableFromOP = pullsAvailableTotal - pullsAvailableWithoutOP

        days.push({
            ...today,
            resourcesGainedToday,
            cumulativeResources,
            cumulativeSpendableResources,

            pullsAvailableTotal,
            pullsAvailableFromOP,
            pullsAvailableWithoutOP,
            pullsSpent,
        })
    })

    return days
}


function calculateResourcesGainedToday(resourcesInfo: ResourcesGainedInfo): Resources {

    const orundum = sum(resourcesInfo.orundum)
    const tickets = sum(resourcesInfo.tickets)
    const op = sum(resourcesInfo.op)

    return new Resources(orundum, tickets, op)
}