import daysData from "../data/daily_resources.json"
import { Resources } from "./resources"
import { BasicResources } from "../types"
import { Day } from "../day"
import { convertResourcesToPulls, sum } from "./utils"
import { AllUserResources } from "../stores/useUserResourcesStore"


export function getDays(): Day[] {

    const days: Day[] = daysData.map(day => {

        // Include toggles for OP/orundum from reruns ("enabled" field)
        const orundum = day.resourcesGained.orundum.map(res => ({ ...res, enabled: true }))
        const tickets = day.resourcesGained.tickets.map(res => ({ ...res, enabled: true }))
        const op = day.resourcesGained.op.map(res => ({ ...res, enabled: true }))

        const free_monthly_card = day.resourcesGained.orundum.findIndex(res => res.source === "free_monthly_card") >= 0

        return {
            date: day.date,
            event_id: day.event_id,
            event_link: day.event_link,
            event_name: day.event_name,
            event_ops: day.event_ops,
            eventDay: day.eventDay,
            freePulls: day.freePulls,
            free_monthly_card,

            // To be calculated later
            rowSpan: 0,
            pullsSpent: 0,
            pullsAvailable: 0,
            pullsAvailableFromOP: 0,
            pullsAvailableWithoutOP: 0,

            resourcesInfoDefault: { orundum, tickets, op }, // Resources that come from the google sheet values
            resourcesFromPulls: { orundum: [], tickets: [], op: [] }, // Resources deducted from pulling
            resourcesFromCustomSources: { orundum: [], tickets: [], op: [] }, // Resources gained/added manually by the user

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

    const resources = ["orundum", "tickets", "op"] as const

    days.forEach((today, i) => {

        if (i === days.length - 1)
            return

        const tomorrow = days[i + 1]

        if (!(today.date in resourcesSpent))
            return

        const resourcesToDeduct = resourcesSpent[today.date]

        const source = "pulls"

        // Update information on resources spent
        for (const res of resources) {

            const amount = resourcesToDeduct[res]

            // Add info about spent resources
            tomorrow.resourcesFromPulls[res] = [
                { source, value: -amount, enabled: true },
            ]
        }
    })

    return [...days]
}

export function applyUserResources(days: Day[], userResources: AllUserResources) {

    const resources = ["orundum", "tickets", "op"] as const

    days.forEach(today => {

        if (!(today.date in userResources))
            return

        const userRes = userResources[today.date]

        // Update information on resources spent (orundum not supported)
        for (const res of resources) {

            if (!(res in userRes))
                continue

            const { value, description } = userRes[res]

            // Replace previous information
            today.resourcesFromCustomSources[res] = [
                {
                    source: description,
                    value,
                    enabled: true,
                }
            ]
        }
    })

    return [...days]
}

/** Calculate all resources gained each day (not cumulative) */
export function calculateDailyResources(days: Day[]) {

    for (const day of days) {
        const orundum = sum(day.resourcesInfoDefault.orundum) + sum(day.resourcesFromPulls.orundum) + sum(day.resourcesFromCustomSources.orundum)
        const tickets = sum(day.resourcesInfoDefault.tickets) + sum(day.resourcesFromPulls.tickets) + sum(day.resourcesFromCustomSources.tickets)
        const op = sum(day.resourcesInfoDefault.op) + sum(day.resourcesFromPulls.op) + sum(day.resourcesFromCustomSources.op)
        day.resourcesToday.set(orundum, tickets, op)
    }

    return [...days]
}


/** Calculate all resources gained each day (not cumulative) */
export function calculateCumulativeResources(days: Day[], startingResources: Resources) {

    days.forEach((day, i) => {
        if (i === 0) {
            day.resourcesTotal = day.resourcesToday.clone().add(startingResources)
        }
        else {
            const totalResourcesYesterday = days[i - 1].resourcesTotal
            day.resourcesTotal = new Resources().add(day.resourcesToday).add(totalResourcesYesterday)
        }
    })

    return [...days]
}


/** Ignore certain resources for F2P and reruns, and add orundum from purple certs for reruns */
export function filterGainedResources(days: Day[], f2p: boolean, clearedReruns: string[]) {

    for (const day of days) {

        // (F2P) Ignore resources from monthly card
        const includeMonthlyCardResources = !f2p

        day.resourcesInfoDefault.orundum.forEach(res => {
            if (res.source === "monthly_card")
                res.enabled = includeMonthlyCardResources
        })
        day.resourcesInfoDefault.op.forEach(res => {
            if (res.source === "monthly_card")
                res.enabled = includeMonthlyCardResources
        })

        // (Reruns) If this event has been cleared before...
        const eventHasBeenClearedBefore = !!day.event_id && clearedReruns.includes(day.event_id)

        // ...ignore OP sources from event stages...
        // day.resourcesInfo.op = [...day.resourcesInfo.op.filter(res => res.source !== "event_stages")]
        day.resourcesInfoDefault.op.forEach(res => {
            if (res.source === "event_stages")
                res.enabled = !eventHasBeenClearedBefore
        })

        // ...and add orundum from purple certs (2k orundum per rerun)
        day.resourcesInfoDefault.orundum.forEach(res => {
            if (res.source === "intel")
                res.enabled = eventHasBeenClearedBefore
        })
    }

    return [...days]
}


export function toggleFirstDayResources(days: Day[], enabled: boolean): Day[] {
    if (days.length === 0)
        return days

    for (const res of ["orundum", "tickets", "op"] as const) {
        for (const info of days[0].resourcesInfoDefault[res]) {
            info.enabled = enabled
        }
    }
    return [...days]
}