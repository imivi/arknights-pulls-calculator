import events from "./data/daily_resources.json"
import { DailyResource } from "./types"


export function getDailyResources(f2p: boolean, clearedReruns: string[]) {
    const dailyResources: Record<string, DailyResource> = {}
    for (const e of events) {
        const freeMonthlyCard = e.free_monthly_card === 1
        dailyResources[e.day] = new DailyResource(
            e.day,
            e.description,
            e.event_id,
            freeMonthlyCard,
            f2p,
            { ...e.resourcesGained }, // Create a new object
            clearedReruns,
        )
    }
    return dailyResources
}
