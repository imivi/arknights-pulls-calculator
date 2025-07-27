import { test, expect } from "vitest"
import { Resources } from "./resources"


test("Convert to pulls (no OP)", () => {

    const res = new Resources(60_000, 10, 100)
    //                        ^100   +10 +30 pulls
    const expectedPulls = Math.floor(res.tickets + res.orundum / 600)

    expect(res.convertToPullsNoOP()).toBe(expectedPulls)
})

test("Convert to pulls (incl. OP)", () => {

    const res = new Resources(60_000, 10, 100)
    //                        ^100   +10 +30 pulls
    const expectedPulls = Math.floor(res.tickets + res.orundum / 600 + res.op * 180 / 600)

    expect(res.convertToPulls()).toBe(expectedPulls)
})


// Test operations
test("Add resources", () => {
    const res = new Resources(600, 10, 100)
    // Double the pulls -> 140*2
    res.add(res)
    expect(res.orundum).toBe(1200)
    expect(res.tickets).toBe(20)
    expect(res.op).toBe(200)
})


test("Subtract resources", () => {

    const res = new Resources(600, 10, 100)

    res.subtract(res)
    expect(res.orundum).toBe(0)
    expect(res.tickets).toBe(0)
    expect(res.op).toBe(0)
})
