import { useCertsPerDayStore } from "../stores/useCertsPerDayStore"
import { useDayClearedStore } from "../stores/useDayClearedStore"
import { useResourceAdjustmentsStore } from "../stores/useResourceAdjustmentsStore"
import { useSpendablePullsStore } from "../stores/useSpendablePullsStore"
import { useStartingResourcesStore } from "../stores/useStartingResourcesStore"
import { UserSettings } from "../types"
import { useClearedReruns } from "./useClearedReruns"
import { useStartingResources } from "./useStartingResources"






export function useUserSettings(): UserSettings {
    const { dayCleared } = useDayClearedStore()
    const { clearedReruns } = useClearedReruns()
    const { monthlyCard } = useStartingResourcesStore()
    const { spendablePulls } = useSpendablePullsStore()
    const { resourceAdjustments } = useResourceAdjustmentsStore()
    const { startingResources } = useStartingResources()
    const { certsPerDay } = useCertsPerDayStore()
    return {
        startingOrundum: startingResources.orundum,
        startingTickets: startingResources.tickets,
        startingOp: startingResources.op,
        startingCerts: startingResources.certs,
        monthlyCard,
        claimedDay: dayCleared,
        certsPerDay,
        clearedReruns,
        maxPullsToSpend: spendablePulls,
        resourceAdjustments,
    }
}



export const dummyUserSettings: UserSettings = {
    startingOrundum: 60_000, // 100 pulls
    startingTickets: 20, // 20 pulls
    startingOp: 100, // 30 pulls
    startingCerts: 50,
    monthlyCard: false,
    claimedDay: '2026-05-16',
    certsPerDay: 1.5,
    clearedReruns: [
        'exodus_rerun',
        'reunion_lim_rerun',
    ],
    maxPullsToSpend: {
        '2026-07-16': 176,
    },
    // resources added or subtracted by the user
    resourceAdjustments: {
        '2026-06-02:orundum': {
            amount: 1_000,
            description: 'random reward'
        },
        '2026-06-02:tickets': {
            amount: 12,
            description: 'buy tickets in store'
        },
        '2026-06-02:op': {
            amount: -18,
            description: 'skin purchase'
        },
        '2026-06-02:certs': {
            amount: -38,
            description: 'buy tickets in store'
        },
    },
}
