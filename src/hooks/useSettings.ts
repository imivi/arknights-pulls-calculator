import { useClearedTodayStore } from "../stores/useClearedTodayStore";
import { useSpendablePullsStore } from "../stores/useSpendablePullsStore";
import { useStartingResourcesStore } from "../stores/useStartingResourcesStore";
import { useUserResourcesStore } from "../stores/useUserResourcesStore";
import { Settings } from "../types";
import { useClearedReruns } from "./useClearedReruns";


export function useSettings() {

    const { startingResources, monthlyCard } = useStartingResourcesStore()
    const { clearedReruns } = useClearedReruns()
    const firstDayCleared = useClearedTodayStore(store => store.clearedToday)
    const { spendablePulls } = useSpendablePullsStore()
    const { userResources } = useUserResourcesStore()

    const settings: Settings = {
        activeMonthlyCard: monthlyCard,
        startingResources,
        clearedReruns,
        firstDayCleared,
        spendablePulls,
        userResources,
    }

    return settings
}