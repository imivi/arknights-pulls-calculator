import dayjs from "dayjs"
import { Resources, DateString, DailyResource, ResourceGained, ResourcesGained, DayWithResources } from "./types"


export function getValidDates(dailyResources: DailyResource[]) {

    // Get all dates from calendar in YYYY-MM-DD format (no duplicates)
    const allDates = new Set<string>()
    for (const day of dailyResources) {
        allDates.add(day.day)
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

/** Calculate the cumulative resources for each day */
export function getDaysWithResources(startingResources: Resources, validDays: DateString[], dailyResources: Record<string, DailyResource>, ignoreFirstDayResources: boolean): DayWithResources[] {
    const resourcesPerDay: DayWithResources[] = []

    let prevResources = startingResources

    validDays.forEach((dayString, i) => {

        const firstDay = i === 0
        const day = dailyResources[dayString]

        if (firstDay && ignoreFirstDayResources) {
            // console.log({ firstDay, ignoreFirstDayResources, day })
            day.clearResources()
        }

        let cumulativeResources = calculateResourcesPerDay(dayString, prevResources, dailyResources)

        resourcesPerDay.push({
            event_id: day.event_id,
            description: day.description,
            resourcesGained: day.resourcesGained,
            totalResources: day.totalResources,
            cumulativeResources,
            dateString: dayString,
            rowSpan: 0,
            eventDay: 0,
            freePulls: 0,
            freeMonthlyCard: day.freeMonthlyCard,
        })
        prevResources = cumulativeResources
    })

    // Add event days
    let eventDay = 0
    for (let i = 1; i < resourcesPerDay.length; i++) {
        const currentDay = resourcesPerDay[i]
        const previousDay = resourcesPerDay[i - 1]

        const firstDayOfEvent = currentDay.event_id && !previousDay.event_id
        const nonFirstDayOfEvent = currentDay.event_id && (currentDay.event_id === previousDay.event_id)

        if (firstDayOfEvent) {
            eventDay = 1
            currentDay.eventDay = eventDay
        }

        else if (nonFirstDayOfEvent) {
            eventDay += 1
            currentDay.eventDay = eventDay
        }

        else {
            eventDay = 0
        }
    }

    // Calculate free pulls
    for (const day of resourcesPerDay) {
        if (day.event_id?.endsWith("_lim")) {
            if (day.eventDay === 1)
                day.freePulls = 11
            else if (day.eventDay <= 14)
                day.freePulls = 1
        }
    }

    return resourcesPerDay
}



function calculateResourcesPerDay(day: DateString, previousDayResources: Resources, events: Record<string, DailyResource>): Resources {

    const res = previousDayResources.clone()

    if (day in events) {
        res.add(events[day].totalResources)

    }

    return res
}


type Row = {
    description: string | undefined
    event_id: string | undefined
    rowSpan: number
}
export function calculateRowSpan(rows: Row[]) {

    const rowSpans: Record<string, number> = {}

    for (const row of rows) {
        if (row.description) {
            if (!(row.description in rowSpans)) {
                rowSpans[row.description] = 0
            }
            rowSpans[row.description] += 1
        }
    }

    for (const row of rows) {
        if (!row.description) {
            row.rowSpan = 1
        }
        else if (row.description in rowSpans) {
            row.rowSpan = rowSpans[row.description]
            rowSpans[row.description] = 0
        }
    }
}


export function sum(resources: ResourceGained[]): number {
    let total = 0
    for (const res of resources) {
        total += res.value
    }
    return total
}

export function sumResources(res: ResourcesGained): Resources {

    return new Resources(
        sum(res.orundum),
        sum(res.tickets),
        sum(res.op),
    )
}
