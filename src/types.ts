

export const resources = ["orundum", "tickets", "op", "cert"] as const

export type Resource = typeof resources[number]

export const resourceEncoding: Record<Resource, number> = {
    "orundum": 1,
    "tickets": 2,
    "op": 3,
    "cert": 4,
} as const

export type BasicResources = {
    orundum: number
    tickets: number
    op: number
    certs: number
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
    resourceAdjustments: Record<string, { amount: number, description: string }>
}




export type CalendarRow = {
    day: string

    // Resource data
    orundum_gained: number
    tickets_gained: number
    op_gained: number
    certs_gained: number
    user_max_pulls: number
    orundum_spendable: number
    tickets_spendable: number
    op_spendable: number
    pulls_available_incl_op: number
    pulls_available_excl_op: number
    pulls_spent: number
    orundum_spent: number
    tickets_spent: number
    op_spent: number
    orundum_leftover: number
    tickets_leftover: number
    op_leftover: number
    certs_leftover: number
    weekday: number

    max_pulls_leftover: number
    max_orundum_leftover: number
    max_tickets_leftover: number
    max_op_leftover: number
    max_certs_leftover: number
    max_pulls_spent: number

    // Event data
    event_id: string | undefined
    day_of_event: number | undefined
    date_confirmed: number | undefined
    is_limited: number | undefined
    is_rerun: number | undefined
    is_collab: number | undefined
    title: string | undefined
    event_ops: string | undefined
    event_link: string | undefined
    first_day: string | undefined
    duration_days: number | undefined
    color_dark_hex: string | undefined
    color_dark_hue: number | undefined
    color_dark_sat: number | undefined
    color_dark_light: number | undefined
    color_light_hex: string | undefined
    color_light_hue: number | undefined
    color_light_sat: number | undefined
    color_light_light: number | undefined
}

type Day = string // YYYY-MM-DD

export type UserSettings = {
    startingOrundum: number
    startingTickets: number
    startingOp: number
    startingCerts: number
    monthlyCard: boolean
    claimedDay: string | null
    certsPerDay: number
    clearedReruns: string[]
    maxPullsToSpend: Record<Day, number>
    spendOp: boolean
    resourceAdjustments: Record<string, {
        amount: number
        description: string
    }>
}
