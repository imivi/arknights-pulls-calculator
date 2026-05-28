import { generateCsv, download, mkConfig } from "export-to-csv"

import { CalendarRow, ResourceGained } from "../types"
import { resourceLabels } from "../labels"
import { ResourceChange } from "./pipeline"


type AllResourceChanges = Record<string, ResourceChange[]>

export function downloadCsv(rows: CalendarRow[], resourcesGainedOrSpentByDay: AllResourceChanges) {

    function getResourceChanges(allResourceChanges: AllResourceChanges, day: string, resource: number) {
        if (!allResourceChanges.hasOwnProperty(day))
            return ""

        const resources = allResourceChanges[day].filter(change => change.resource === resource)

        if (resources.length === 0)
            return ""

        const formatted = resources.map(info => (
            `${info.amount} ${resourceLabels[info.source]}`
        ))

        return formatted.join("; ")
    }

    const csvRows = rows.map(row => {

        const { day } = row

        const orundum_changes = getResourceChanges(resourcesGainedOrSpentByDay, day, 1)
        const tickets_changes = getResourceChanges(resourcesGainedOrSpentByDay, day, 2)
        const op_changes = getResourceChanges(resourcesGainedOrSpentByDay, day, 3)
        const certs_changes = getResourceChanges(resourcesGainedOrSpentByDay, day, 4)

        return {
            ...row,
            orundum_changes,
            tickets_changes,
            op_changes,
            certs_changes,
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