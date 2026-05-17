import { ResourceChange } from '../../utils/pipeline'
import s from './Calendar.module.scss'

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

    max_orundum_leftover: number
    max_tickets_leftover: number
    max_op_leftover: number
    max_certs_leftover: number

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

type Props = {
    rows: CalendarRow[]
    resourcesGainedOrSpentByDay: Record<string, ResourceChange[]>
}

export default function Calendar({ rows, resourcesGainedOrSpentByDay }: Props) {

    console.log(rows[0])

    return (
        <div className={s.Calendar}>
            <table>
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Day</th>

                        <th>Total pulls</th>
                        <th>Orundum</th>
                        <th>Tickets</th>
                        <th>OP</th>
                        <th>Certs</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.day}>
                            {/* Day */}

                            {
                                row.event_id &&
                                row.day_of_event === 1 &&
                                <td rowSpan={row.duration_days}>{row.title}</td>
                            }
                            {
                                !row.event_id &&
                                <td></td>
                            }

                            <td>{formatDate(row.day, row.weekday)}</td>

                            <td>{row.pulls_available_incl_op} ({row.pulls_available_excl_op} + {row.pulls_available_incl_op - row.pulls_available_excl_op})</td>

                            <td title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 1), null, 4)}>
                                {row.orundum_leftover} (+{row.orundum_gained - row.orundum_spent})
                                <ProgressBar value={row.orundum_leftover} max={row.max_orundum_leftover} />
                            </td>
                            <td title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 2), null, 4)}>
                                {row.tickets_leftover} (+{row.tickets_gained - row.tickets_spent})
                                <ProgressBar value={row.tickets_leftover} max={row.max_tickets_leftover} />
                            </td>
                            <td title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 3), null, 4)}>
                                {row.op_leftover} (+{row.op_gained - row.op_spent})
                                <ProgressBar value={row.op_leftover} max={row.max_op_leftover} />
                            </td>
                            <td title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 4), null, 4)}>
                                {Math.floor(row.certs_leftover)} (+{row.certs_gained})
                                <ProgressBar value={row.certs_leftover} max={row.max_certs_leftover} />
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}


/** Convert YYYY-MM-DD to Jan 01 Mon */
function formatDate(dateStr: string, dayofweek: number): string {
    const [_, month, day] = dateStr.split('-')
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return `${months[parseInt(month) - 1]} ${day} ${days[dayofweek - 1]}`
}


function ProgressBar({ value, max }: { value: number, max: number }) {
    const percentage = Math.round(value / max * 100)
    return (
        <div style={{
            width: '100%',
            height: '10px',
            backgroundColor: '#ccc',
            borderRadius: '5px',
            overflow: 'hidden',
            marginTop: '4px'
        }}>
            <div style={{
                width: `${percentage}%`,
                height: '100%',
                backgroundColor: '#007bff',
                borderRadius: '5px',
            }} />
        </div>
    )
}