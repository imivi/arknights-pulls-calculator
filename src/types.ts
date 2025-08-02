import { UserResources } from "./stores/useUserResourcesStore"
import { Resources } from "./utils/resources"


export const resources = ["orundum", "tickets", "op"] as const

export type Resource = keyof BasicResources


export type BasicResources = {
    orundum: number
    tickets: number
    op: number
}

export type ResourceGained = {
    value: number,
    source: string // e.g. "login_event"
    // enabled: boolean // This is a toggle used to ignore OP from event stages and orundum from purple certs
}

export type ResourcesGainedInfo = {
    orundum: ResourceGained[]
    tickets: ResourceGained[]
    op: ResourceGained[]
}


export type Settings = {
    activeMonthlyCard: boolean
    startingResources: BasicResources
    firstDayCleared: boolean
    spendablePulls: Record<string, number>
    clearedReruns: string[]
    userResources: Record<string, UserResources>
}


export type BaseValues = {
    date: string
    free_monthly_card: boolean
    event_name: string | undefined
    event_id: string | undefined
    event_link: string | undefined
    event_ops: string[]
    eventDay: number
    freePulls: number
    defaultResourcesInfo: ResourcesGainedInfo,

    rowSpan: number
}

// user-derived fields
export type UserValues = {
    rewardsClaimed: boolean
    spendablePulls: number
    activeResourcesInfo: ResourcesGainedInfo
}

type CalculatedValues = {
    resourcesGainedToday: Resources
    cumulativeResources: Resources
    cumulativeSpendableResources: Resources // Excludes any resources already spent on pulls on this day
    pullsAvailableTotal: number
    pullsAvailableWithoutOP: number
    pullsAvailableFromOP: number
    pullsSpent: number
}

export type Day = BaseValues & UserValues & CalculatedValues
