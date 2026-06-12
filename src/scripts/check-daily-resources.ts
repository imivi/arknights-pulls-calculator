import fs from "fs"
import { Event, ResourceGained } from "../utils/prebuild-utils"
import { resourceEncoding } from "../types"


function getOperatorImages() {
    const filenames = fs.readdirSync("public/operators")
    return filenames.map(filename => filename.split(".")[0])
}

function getAllOperators(events: Event[]) {
    const ops: string[] = []
    for (const event of events) {
        ops.push(...event.event_ops.split(", ").map(s => s.trim()))
    }
    return ops.filter(op => op !== "")
}

export function checkDailyResources(events: Event[]) {

    // Make sure that every limited event has exactly 2 operators
    for (const event of events) {
        const ops = event.event_ops.split(", ")
        if (event.is_limited && !event.is_rerun && ops.length !== 2)
            throw Error(`Limited (non rerun) event ${event.event_id} lists fewer or more than 2 operators: ${ops}`)
    }

    // Make sure that there is an image for every operator
    const operatorImages = new Set(getOperatorImages())
    const allOps = getAllOperators(events)
    for (const op of allOps) {
        if (!operatorImages.has(op)) {
            throw Error("Missing operator image: " + op)
        }
    }

    // Make sure that every event lasts exactly 7, 10 or 14 days
    const validDurations = [7, 10, 14]
    for (const event of events) {
        if (event.is_rerun && event.duration_days !== 10 && !event.is_collab)
            throw Error(`${event.event_id} event should have 10-day duration but has ${event.duration_days}`)
        else if (!validDurations.includes(event.duration_days))
            throw Error(`Invalid event duration for ${event.event_id}: ${event.duration_days}`)
    }
}

/**
    Make sure that all reruns have orundum from intelligence certificates ("orundum:intel"),
    and non-reruns have no orundum from intelligence certificates
 */
export function checkIntelCerts(events: Event[], resourcesGained: ResourceGained[]) {

    const rerunDays = new Set(events.filter(event => event.is_rerun).map(event => event.first_day))
    const nonRerunDays = new Set(events.filter(event => !event.is_rerun).map(event => event.first_day))

    const orundumGained = resourcesGained.filter(res => res.resource === resourceEncoding.orundum && res.source === "intel")
    const orundumGainedDays = new Set(orundumGained.map(res => res.day))

    for (const res of orundumGained) {
        if (nonRerunDays.has(res.day))
            throw Error(`Non-rerun has orundum from intel certs on day ${res.day}`)
    }

    for (const day of rerunDays) {
        if (!orundumGainedDays.has(day))
            throw Error(`Rerun has no orundum from intel certs on day ${day}`)
    }
}
