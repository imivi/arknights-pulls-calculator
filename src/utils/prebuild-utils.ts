import { getEventImageColors } from "../scripts/get-image-colors"
import { GoogleSheetRow } from "../scripts/types"
import { Resource, resources } from "../types"

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

        const isCollabEvent = !!today.event_id && today.event_id.endsWith("_collab")
        if (isCollabEvent && (today.eventDay === 1 || today.eventDay === 8)) {
            today.freePulls = 10
        }
    })

    return [...days]
}

/** Extracts weekday (1=monday, 7=sunday) from YYYY-MM-DD date */
export function getWeekday(dateStr: string): number {
    const date = new Date(dateStr)
    const day = date.getDay()
    // Adjust so Monday = 1, ..., Sunday = 7
    return day === 0 ? 7 : day;
}


export type Event = {
    first_day: string
    last_day: string
    duration_days: number
    id: string
    title: string
    event_ops: string
    event_link: string
    is_rerun: number
    is_limited: number
    is_collab: number
    date_confirmed: number
    // already_cleared: string
    color_dark_hex: string
    color_dark_hue: number
    color_dark_sat: number
    color_dark_light: number
    color_light_hex: string
    color_light_hue: number
    color_light_sat: number
    color_light_light: number
}

async function rowGroupToEvent(rows: GoogleSheetRow[]): Promise<Event> {

    const event_id = rows[0].event_id!
    const dates = rows.map(row => row.day).sort()
    const first_day = dates[0]
    const last_day = dates[dates.length - 1]
    const duration_days = dates.length
    const colors = await getEventImageColors(event_id)
    const event_title = rows[0].event!

    return {
        id: event_id,
        date_confirmed: event_title.endsWith("(TBD)") ? 0 : 1,
        is_limited: Number(event_id.includes("_lim")),
        is_rerun: Number(event_id.includes("_rerun")),
        is_collab: Number(event_id.includes("_collab")),
        title: event_title,
        event_ops: rows[0].event_ops!,
        event_link: rows[0].event_link!,
        first_day,
        last_day,
        duration_days,
        ...colors,
    }
}

export async function extractEvents(rows: GoogleSheetRow[]) {

    // 1. keep only rows with events
    const rowsWithEvents = rows.filter(row => !!row.event_id)


    // 2. group rows by event_id
    const rowsGroupedByEvent = rowsWithEvents.reduce((acc: Record<string, GoogleSheetRow[]>, row) => {
        const key = row.event_id!

        // If the date key doesn't exist yet, initialize it with an empty array
        if (!acc[key]) {
            acc[key] = []
        }

        // Push the value into the array for that date
        acc[key].push(row)

        return acc
    }, {})

    // 3. for each group (event), get date range, event duration, and image colors
    const events = await Promise.all(Object.values(rowsGroupedByEvent).map(rows => rowGroupToEvent(rows)))

    // console.log('events:', events)
    return events
}


export type ResourceGained = {
    day: string
    resource: Resource
    amount: number
    source: string
    confirmed: number
}

/** Read a row from google sheest and extract each resource gained */
export function extractResourcesGained(row: GoogleSheetRow): ResourceGained[] {

    const resourceColumns = Object.keys(row).filter(column => column.includes(":"))

    const resourcesGained = resourceColumns.map(column => {

        const [res, source] = column.split(":") // Column name
        const amount = row[column as keyof GoogleSheetRow] as number // Cell value

        if (!resources.includes(res as any)) {
            throw new Error(`Invalid resource: ${res} not in ${resources}`)
        }

        return {
            amount,
            confirmed: 1,
            day: row.day,
            resource: res as Resource,
            source,
        }
    })

    return resourcesGained.filter(res => res.amount > 0)
}


/** Convert array of objects into an object of arrays */
export function transpose(items: Record<string, any>[]): Record<string, any[]> {
    const output: Record<string, any[]> = {}

    // Initialize
    for (const key of Object.keys(items[0])) {
        output[key] = []
    }

    for (const item of items) {
        for (const key of Object.keys(item)) {
            output[key].push(item[key])
        }
    }

    return output
}

export function partiallyIndentJson(jsonText: string): string {

    const singleIndent = "\n    "
    const doubleIndent = "\n        "

    const indentations: Record<string, string> = {

        // "{": "\n",
        // "}": "\n",

        "days": singleIndent,
        "day": doubleIndent,
        "weekday": doubleIndent,

        "events": singleIndent,
        "id": doubleIndent,
        "date_confirmed": doubleIndent,
        "is_limited": doubleIndent,
        "is_rerun": doubleIndent,
        "is_collab": doubleIndent,
        "title": doubleIndent,
        "event_ops": doubleIndent,
        "event_link": doubleIndent,
        "first_day": doubleIndent,
        "color_dark_hex": doubleIndent,
        "color_dark_hue": doubleIndent,
        "color_dark_sat": doubleIndent,
        "color_dark_light": doubleIndent,
        "color_light_hex": doubleIndent,
        "color_light_hue": doubleIndent,
        "color_light_sat": doubleIndent,
        "color_light_light": doubleIndent,

        "resources": singleIndent,
        "amount": doubleIndent,
        "confirmed": doubleIndent,
        "resource": doubleIndent,
        "source": doubleIndent,
    }

    for (const key of Object.keys(indentations)) {
        const before = `"${key}":`
        const after = indentations[key] + `"${key}":`
        jsonText = jsonText.replaceAll(before, after)
    }

    jsonText = jsonText.replaceAll("}", "\n    }")

    return jsonText
}
