import { sumResources } from "./utils"

export type Resource = "orundum" | "op" | "tickets"

export type DateString = string

export type ResourceGained = {
    value: number
    description: string
    source: string
}

export type ResourcesGained = {
    orundum: ResourceGained[]
    tickets: ResourceGained[]
    op: ResourceGained[]
}

export type DayWithResources = {
    cumulativeResources: Resources
    dateString: string
    rowSpan: number
    resourcesGained: ResourcesGained
    totalResources: Resources
    description: string | undefined
    event_id: string | undefined
    eventDay: number // 0: no event; 1+: day N of event
    freePulls: number
    freeMonthlyCard: boolean
}

export class Resources {

    static OP_TO_PULL_CONVERSION_RATE = 0.3

    constructor(public orundum = 0, public tickets = 0, public op = 0) { }

    add(res: Resources) {
        this.orundum += res.orundum
        this.tickets += res.tickets
        this.op += res.op
    }

    pullsWithoutOP(): number {
        return Math.floor(this.orundum / 600 + this.tickets)
    }

    pullsWithOP(): number {
        return this.pullsWithoutOP() + this.opToPulls()
    }

    opToPulls(): number {
        return Math.floor(this.op * Resources.OP_TO_PULL_CONVERSION_RATE)
    }

    clone(): Resources {
        return new Resources(this.orundum, this.tickets, this.op)
    }
}


export class DailyResource {

    resourcesGained: ResourcesGained
    totalResources: Resources

    constructor(
        public readonly day: DateString,
        public readonly description: string | undefined,
        public readonly event_id: string | undefined,
        public readonly freeMonthlyCard: boolean,
        f2p: boolean,
        resGained: ResourcesGained,
        clearedReruns: string[],
    ) {
        if (f2p && !this.freeMonthlyCard) {
            this.resourcesGained = {
                orundum: resGained.orundum.filter(res => res.source !== "monthly_card"),
                tickets: resGained.tickets.filter(res => res.source !== "monthly_card"),
                op: resGained.op.filter(res => res.source !== "monthly_card"),
            }
        }
        else
            this.resourcesGained = resGained

        // Ignore OP sources from event stages if this event has been cleared before
        const eventHasBeenClearedBefore = this.event_id && clearedReruns.includes(this.event_id)
        if (eventHasBeenClearedBefore) {
            this.resourcesGained.op = this.resourcesGained.op.filter(res => res.source !== "event_stages")
        }

        this.totalResources = sumResources(this.resourcesGained)
    }
}
