import { Resources, DateString, DailyResource, ResourceGained, ResourcesGained, DayWithResources } from "./types"

export function getValidDates(dailyResources: DailyResource[]) {
    const allDates = new Set<string>()
    for (const day of dailyResources) {
        allDates.add(day.day)
    }

    const dates = Array.from(allDates).sort()

    const today = new Date()
    for (let i = 0; i < dates.length; i++) {
        if (dateIsAfter(today, new Date(dates[i]))) {
            return dates.slice(i)
        }
    }

    throw new Error("No valid dates found!")
}

/** Returns true if date B is after date A */
function dateIsAfter(a: Date, b: Date): boolean {
    return b.getTime() > a.getTime()
}


/** Calculate the cumulative resources for each day */
export function getDaysWithResources(startingResources: Resources, days: DateString[], dailyResources: Record<string, DailyResource>): DayWithResources[] {
    const resourcesPerDay: DayWithResources[] = []

    let prevResources = startingResources

    for (const day of days) {
        const cumulativeResources = calculateResourcesPerDay(day, prevResources, dailyResources)
        const event = dailyResources[day]
        resourcesPerDay.push({
            ...event,
            cumulativeResources,
            dateString: day,
            rowSpan: 0,
            eventDay: 0,
            freePulls: 0,
        })
        prevResources = cumulativeResources
    }

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


export function getNextDays(days: number): DateString[] {
    const dates = []
    for (let i = 0; i < days; i++) {
        const date = (new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000))
        dates.push(date.toISOString().slice(0, 10))
    }
    return dates
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
