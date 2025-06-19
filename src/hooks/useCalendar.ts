import { useMemo } from "react"
import { getDailyResources } from "../daily-resources"
import { getValidDates, getDaysWithResources, calculateRowSpan } from "../utils"
import { Resources } from "../types"


export function useCalendar(startingResources: Resources, f2p: boolean, clearedReruns: string[]) {

    // 1. Calculate resources gained every day
    const dailyResources = useMemo(() => getDailyResources(f2p, clearedReruns), [f2p, clearedReruns])

    // 2. Get valid dates
    const dates = useMemo(() => getValidDates(Object.values(dailyResources)), [dailyResources])

    // 3. Calculate cumulative resources and other information for each day
    const daysWithResources = useMemo(() => {
        return getDaysWithResources(startingResources, dates, dailyResources)
    }, [startingResources, dates])

    // 4. Calculate row span of each event description
    useMemo(() => {
        calculateRowSpan(daysWithResources)
    }, [daysWithResources])

    return daysWithResources
}