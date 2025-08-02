import { PullCalculator } from "./pull-calculator"
import { BasicResources } from "../types"


export class Resources {

    static PULL_TO_ORUNDUM_CONVERSION_RATE = 600
    static OP_TO_ORUNDUM_CONVERSION_RATE = 180

    constructor(public orundum = 0, public tickets = 0, public op = 0) { }

    set(orundum: number, tickets: number, op: number) {
        this.orundum = orundum
        this.tickets = tickets
        this.op = op
        return this
    }

    add(res: BasicResources) {
        this.orundum += res.orundum
        this.tickets += res.tickets
        this.op += res.op
        return this
    }

    subtract(res: BasicResources) {
        this.orundum -= res.orundum
        this.tickets -= res.tickets
        this.op -= res.op
        return this
    }

    copyFrom(res: BasicResources) {
        this.orundum = res.orundum
        this.tickets = res.tickets
        this.op = res.op
        return this
    }

    convertToPullsUpTo(maxPulls: number) {
        const calc = new PullCalculator(this)

        const pulls = calc
            .spendTickets(maxPulls)
            .spendOrundum(maxPulls - calc.getPulls())
            .convertOP(maxPulls - calc.getPulls())
            .getPulls()

        return pulls
    }

    clone(): Resources {
        return new Resources(this.orundum, this.tickets, this.op)
    }
}