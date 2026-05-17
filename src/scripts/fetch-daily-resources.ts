import PublicGoogleSheetsParser from 'public-google-sheets-parser'
import fs from "fs"
import { env } from '../env'
import { extractEvents, extractResourcesGained, getEventDays, getWeekday, partiallyIndentJson, transpose } from '../utils/prebuild-utils'
import { dataPaths } from '../data-paths'
import { GoogleSheetRow, rowsSchema } from './types'
import { checkDailyResources, checkIntelCerts } from './check-daily-resources'



async function fetchRows(googleSheetId: string) {
    const parser = new PublicGoogleSheetsParser(googleSheetId, {
        useFormattedDate: true,
    })
    const rows = await parser.parse()
    return rowsSchema.parse(rows)
}




type Day = {
    day: string
    weekday: number
}

function extractDays(rows: GoogleSheetRow[]): Day[] {
    // Extract and deduplicate
    const datesStr = new Set(rows.map(row => row.day))

    // Extract weekday
    const days: Day[] = Array.from(datesStr).map(dayStr => {
        return {
            day: dayStr,
            weekday: getWeekday(dayStr),
        }
    })

    return days
}


async function main() {

    // Read google sheet as-is
    const googleSheetId = env.GOOGLE_SHEET_ID

    const USE_CACHE = true
    let rows: GoogleSheetRow[] = []
    if (USE_CACHE) {
        console.info("📦 Using google sheet json cache")
        rows = JSON.parse(fs.readFileSync(dataPaths.rawGoogleSheet, { encoding: "utf-8" }))
    }
    else {
        rows = await fetchRows(googleSheetId)
        fs.writeFileSync(dataPaths.rawGoogleSheet, JSON.stringify(rows, null, 4), { encoding: "utf-8" })
    }
    console.info("✅ (1/4) Fetched sheet data")

    const days = extractDays(rows)
    const events = await extractEvents(rows)
    const eventDays = getEventDays(rows)
    const resources = rows.map(row => extractResourcesGained(row)).flat()
    console.info("✅ (2/4) Processed sheet data")

    // Split rows into three tables: day, events, resources_gained
    const tables = {
        days: transpose(days),
        events: transpose(events),
        resources: transpose(resources),
        eventDays: transpose(eventDays),
    }

    fs.writeFileSync(dataPaths.tables, partiallyIndentJson(JSON.stringify(tables)), { encoding: "utf-8" })
    console.info("✅ (3/4) Saved processed sheet data")

    // Run data checks
    checkDailyResources(events)
    checkIntelCerts(events, resources)
    console.info("✅ (4/4) Spreadsheet data validated successfully")
}

main()