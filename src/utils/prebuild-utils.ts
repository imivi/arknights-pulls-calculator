type Item = {
    eventDay: number
    freePulls: number
    event_id?: string
}

export function addEventDays<T extends Item>(days: T[]) {

    /*
    If this day has the same event as the previous day, set the same event + 1
    If this day has an event but the prev didn't, set 1
    If this day does not have an event, set 0
    */

    days.forEach((today, i) => {

        const yesterday = days[i - 1]

        if (i === 0 || !yesterday?.event_id)
            return today.eventDay = today.event_id ? 1 : 0

        // If this day has no events, the day is 0
        if (!today.event_id)
            return today.eventDay = 0

        // If this day has the same event as the previous day, today is yesterday + 1
        if (today.event_id === yesterday.event_id)
            return today.eventDay = yesterday.eventDay + 1

        // If this day has a different event from the previous day, today is 1
        if (today.event_id !== yesterday.event_id)
            return today.eventDay = 1
    })

    return [...days]
}

export function addFreePulls<T extends Item>(days: T[]) {

    days.forEach(today => {
        const isLimitedEvent = !!today.event_id && today.event_id.endsWith("_lim")
        if (isLimitedEvent) {
            if (today.eventDay === 1)
                today.freePulls = 11
            else if (today.eventDay <= 14)
                today.freePulls = 1
        }
    })

    return [...days]
}
