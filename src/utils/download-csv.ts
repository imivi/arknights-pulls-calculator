import { generateCsv, download, mkConfig } from "export-to-csv"

import { ResourceGained } from "../types"
import { Day } from "../day"
import { resourceLabels } from "../labels"


export function downloadCsv(rows: Day[]) {

    const csvRows = rows.map(day => {

        const orundum_sources = formatSources(day.resourcesInfo.orundum)
        const tickets_sources = formatSources(day.resourcesInfo.tickets)
        const op_sources = formatSources(day.resourcesInfo.op)

        const { date, event_name, free_monthly_card } = day

        return {
            date,
            event_name,
            free_pulls: day.freePulls,
            free_monthly_card,
            pulls_spent: day.pullsSpent,
            event_ops: day.event_ops.join("; "),

            resources_spent_orundum: day.resourcesSpent.orundum,
            resources_spent_tickets: day.resourcesSpent.tickets,
            resources_spent_op: day.resourcesSpent.op,

            resources_gained_orundum: day.resourcesToday.orundum,
            resources_gained_tickets: day.resourcesToday.tickets,
            resources_gained_op: day.resourcesToday.op,

            resources_total_orundum: day.resourcesTotal.orundum,
            resources_total_tickets: day.resourcesTotal.tickets,
            resources_total_op: day.resourcesTotal.op,

            op_sources,
            orundum_sources,
            tickets_sources,

            pulls_total: day.pullsAvailable,
            pulls_no_op: day.pullsAvailableWithoutOP,
            pulls_with_op: day.pullsAvailableFromOP,
        }
    })

    const config = mkConfig({ useKeysAsHeaders: true, filename: "arknights_pulls" })

    const csv = generateCsv(config)(csvRows)

    download(config)(csv)
}

function formatSources(res: ResourceGained[]): string {
    const lines = res.filter(info => info.enabled).map(info => (
        `${info.value} ${resourceLabels[info.source]}`
    ))
    return lines.join("; ")
}