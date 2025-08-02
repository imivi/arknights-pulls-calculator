import days from "../data/daily_resources.json"
import fs from "fs"


function getOperatorImages() {
    const filenames = fs.readdirSync("public/operators")
    return filenames.map(filename => filename.split(".")[0])
}

function getAllOperators() {
    const ops: string[] = []
    for (const day of days) {
        ops.push(...day.event_ops)
    }
    return ops
}

function checkDailyResources() {

    // Make sure that every limited event has exactly 2 operators
    for (const day of days) {
        if (day.event_id?.endsWith("_lim") && day.eventDay === 1 && day.event_ops.length < 2) {
            throw Error("Limited event lists fewer or more than 2 operators: " + day.event_ops.join(", "))
        }
    }

    // Make sure that there is an image for every operator
    const operatorImages = new Set(getOperatorImages())
    for (const op of getAllOperators()) {
        if (!operatorImages.has(op)) {
            throw Error("Missing operator image: " + op)
        }
    }

    // Make sure that every event lasts exactly 7, 10 or 14 days
    const validDurations = [7, 10, 14]
    const eventDurations: Record<string, number> = {}
    for (const day of days) {
        if (day.event_id)
            eventDurations[day.event_id] = day.eventDay
    }
    Object.entries(eventDurations).forEach(([event_id, duration]) => {
        if (!validDurations.includes(duration)) {
            throw Error(`Invalid event duration for ${event_id}: ${duration}`)
        }
    })


}

checkDailyResources()