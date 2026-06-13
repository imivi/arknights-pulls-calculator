import { useCertsPerDayStore } from "../stores/useCertsPerDayStore"
import { useDayClearedStore } from "../stores/useDayClearedStore"
import { useFarmingStore } from "../stores/useFarmingStore"
import { useResourceAdjustmentsStore } from "../stores/useResourceAdjustmentsStore"
import { useSpendablePullsStore } from "../stores/useSpendablePullsStore"
import { useSpendOpStore } from "../stores/useSpendOpStore"
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
    const { spendOp } = useSpendOpStore()
    const { orundumPerDay, everyday } = useFarmingStore()

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
        spendOp,
        resourceAdjustments,
        orundumPerDay,
        farmEveryday: everyday,
    }
}
