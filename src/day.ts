import { Resources } from "./resources"
import { ResourceGained } from "./types"


export type Day = {
    date: string
    free_monthly_card: boolean
    event_name: string | undefined
    event_id: string | undefined
    event_link: string | undefined
    event_ops: string[]

    /** New resources gained today */
    resourcesToday: Resources

    /** Resources spent today */
    resourcesSpent: Resources

    /** Cumulative resources, including resources spent today */
    resourcesTotal: Resources

    /** Every source of orundum/tickets/op with amount gained today */
    resourcesInfo: { orundum: ResourceGained[], tickets: ResourceGained[], op: ResourceGained[] }

    pullsSpent: number
    rowSpan: number
    eventDay: number // Nth day of an event (starts from 1); 0 means no event on this day
    freePulls: number
    pullsAvailable: number
    pullsAvailableWithoutOP: number
    pullsAvailableFromOP: number
}

