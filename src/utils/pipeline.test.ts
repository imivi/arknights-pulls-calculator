import { test, expect } from "vitest"
import { runPipeline } from "./pipeline"
import dayjs from "dayjs"

test("runPipeline with certsPerDay = 0", () => {
    const today = dayjs().format('YYYY-MM-DD')
    
    const userSettings = {
        startingOrundum: 0,
        startingTickets: 0,
        startingOp: 0,
        startingCerts: 0,
        monthlyCard: false,
        claimedDay: null,
        certsPerDay: 0,
        orundumPerDay: 0,
        clearedReruns: [],
        maxPullsToSpend: {},
        spendOp: false,
        farmEveryday: false,
        resourceAdjustments: {}
    }

    const tables = {
        days: {
            day: [today],
        },
        events: {
            event_id: [],
            title: [],
        },
        eventDays: {
            day: [],
            event_id: [],
            day_of_event: [],
        },
        resources: {
            amount: [],
            confirmed: [],
            day: [],
            resource: [],
            source: [],
        }
    }

    // This should run without throwing any Arquero errors
    const result = runPipeline(userSettings, tables)
    expect(result).toBeDefined()
    expect(result.dt_final_calendar).toBeDefined()
})
