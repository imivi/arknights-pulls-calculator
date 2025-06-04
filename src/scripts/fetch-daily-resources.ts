import PublicGoogleSheetsParser from 'public-google-sheets-parser'
import fs from "fs"
import z from "zod"
import { env } from '../env'
import { ResourceGained } from '../types'
import { resourceLabels } from '../labels'


const rowSchema = z.object({
    "day": z.string(),
    "weekday": z.number(),
    "event": z.string().optional(),
    "event_id": z.string().optional(),
    "orundum:login_event": z.number().default(0),
    "orundum:fortune_strip": z.number().default(0),
    "orundum:anni": z.number().default(0),
    "orundum:new_anni": z.number().default(0),
    "orundum:store": z.number().default(0),
    "orundum:daily_missions": z.number().default(0),
    "orundum:weekly_missions": z.number().default(0),
    "orundum:monthly_card": z.number().default(0),
    "op:event_stages": z.number().default(0),
    "op:login_event": z.number().default(0),
    "op:monthly_card": z.number().default(0),
    "tickets:login": z.number().default(0),
    "tickets:store": z.number().default(0),
    "tickets:event_shop": z.number().default(0),
})

type Row = z.infer<typeof rowSchema>

const rowsSchema = z.array(rowSchema)

function getResourceGained(row: Row, resource: "orundum" | "tickets" | "op"): ResourceGained[] {
    const resources: ResourceGained[] = []

    for (const [key, value] of Object.entries(row)) {
        if (!key.includes(":") || value === 0)
            continue

        const [res, source] = key.split(":")

        if (res !== resource)
            continue

        const label = resourceLabels[source]
        // console.log(key, value, label, source)
        resources.push({
            description: label,
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

    const result = {
        day: row.day,
        description: row.event,
        event_id: row.event_id,
        resourcesGained: {
            orundum,
            tickets,
            op,
        },
    }

    return result
}

function processRows(rows: Row[]) {
    return rows.map(row => processRow(row))
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
    fs.writeFileSync("src/data/raw_google_sheet.json", JSON.stringify(rows, null, 4), { encoding: "utf-8" })
    const events = processRows(rows)
    return events
}

async function main() {
    const events = await fetchDailyResources()
    fs.writeFileSync("src/data/daily_resources.json", JSON.stringify(events, null, 4), { encoding: "utf-8" })
}

main()