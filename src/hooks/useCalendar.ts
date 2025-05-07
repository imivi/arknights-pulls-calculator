import { useMemo } from "react"
import { getDailyResources } from "../daily-resources"
import { getValidDates, getDaysWithResources, calculateRowSpan } from "../utils"
import { Resources } from "../types"


export function useCalendar(startingResources: Resources, f2p: boolean, clearedReruns: string[]) {
    const dailyResources = useMemo(() => getDailyResources(f2p, clearedReruns), [f2p, clearedReruns])

    const dates = useMemo(() => getValidDates(Object.values(dailyResources)), [dailyResources])

    const daysWithResources = useMemo(() => {
        return getDaysWithResources(startingResources, dates, dailyResources)
    }, [startingResources, dates])

    useMemo(() => {
        calculateRowSpan(daysWithResources)
    }, [daysWithResources])
    return daysWithResources
}