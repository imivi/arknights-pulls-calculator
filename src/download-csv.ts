import { generateCsv, download, mkConfig } from "export-to-csv"

import { DayWithResources, ResourceGained } from "./types"

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

export function downloadCsv(rows: DayWithResources[]) {

    const csvRows: CsvRow[] = rows.map(day => {

        const orundum_sources = formatSources(day.resourcesGained.orundum)
        const tickets_sources = formatSources(day.resourcesGained.tickets)
        const op_sources = formatSources(day.resourcesGained.op)

        return {
            date: day.dateString,
            event: day.description,

            op: day.cumulativeResources.op,
            op_sources,
            orundum: day.cumulativeResources.orundum,
            orundum_sources,
            tickets: day.cumulativeResources.tickets,
            tickets_sources,

            pulls_no_op: day.cumulativeResources.pullsWithoutOP(),
            pulls_with_op: day.cumulativeResources.pullsWithOP(),
            free_pulls: day.freePulls,
        }
    })

    console.log(csvRows)

    const config = mkConfig({ useKeysAsHeaders: true, filename: "arknights_pulls.csv" })

    const csv = generateCsv(config)(csvRows)

    download(config)(csv)
}

function formatSources(res: ResourceGained[]): string {
    const lines = res.map(source => (
        `${source.value} ${source.description}`
    ))
    return lines.join("\n")
}