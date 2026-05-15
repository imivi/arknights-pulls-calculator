import { z } from "zod"

const rowSchema = z.object({
    "day": z.string(),
    "weekday": z.number(),
    "event": z.string().optional(),
    "event_id": z.string().optional(),
    "event_link": z.string().optional(),
    "event_ops": z.string().default(""),
    "orundum:login_event": z.number().default(0),
    "orundum:fortune_strip": z.number().default(0),
    "orundum:anni": z.number().default(0),
    "orundum:new_anni": z.number().default(0),
    "orundum:store": z.number().default(0),
    "orundum:daily_missions": z.number().default(0),
    "orundum:weekly_missions": z.number().default(0),
    "orundum:monthly_card": z.number().default(0),
    "orundum:free_monthly_card": z.number().default(0),
    "orundum:intel": z.number().default(0),
    "op:event_stages": z.number().default(0),
    "op:login_event": z.number().default(0),
    "op:monthly_card": z.number().default(0),
    "tickets:login": z.number().default(0),
    "tickets:store": z.number().default(0),
    "tickets:event_shop": z.number().default(0),
    "cert:tokens": z.number().default(0),
})

export type GoogleSheetRow = z.infer<typeof rowSchema>

export const rowsSchema = z.array(rowSchema)