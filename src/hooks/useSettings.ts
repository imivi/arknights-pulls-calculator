import { useDayClearedStore } from "../stores/useDayClearedStore";
import { useResourceAdjustmentsStore } from "../stores/useResourceAdjustmentsStore";
import { useSpendablePullsStore } from "../stores/useSpendablePullsStore";
import { useStartingResourcesStore } from "../stores/useStartingResourcesStore";
import { Settings } from "../types";
import { today } from "../utils/utils";
import { useClearedReruns } from "./useClearedReruns";


export function useSettings() {

    const { startingResources, monthlyCard } = useStartingResourcesStore()
    const { clearedReruns } = useClearedReruns()
    const firstDayCleared = useDayClearedStore(store => store.dayCleared === today())
    const { spendablePulls } = useSpendablePullsStore()
    const { resourceAdjustments } = useResourceAdjustmentsStore()

    const settings: Settings = {
        activeMonthlyCard: monthlyCard,
        startingResources,
        clearedReruns,
        firstDayCleared,
        spendablePulls,
        resourceAdjustments,
    }

    return settings
}