import { expect, test } from "vitest";
import { convert_op_to_pulls, convertPullsToResources } from "./utils";


test("converting OP to pulls using existing orundum (1)", () => {
    const orundum = 500

    const op = 8
    // converts to 1440 orundum, i.e. 2 pulls + 240 orundum
    // this orundum is added to the initial amount = 240+500 = 1 extra pull
    // final leftover orundum = 140

    const expectedLeftoverOrundum = 140

    const { convertedOP, leftoverOrundumSpent } = convert_op_to_pulls(orundum, op)

    expect(convertedOP).toBe(8)
    expect(leftoverOrundumSpent).toBe(orundum - expectedLeftoverOrundum)
})


test("convert pulls to resources", () => {

    const startingResources = {
        "orundum": 13213,
        "tickets": 4,
        "op": 25
    }

    const pulls = 3

    const { spent, remaining } = convertPullsToResources(startingResources, pulls)

    expect(spent).toMatchObject({
        tickets: 3,
        orundum: 0,
        op: 0,
    })

    expect(remaining).toMatchObject({
        ...startingResources,
        tickets: 1,
    })
})