import dayjs from "dayjs"
import { PullResources, ResourceGained } from "../types"
import { PullCalculator } from "./pull-calculator"
import { Resources } from "./resources"


export function convertResourcesToPulls(res: PullResources, useOP: boolean): number {
    const calc = new PullCalculator(res).spendTickets().spendOrundum()

    if (useOP)
        calc.convertOP()

    return calc.getPulls()
}


export function convertPullsToResources(startingResources: PullResources, pulls: number): { spent: PullResources, remaining: PullResources } {

    const calc = new PullCalculator(startingResources)
    calc.spendTickets(pulls)
    calc.spendOrundum(pulls - calc.getPulls())
    calc.convertOP(pulls - calc.getPulls())

    const resRemaining = calc.res
    const resStart = new Resources(startingResources.orundum, startingResources.tickets, startingResources.op)
    const resSpent = resStart.clone().subtract(resRemaining)

    return {
        spent: resSpent,
        remaining: resRemaining,
    }
}


/** Get the CURRENT (not ISO) date in YYYY-MM-DD format */
function getLocalISODate() {
    return dayjs().format("YYYY-MM-DD")
}


type Row = {
    event_id: string | undefined
    rowSpan: number
}



export function formatOrundum(n: number): string {
    if (n >= 0 && n < 1000)
        return n.toFixed(0)
    else
        return (n / 1000).toFixed(1) + "k"
}


export function constrain(num: number, min: number, max: number) {
    if (num > max)
        return max
    if (num < min)
        return min
    return num
}


/** Returns the current day in YYYY-MM-DD format */
export function today(): string {
    return dayjs().format('YYYY-MM-DD')
}


export const TODAY = today()