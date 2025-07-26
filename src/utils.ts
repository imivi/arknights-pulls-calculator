import dayjs from "dayjs"
import { BasicResources, ResourceGained } from "./types"
import { PullCalculator } from "./pull-calculator"
import { Resources } from "./resources"



export function convertResourcesToPulls(res: BasicResources, useOP: boolean): number {
    const calc = new PullCalculator(res).spendTickets().spendOrundum()

    if (useOP)
        calc.convertOP()

    return calc.getPulls()
}

export function convertPullsToResources(startingResources: BasicResources, pulls: number): { spent: BasicResources, remaining: BasicResources } {

    const calc = new PullCalculator(startingResources)
    calc.spendTickets(pulls)
    calc.spendOrundum(pulls - calc.getPulls())
    calc.convertOP(pulls - calc.getPulls())

    const resRemaining = calc.res
    const resStart = new Resources(startingResources.orundum, startingResources.tickets, startingResources.op)
    const resSpent = resStart.clone().subtract(resRemaining)

    return {
        spent: resSpent,
        remaining: resRemaining,
    }
}

export function getValidDates(days: string[]): string[] {

    // Get all dates from calendar in YYYY-MM-DD format (remove duplicates)
    const allDates = new Set<string>()
    for (const day of days) {
        allDates.add(day)
    }

    // Sort the dates
    const dates = Array.from(allDates).sort()

    // Remove all dates older than today
    const today = getLocalISODate()
    for (let i = 0; i < dates.length; i++) {
        const isPastDate = today <= dates[i]

        if (isPastDate) {
            return dates.slice(i)
        }
    }

    throw new Error("No valid dates found!")
}


/** Get the CURRENT (not ISO) date in YYYY-MM-DD format */
function getLocalISODate() {
    return dayjs().format("YYYY-MM-DD")
}


type Row = {
    event_id: string | undefined
    rowSpan: number
}

export function calculateRowSpan<T extends Row>(rows: T[]) {

    // Get day count for each event
    const rowSpans: Record<string, number> = {}

    for (const row of rows) {
        if (row.event_id) {
            if (!(row.event_id in rowSpans)) {
                rowSpans[row.event_id] = 0
            }
            rowSpans[row.event_id] += 1
        }
    }

    // Set the rowspan of the first day of each event to the event days,
    // set the other days to 0
    for (const row of rows) {
        if (!row.event_id) {
            row.rowSpan = 1
        }
        else if (row.event_id in rowSpans) {
            row.rowSpan = rowSpans[row.event_id]
            rowSpans[row.event_id] = 0
        }
    }

    return [...rows]
}


export function sum(resources: ResourceGained[]): number {
    let total = 0
    for (const res of resources) {
        if (res.enabled)
            total += res.value
    }
    return total
}


export function formatOrundum(n: number): string {
    if (n > 0 && n < 1000)
        return n.toFixed(0)
    else
        return (n / 1000).toFixed(1) + "k"
}


export function constrain(num: number, min: number, max: number) {
    if (num > max)
        return max
    if (num < min)
        return min
    return num
}