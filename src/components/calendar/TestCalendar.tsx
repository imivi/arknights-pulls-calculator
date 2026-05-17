import type { CalendarRow } from "./Calendar"
import { ResourceChange } from '../../utils/pipeline'

type Props = {
    rows: CalendarRow[]
    resourcesGainedOrSpentByDay: Record<string, ResourceChange[]>
}

export default function TestCalendar({ rows, resourcesGainedOrSpentByDay }: Props) {
    return (
        <div>
            <table>
                <thead>
                    <th>Day</th>
                    <th>Weekday</th>

                    {/* Resource data */}
                    <th>Orundum Gained</th>
                    <th>Tickets Gained</th>
                    <th>OP Gained</th>
                    <th>Certs Gained</th>
                    <th>User Max Pulls</th>
                    <th>Orundum Spendable</th>
                    <th>Tickets Spendable</th>
                    <th>OP Spendable</th>
                    <th>Pulls Available Incl OP</th>
                    <th>Pulls Available Excl OP</th>
                    <th>Pulls Spent</th>
                    <th>Orundum Spent</th>
                    <th>Tickets Spent</th>
                    <th>OP Spent</th>
                    <th>Orundum Leftover</th>
                    <th>Tickets Leftover</th>
                    <th>OP Leftover</th>

                    {/* Event data */}
                    <th>Event ID</th>
                    <th>Day of Event</th>
                    <th>Date Confirmed</th>
                    <th>Is Limited</th>
                    <th>Is Rerun</th>
                    <th>Is Collab</th>
                    <th>Title</th>
                    <th>Event Ops</th>
                    <th>Event Link</th>
                    <th>First Day</th>
                    <th>Duration Days</th>
                    <th>Color Dark Hex</th>
                    <th>Color Dark Hue</th>
                    <th>Color Dark Sat</th>
                    <th>Color Dark Light</th>
                    <th>Color Light Hex</th>
                    <th>Color Light Hue</th>
                    <th>Color Light Sat</th>
                    <th>Color Light Light</th>

                    {/* Resources spent/gained */}
                    <th>Resources spent/gained</th>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.day}>
                            {/* Day */}
                            <td>{row.day}</td>
                            <td>{row.weekday}</td>

                            {/* Resource data */}
                            <td>{row.orundum_gained}</td>
                            <td>{row.tickets_gained}</td>
                            <td>{row.op_gained}</td>
                            <td>{row.certs_gained}</td>
                            <td>{row.user_max_pulls}</td>
                            <td>{row.orundum_spendable}</td>
                            <td>{row.tickets_spendable}</td>
                            <td>{row.op_spendable}</td>
                            <td>{row.pulls_available_incl_op}</td>
                            <td>{row.pulls_available_excl_op}</td>
                            <td>{row.pulls_spent}</td>
                            <td>{row.orundum_spent}</td>
                            <td>{row.tickets_spent}</td>
                            <td>{row.op_spent}</td>
                            <td>{row.orundum_leftover}</td>
                            <td>{row.tickets_leftover}</td>
                            <td>{row.op_leftover}</td>

                            {/* Event data */}
                            <td>{row.event_id}</td>
                            <td>{row.day_of_event}</td>
                            <td>{row.date_confirmed}</td>
                            <td>{row.is_limited}</td>
                            <td>{row.is_rerun}</td>
                            <td>{row.is_collab}</td>
                            <td>{row.title}</td>
                            <td>{row.event_ops}</td>
                            <td>{row.event_link}</td>
                            <td>{row.first_day}</td>
                            <td>{row.duration_days}</td>
                            <td>{row.color_dark_hex}</td>
                            <td>{row.color_dark_hue}</td>
                            <td>{row.color_dark_sat}</td>
                            <td>{row.color_dark_light}</td>
                            <td>{row.color_light_hex}</td>
                            <td>{row.color_light_hue}</td>
                            <td>{row.color_light_sat}</td>
                            <td>{row.color_light_light}</td>

                            {/* Resources spent/gained */}
                            <td>
                                {JSON.stringify((resourcesGainedOrSpentByDay[row.day] || []).map(res => res.amount))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}