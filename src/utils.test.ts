import { expect, test } from "vitest";
import { convertPullsToResources } from "./utils";



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