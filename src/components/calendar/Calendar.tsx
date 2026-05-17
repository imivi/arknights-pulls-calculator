import s from './Calendar.module.css'

export type CalendarRow = {
    day: string
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
}

type Props = {
    rows: CalendarRow[]
}

export default function Calendar({ rows }: Props) {
    return (
        <div className={s.Calendar}>
            <table>
                <thead>
                    <th>Day</th>
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
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.day}>
                            <td>{row.day}</td>
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
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}