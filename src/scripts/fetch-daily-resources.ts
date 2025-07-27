import PublicGoogleSheetsParser from 'public-google-sheets-parser'
import fs from "fs"
import z from "zod"
import { env } from '../env'
import { addEventDays, addFreePulls } from '../utils/prebuild-utils'
import { dataPaths } from './data-paths'


const rowSchema = z.object({
    "day": z.string(),
    "weekday": z.number(),
    "event": z.string().optional(),
    "event_id": z.string().optional(),
    "event_link": z.string().optional(),
    "event_ops": z.string().default(""),
    "free_monthly_card": z.number().default(0),
    "orundum:login_event": z.number().default(0),
    "orundum:fortune_strip": z.number().default(0),
    "orundum:anni": z.number().default(0),
    "orundum:new_anni": z.number().default(0),
    "orundum:store": z.number().default(0),
    "orundum:daily_missions": z.number().default(0),
    "orundum:weekly_missions": z.number().default(0),
    "orundum:monthly_card": z.number().default(0),
    "orundum:intel": z.number().default(0),
    "op:event_stages": z.number().default(0),
    "op:login_event": z.number().default(0),
    "op:monthly_card": z.number().default(0),
    "tickets:login": z.number().default(0),
    "tickets:store": z.number().default(0),
    "tickets:event_shop": z.number().default(0),
})

type Row = z.infer<typeof rowSchema>

const rowsSchema = z.array(rowSchema)


type ResourceGained = {
    value: number,
    source: string // e.g. "login_event"
}

function getResourceGained(row: Row, resource: "orundum" | "tickets" | "op"): ResourceGained[] {
    const resources: ResourceGained[] = []

    for (const [key, value] of Object.entries(row)) {
        if (!key.includes(":") || value === 0)
            continue

        const [res, source] = key.split(":")

        if (res !== resource)
            continue

        // const label = resourceLabels[source]
        // console.log(key, value, label, source)
        resources.push({
            // description: label,
            value: value as number,
            source,
        })
    }

    return resources.sort((a, b) => b.value - a.value)
}



function processRow(row: Row) {

    const orundum = getResourceGained(row, "orundum")
    const tickets = getResourceGained(row, "tickets")
    const op = getResourceGained(row, "op")

    const event_ops = row.event_ops === "" ? [] : row.event_ops.split(",").map(s => s.trim())

    const result = {
        date: row.day,
        event_name: row.event,
        event_id: row.event_id,
        event_link: row.event_link,
        event_ops,
        free_monthly_card: row.free_monthly_card === 1,
        resourcesGained: {
            orundum,
            tickets,
            op,
        },

        // To be calculated later
        eventDay: 0,
        freePulls: 0,
    }

    return result
}

function processRows(rows: Row[]) {
    const days = rows.map(row => processRow(row))
    addEventDays(days)
    addFreePulls(days)
    return days
}



async function fetchRows(googleSheetId: string) {
    const parser = new PublicGoogleSheetsParser(googleSheetId, {
        useFormattedDate: false,
    })
    const rows = await parser.parse()
    return rowsSchema.parse(rows)
}


async function fetchDailyResources() {
    const googleSheetId = env.GOOGLE_SHEET_ID
    const rows = await fetchRows(googleSheetId)
    fs.writeFileSync(dataPaths.rawGoogleSheet, JSON.stringify(rows, null, 4), { encoding: "utf-8" })
    return processRows(rows)
}

async function main() {
    const events = await fetchDailyResources()
    fs.writeFileSync(dataPaths.dailyResources, JSON.stringify(events, null, 4), { encoding: "utf-8" })
}

main()