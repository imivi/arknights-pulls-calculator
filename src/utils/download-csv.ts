import { generateCsv, download, mkConfig } from "export-to-csv"

import { ResourceGained } from "../types"
import { Day } from "../types"
import { resourceLabels } from "../labels"


export function downloadCsv(rows: Day[]) {

    const csvRows = rows.map(day => {

        const orundum_sources = formatSources(day.activeResourcesInfo.orundum)
        const tickets_sources = formatSources(day.activeResourcesInfo.tickets)
        const op_sources = formatSources(day.activeResourcesInfo.op)

        const { date, event_name, free_monthly_card } = day

        return {
            date,
            event_name,
            free_pulls: day.freePulls,
            free_monthly_card,
            pulls_spent: day.pullsSpent,
            event_ops: day.event_ops.join("; "),

            resources_gained_orundum: day.resourcesGainedToday.orundum,
            resources_gained_tickets: day.resourcesGainedToday.tickets,
            resources_gained_op: day.resourcesGainedToday.op,

            resources_spendable_orundum: day.cumulativeSpendableResources.orundum,
            resources_spendable_tickets: day.cumulativeSpendableResources.tickets,
            resources_spendable_op: day.cumulativeSpendableResources.op,

            resources_total_orundum: day.cumulativeResources.orundum,
            resources_total_tickets: day.cumulativeResources.tickets,
            resources_total_op: day.cumulativeResources.op,

            op_sources,
            orundum_sources,
            tickets_sources,

            pulls_total: day.pullsAvailableTotal,
            pulls_no_op: day.pullsAvailableWithoutOP,
            pulls_with_op: day.pullsAvailableFromOP,
        }
    })

    const config = mkConfig({ useKeysAsHeaders: true, filename: "arknights_pulls" })

    const csv = generateCsv(config)(csvRows)

    download(config)(csv)
}

function formatSources(res: ResourceGained[]): string {
    const lines = res.map(info => (
        `${info.value} ${resourceLabels[info.source]}`
    ))
    return lines.join("; ")
}