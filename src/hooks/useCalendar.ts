import { useMemo } from "react"
import { getValidDates, calculateRowSpan } from "../utils"
import { getDays, filterGainedResources, calculateDailyResources, calculateCumulativeResources, deductResourcesSpent, calculateSpentPulls, calculatePullsAvailable, toggleFirstDayResources } from "../days-utils"
import { Resources } from "../resources"
import { useResourcesSpentStore } from "../stores/useResourcesSpentStore"


export function useCalendar(f2p: boolean, ignoreFirstDayResources: boolean, clearedReruns: string[], startingResources: Resources) {

    // Create day objects from imported json with daily resources
    let days = useMemo(getDays, [])

    // Get valid dates (today or future dates)
    const validDates = useMemo(() => new Set(getValidDates(days.map(day => day.date))), [days])

    // Filter out days with past dates
    days = useMemo(() => {
        return days.filter(day => validDates.has(day.date))
    }, [validDates, days,])

    // Calculate row spans (for event cells) (must be done after excluding past dates)
    days = useMemo(() => calculateRowSpan(days), [days])

    // Ignore certain resources for F2P and reruns
    days = useMemo(() => {
        return filterGainedResources(days, f2p, clearedReruns)
    }, [days, f2p, clearedReruns])

    // Ignore first day resources
    days = useMemo(() => {
        return toggleFirstDayResources(days, !ignoreFirstDayResources)
    }, [ignoreFirstDayResources, days])

    // Subtract resources based on pulls spent (add negative resource values)
    const { resourcesSpent } = useResourcesSpentStore()
    days = useMemo(() => {
        return deductResourcesSpent(days, resourcesSpent)
    }, [days, resourcesSpent])

    // Add information on spent pulls
    days = useMemo(() => {
        return calculateSpentPulls(days, resourcesSpent)
    }, [days, resourcesSpent])

    // Add resources gained each day (not cumulative)
    days = useMemo(() => {
        return calculateDailyResources(days)
    }, [days])

    // Calculate cumulative resources
    days = useMemo(() => {
        return calculateCumulativeResources(days, startingResources)
    }, [days, startingResources])

    // Calculate pulls available for each day
    days = useMemo(() => {
        return calculatePullsAvailable(days)
    }, [days])

    return days
}
