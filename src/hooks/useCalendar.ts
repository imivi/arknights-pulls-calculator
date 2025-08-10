import { useMemo } from "react"
import { getValidDates, calculateRowSpan } from "../utils/utils"
import { useSettings } from "./useSettings"
import { getDays, addUserData, calculateDailyTotals } from "../utils/days-utils"


export function useCalendar() {

    const settings = useSettings()

    // Get base days values (this is done only once on page load)
    const defaultDays = useMemo(() => {

        // Create day objects from imported json with daily resources
        let days = getDays()

        // Get valid dates (today or future dates)
        const validDates = new Set(getValidDates(days.map(day => day.date)))

        // Filter out days with past dates
        days = days.filter(day => validDates.has(day.date))

        // Calculate row spans (for event cells) (must be done after excluding past dates)
        days = calculateRowSpan(days)
        return days
    }, [])

    // Add user data and calculate cumulative resources, available/spent pulls, etc
    const days = useMemo(() => {
        const daysWithUserData = addUserData(defaultDays, settings)
        return calculateDailyTotals(daysWithUserData, settings)
    }, [defaultDays, settings])

    return days
}
