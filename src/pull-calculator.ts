import { BasicResources } from "./types"


export class PullCalculator {

    private pulls = 0
    public res: BasicResources

    constructor(res: BasicResources) {
        this.res = {
            op: res.op,
            orundum: res.orundum,
            tickets: res.tickets,
        }
        return this
    }

    spendTickets(max: number | null = null) {

        // Spend all tickets
        if (max === null || max > this.res.tickets) {
            this.pulls += this.res.tickets
            this.res.tickets = 0
        }

        // Spend up to N tickets
        else {
            this.pulls += max
            this.res.tickets -= max
        }

        return this
    }

    // Spend orundum up to N pulls
    spendOrundum(maxPulls: number | null = null) {
        const pullsFromOrundum = Math.floor(this.res.orundum / 600)
        const pulls = maxPulls === null ? pullsFromOrundum : Math.min(pullsFromOrundum, maxPulls)

        const orundumToSpend = pulls * 600

        this.pulls += pulls
        this.res.orundum -= orundumToSpend

        return this
    }

    convertOP(maxPulls: number | null = null) {

        const startingOrundum = this.res.orundum

        // Convert all OP to orundum
        this.res.orundum += this.res.op * 180
        this.res.op = 0

        const pullsAvailable = Math.floor(this.res.orundum / 600)
        const pullsSpent = maxPulls === null ? pullsAvailable : Math.min(pullsAvailable, maxPulls)
        const orundumSpent = pullsSpent * 600
        this.res.orundum -= orundumSpent
        const leftoverOrundum = this.res.orundum

        // console.log({ startingOrundum, orundum: this.res.orundum, pullsAvailable, pullsSpent, leftoverOrundum, orundumSpent })

        const refundableOrundum = (leftoverOrundum > startingOrundum) ? (leftoverOrundum - startingOrundum) : 0
        const refundedOP = Math.floor(refundableOrundum / 180)
        const refundedOrundum = refundedOP * 180
        const finalOrundum = this.res.orundum - refundedOrundum

        // console.log({ refundableOrundum, refundedOP, refundedOrundum, finalOrundum })

        this.pulls += pullsSpent
        this.res.op += refundedOP
        this.res.orundum = finalOrundum

        return this
    }

    getPulls() {
        return this.pulls
    }

    getResources() {
        return this.res
    }
}
