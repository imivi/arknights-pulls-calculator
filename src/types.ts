export type BasicResources = {
    orundum: number
    tickets: number
    op: number
}

export type ResourceGained = {
    value: number,
    source: string // e.g. "login_event"
    enabled: boolean // This is a toggle used to ignore OP from event stages and orundum from purple certs
}
