import { generateCsv, download, mkConfig } from "export-to-csv"

import { ResourceGained } from "./types"
import { Day } from "./day"
import { convertResourcesToPulls } from "./utils"
import { resourceLabels } from "./labels"

type CsvRow = {
    date: string
    event: string | undefined
    orundum: number
    orundum_sources: string
    tickets: number
    tickets_sources: string
    op: number
    op_sources: string
    pulls_no_op: number
    pulls_with_op: number
    free_pulls: number
}

export function downloadCsv(rows: Day[]) {

    const csvRows: CsvRow[] = rows.map(day => {

        const orundum_sources = formatSources(day.resourcesInfo.orundum)
        const tickets_sources = formatSources(day.resourcesInfo.tickets)
        const op_sources = formatSources(day.resourcesInfo.op)

        const pullsNoOP = convertResourcesToPulls(day.resourcesTotal, false)
        const pulls = convertResourcesToPulls(day.resourcesTotal, true)

        return {
            date: day.date,
            event: day.event_name,

            op: day.resourcesTotal.op,
            op_sources,
            orundum: day.resourcesTotal.orundum,
            orundum_sources,
            tickets: day.resourcesTotal.tickets,
            tickets_sources,

            pulls_no_op: pullsNoOP,
            pulls_with_op: pulls,
            free_pulls: day.freePulls,
        }
    })

    const config = mkConfig({ useKeysAsHeaders: true, filename: "arknights_pulls.csv" })

    const csv = generateCsv(config)(csvRows)

    download(config)(csv)
}

function formatSources(res: ResourceGained[]): string {
    const lines = res.map(source => (
        `${source.value} ${resourceLabels[source.source]}`
    ))
    return lines.join("\n")
}