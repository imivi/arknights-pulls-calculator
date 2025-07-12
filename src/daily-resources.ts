import events from "./data/daily_resources.json"
import { DailyResource } from "./types"


export function getDailyResources(f2p: boolean, clearedReruns: string[]) {
    const dailyEvents: Record<string, DailyResource> = {}
    for (const e of events) {
        dailyEvents[e.day] = new DailyResource(e.day, e.description, e.event_id, f2p, { ...e.resourcesGained }, clearedReruns)
    }
    return dailyEvents
}
