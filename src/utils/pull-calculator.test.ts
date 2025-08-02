import { expect, test } from "vitest";
import { PullCalculator } from "./pull-calculator";
import { BasicResources } from "../types";

test("pull calculator: convert zero resources into pulls", () => {
    const res: BasicResources = { op: 0, orundum: 0, tickets: 0 }

    const calc = new PullCalculator(res)
    const pulls = calc.spendTickets().spendOrundum().convertOP().spendOrundum().getPulls()

    expect(pulls).toBe(0)
})

test("pull calculator: convert resources up to N pulls (with OP)", () => {

    const res = { tickets: 0, orundum: 6500, op: 11 }
    // 6500 orundum = 10 pulls + 500 orundum
    // 11 OP = 1980 orundum = 3 pulls + 180 orundum
    // Add 500 orundum = 680 orundum = 1 pull + 80 orundum

    const calc = new PullCalculator(res)

    calc.spendOrundum()
    expect(calc.getPulls()).toBe(10)

    calc.convertOP()
    expect(calc.getResources().orundum).toBe(80)
    expect(calc.getPulls()).toBe(14)
})


test("pull calculator: convert all OP into orundum and convert it into pulls (1)", () => {
    const res = { tickets: 0, orundum: 100, op: 3 }

    const calculator = new PullCalculator(res).convertOP()

    expect(calculator.getPulls()).toBe(1)
    expect(calculator.getResources().orundum).toBe(40)
})


test("pull calculator: convert all OP into orundum and convert it into pulls (2)", () => {
    const res = { tickets: 0, orundum: 100, op: 8 }

    const calculator = new PullCalculator(res).convertOP()

    expect(calculator.getPulls()).toBe(2)
    expect(calculator.getResources().op).toBe(1)
    expect(calculator.getResources().orundum).toBe(160)
})


test("pull calculator: convert OP into orundum, but only for up to N pulls", () => {

    const res = { tickets: 0, orundum: 100, op: 8 }
    const maxPulls = 1

    const calculator = new PullCalculator(res).convertOP(maxPulls)

    expect(calculator.getPulls()).toBe(1)
    expect(calculator.getResources().orundum).toBe(220)
})


test("pull calculator: convert resources up to N pulls (no OP)", () => {

    const res = { tickets: 10, orundum: 6000, op: 100 }
    const maxPulls = 15
    const expectedPulls = 15
    const expectedOrundum = 3000

    const calc = new PullCalculator(res)

    calc.spendTickets(maxPulls)
    expect(calc.getPulls()).toBe(10)

    calc.spendOrundum(maxPulls - calc.getPulls())
    expect(calc.getPulls()).toBe(expectedPulls)

    expect(calc.getResources().orundum).toBe(expectedOrundum)
})


test("pull calculator: convert resources", () => {

    const res = { tickets: 10, orundum: 60_000, op: 100 }
    //                     ^10 pulls    ^100 pulls  ^30 pulls
    const expectedPulls = res.tickets + res.orundum / 600 + res.op * 180 / 600

    const calc = new PullCalculator(res)

    calc.spendTickets()
    expect(calc.res.tickets).toBe(0)
    expect(calc.getPulls()).toBe(10)

    calc.spendOrundum()
    expect(calc.res.orundum).toBe(0)

    calc.convertOP()
    expect(calc.res.op).toBe(0)
    expect(calc.getPulls()).toBe(expectedPulls)
})
