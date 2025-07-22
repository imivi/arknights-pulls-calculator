import daysData from "./data/daily_resources.json"
import { Resources } from "./resources"
import { BasicResources } from "./types"
import { Day } from "./day"
import { convertResourcesToPulls, sum } from "./utils"


export function getDays(): Day[] {

    const days: Day[] = daysData.map(day => {

        // Add toggles for OP/orundum from reruns
        const orundum = day.resourcesGained.orundum.map(res => ({ ...res, enabled: true }))
        const tickets = day.resourcesGained.tickets.map(res => ({ ...res, enabled: true }))
        const op = day.resourcesGained.op.map(res => ({ ...res, enabled: true }))

        return {
            date: day.date,
            event_id: day.event_id,
            event_link: day.event_link,
            event_name: day.event_name,
            event_ops: day.event_ops,
            free_monthly_card: day.free_monthly_card,
            eventDay: day.eventDay,
            freePulls: day.freePulls,

            // To be calculated later
            rowSpan: 0,
            pullsSpent: 0,
            pullsAvailable: 0,
            pullsAvailableFromOP: 0,
            pullsAvailableWithoutOP: 0,
            resourcesInfo: {
                orundum,
                tickets,
                op,
            },
            resourcesToday: new Resources(), // Depends on "f2p" and "monthly_card"
            resourcesTotal: new Resources(),
            resourcesSpendable: new Resources(),
            resourcesSpent: new Resources(),
        }
    })

    return days
}


export function calculatePullsAvailable(days: Day[]) {

    for (const day of days) {
        day.pullsAvailable = convertResourcesToPulls(day.resourcesTotal, true)
        day.pullsAvailableWithoutOP = convertResourcesToPulls(day.resourcesTotal, false)
        day.pullsAvailableFromOP = day.pullsAvailable - day.pullsAvailableWithoutOP
    }

    return [...days]
}


export function calculateSpentPulls(days: Day[], resourcesSpent: Record<string, BasicResources>) {
    for (const day of days) {
        if (day.date in resourcesSpent) {
            day.pullsSpent = convertResourcesToPulls(resourcesSpent[day.date], true)
            const { op, orundum, tickets } = resourcesSpent[day.date]
            day.resourcesSpent.set(orundum, tickets, op)
        }
        else {
            day.pullsSpent = 0
            day.resourcesSpent.set(0, 0, 0)
        }

    }
    return [...days]
}


export function deductResourcesSpent(days: Day[], resourcesSpent: Record<string, BasicResources>) {

    days.forEach((today, i) => {

        if (i === days.length - 1)
            return

        const tomorrow = days[i + 1]

        if (!(today.date in resourcesSpent))
            return

        const resourcesToDeduct = resourcesSpent[today.date]

        const source = "pulls"
        // const description = resourceLabels[source]

        // Update information on resources spent
        for (const res of ["orundum", "tickets", "op"] as const) {

            const amount = resourcesToDeduct[res]

            const oldResInfo = tomorrow.resourcesInfo[res].filter(info => info.source !== source)

            // Remove info about spent resources
            if (amount === 0) {
                tomorrow.resourcesInfo[res] = [...oldResInfo]
                tomorrow.resourcesSpent[res] = 0
            }

            // Or add info about spent resources
            else if (amount > 0) {
                tomorrow.resourcesInfo[res] = [
                    ...oldResInfo,
                    { source, value: -amount, enabled: true },
                ]
                tomorrow.resourcesSpent[res] = amount
            }
        }
    })

    return [...days]
}

/** Calculate all resources gained each day (not cumulative) */
export function calculateDailyResources(days: Day[]) {

    for (const day of days) {
        const orundum = sum(day.resourcesInfo.orundum)
        const tickets = sum(day.resourcesInfo.tickets)
        const op = sum(day.resourcesInfo.op)
        day.resourcesToday.set(orundum, tickets, op)
    }

    return [...days]
}


/** Calculate all resources gained each day (not cumulative) */
export function calculateCumulativeResources(days: Day[], startingResources: Resources) {

    days.forEach((day, i) => {
        if (i === 0) {
            day.resourcesTotal = day.resourcesToday.clone().add(startingResources)
            // day.resourcesToday.add({ op: 0, orundum: 1, tickets: 0 })
            // day.resourcesTotal = day.resourcesToday.clone()
            // console.log({ i, day, startingResources, res: day.resourcesToday })
            // day.resourcesSpendable = day.resourcesTotal.clone()
        }
        else {
            const totalResourcesYesterday = days[i - 1].resourcesTotal
            day.resourcesTotal = new Resources().add(day.resourcesToday).add(totalResourcesYesterday)
            // day.resourcesSpendable.set(0, 0, 0).add(totalResourcesYesterday).add(day.resourcesToday).subtract(day.resourcesSpent)
        }
    })

    return [...days]
}


/** Ignore certain resources for F2P and reruns, and add orundum from purple certs for reruns */
export function filterGainedResources(days: Day[], f2p: boolean, clearedReruns: string[]) {

    for (const day of days) {

        // (F2P) Ignore resources from monthly card
        const ignoreMonthlyCardResources = f2p && !day.free_monthly_card

        day.resourcesInfo.orundum.forEach(res => {
            if (res.source === "monthly_card")
                res.enabled = !ignoreMonthlyCardResources
        })
        day.resourcesInfo.op.forEach(res => {
            if (res.source === "monthly_card")
                res.enabled = !ignoreMonthlyCardResources
        })

        // (Reruns) If this event has been cleared before...
        const eventHasBeenClearedBefore = !!day.event_id && clearedReruns.includes(day.event_id)

        // ...ignore OP sources from event stages...
        // day.resourcesInfo.op = [...day.resourcesInfo.op.filter(res => res.source !== "event_stages")]
        day.resourcesInfo.op.forEach(res => {
            if (res.source === "event_stages")
                res.enabled = !eventHasBeenClearedBefore
        })

        // ...and add orundum from purple certs (2k orundum per rerun)
        day.resourcesInfo.orundum.forEach(res => {
            if (res.source === "intel")
                res.enabled = eventHasBeenClearedBefore
        })
    }

    return [...days]
}


type Item = {
    eventDay: number
    freePulls: number
    event_id?: string
}

export function addEventDays<T extends Item>(days: T[]) {

    /*
    If this day has the same event as the previous day, set the same event + 1
    If this day has an event but the prev didn't, set 1
    If this day does not have an event, set 0
    */

    days.forEach((today, i) => {

        const yesterday = days[i - 1]

        if (i === 0 || !yesterday?.event_id)
            return today.eventDay = today.event_id ? 1 : 0

        // If this day has no events, the day is 0
        if (!today.event_id)
            return today.eventDay = 0

        // If this day has the same event as the previous day, today is yesterday + 1
        if (today.event_id === yesterday.event_id)
            return today.eventDay = yesterday.eventDay + 1

        // If this day has a different event from the previous day, today is 1
        if (today.event_id !== yesterday.event_id)
            return today.eventDay = 1
    })

    return [...days]
}

export function addFreePulls<T extends Item>(days: T[]) {

    days.forEach(today => {
        const isLimitedEvent = !!today.event_id && today.event_id.endsWith("_lim")
        if (isLimitedEvent) {
            if (today.eventDay === 1)
                today.freePulls = 11
            else if (today.eventDay <= 14)
                today.freePulls = 1
        }
    })

    return [...days]
}

export function toggleFirstDayResources(days: Day[], enabled: boolean): Day[] {
    if (days.length === 0)
        return days

    for (const res of ["orundum", "tickets", "op"] as const) {
        for (const info of days[0].resourcesInfo[res]) {
            info.enabled = enabled
        }
    }
    return [...days]
}