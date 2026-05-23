import s from './Calendar.module.scss'

import { useDarkModeStore } from '../../stores/useDarkModeStore'
import EventCell from './EventCell'
import { ResourceChange } from '../../utils/pipeline'
import { IconOnlyResourceBadge } from '../table/ResourceBadge'
import { CalendarRow } from '../../types'
import { formatOrundum } from '../../utils/utils'
import Stripes from '../table/Stripes'
import { ReactNode } from 'react'
import { DualProgressBar } from './DualProgressBar'
import { useSpendOpStore } from '../../stores/useSpendOpStore'
import ResourceMenu from './ResourceMenu'
import { Tooltip } from 'react-tooltip'

type Props = {
    rows: CalendarRow[]
    resourcesGainedOrSpentByDay: Record<string, ResourceChange[]>
}

export default function Calendar({ rows, resourcesGainedOrSpentByDay }: Props) {
    const { darkMode } = useDarkModeStore()

    // console.log(rows[0])

    const maxPullsSpent = rows[0].max_pulls_spent
    const userSpentPulls = maxPullsSpent > 0

    const { spendOp } = useSpendOpStore()

    return (
        <div className={s.Calendar} data-dark={darkMode}>
            <table>
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Day</th>

                        {userSpentPulls && <th>Pulls spent</th>}

                        <th>Pulls (
                            <IconOnlyResourceBadge resource="orundum" />
                            <IconOnlyResourceBadge resource="tickets" />
                            {spendOp && (
                                <>
                                    +
                                    <IconOnlyResourceBadge resource="op" />
                                </>
                            )}
                            )</th>

                        <th>Orundum</th>
                        <th>Tickets</th>
                        <th>OP</th>
                        <th>Certs</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={row.day}>
                            {/* Day */}

                            {
                                row.event_id &&
                                (row.day_of_event === 1 || i === 0) && // first row or day 1 of event
                                <EventCell
                                    day={row}
                                    rowSpan={row.duration_days! - row.day_of_event! + 1}
                                />
                            }
                            {
                                !row.event_id &&
                                <td>-</td>
                            }

                            {/* Date */}
                            <td>
                                {!row.date_confirmed && <Stripes color={row.color_dark_hex!} />}

                                {formatDate(row.day, row.weekday)}
                            </td>

                            {userSpentPulls && <td>{row.pulls_spent}</td>}

                            <td className={s.ProgressCell}>
                                {/* <ProgressBar value={row.pulls_available_incl_op} max={row.max_pulls_leftover} color="var(--pulls-progress)"> */}
                                <DualProgressBar
                                    value1={row.pulls_available_excl_op}
                                    value2={row.pulls_available_incl_op - row.pulls_available_excl_op}
                                    color1="var(--pulls-progress)"
                                    color2="var(--op-progress)"
                                    max={row.max_pulls_leftover}
                                >
                                    <IconOnlyResourceBadge resource="pulls" />
                                    {row.pulls_available_incl_op} pulls
                                    &nbsp;
                                    {
                                        spendOp &&
                                        <Details value={`${row.pulls_available_excl_op} + ${row.pulls_available_incl_op - row.pulls_available_excl_op}`} />
                                    }
                                </DualProgressBar>
                                {/* </ProgressBar> */}
                            </td>

                            <td className={s.ProgressCell} title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 1), null, 4)}>
                                <ProgressBar value={row.orundum_leftover} max={row.max_orundum_leftover} color="var(--orundum-progress)">

                                    <ResourceMenu row={row} resource="orundum">
                                        <button
                                            className={s.btn_open_menu}
                                            aria-label="Spend or gain resources"
                                            data-tooltip-id={row.day + ':' + 'orundum'}
                                        >
                                            <IconOnlyResourceBadge resource="orundum" />
                                            {formatOrundum(row.orundum_leftover)} <Details value={row.orundum_gained - row.orundum_spent} />

                                        </button>
                                    </ResourceMenu>

                                </ProgressBar>
                                <Tooltip id={row.day + ':' + 'orundum'}>Click to add or deduct orundum</Tooltip>
                            </td>

                            <td className={s.ProgressCell} title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 2), null, 4)}>
                                <ProgressBar value={row.tickets_leftover} max={row.max_tickets_leftover} color="var(--ticket-progress)">
                                    <IconOnlyResourceBadge resource="tickets" />
                                    {row.tickets_leftover} <Details value={row.tickets_gained - row.tickets_spent} />
                                </ProgressBar>
                            </td>

                            <td className={s.ProgressCell} title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 3), null, 4)}>
                                <ProgressBar value={row.op_leftover} max={row.max_op_leftover} color="var(--op-progress)">
                                    <IconOnlyResourceBadge resource="op" />
                                    {row.op_leftover} <Details value={row.op_gained - row.op_spent} />
                                </ProgressBar>
                            </td>

                            <td className={s.ProgressCell} title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 4), null, 4)}>
                                <ProgressBar value={row.certs_leftover} max={row.max_certs_leftover} color="var(--cert-progress)">
                                    <IconOnlyResourceBadge resource="cert" />
                                    {Math.floor(row.certs_leftover)} <Details value={row.certs_gained} />
                                </ProgressBar>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    )
}


function Details({ value }: { value: number | string }) {
    if (typeof value === 'string')
        return <small className={s.Details}>{value}</small>
    if (value === 0)
        return null
    else if (value > 0)
        return <small className={s.Details}>+{value}</small>
    else
        return <small className={s.Details}>-{Math.abs(value)}</small>
}


/** Convert YYYY-MM-DD to Jan 01 Mon */
function formatDate(dateStr: string, dayofweek: number): string {
    const [_, month, day] = dateStr.split('-')
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return `${months[parseInt(month) - 1]} ${day} ${days[dayofweek - 1]}`
}


function ProgressBar({ value, max, color, children }: { value: number, max: number, color: string, children: ReactNode }) {
    const percentage = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0
    return (
        <div className={s.ProgressBar}>
            {/* The progress bar background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${percentage}%`,
                backgroundColor: color,
                zIndex: 0,
                transition: 'width 0.3s ease',
            }} />
            {/* The cell content */}
            <span style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                {children}
            </span>
        </div>
    )
}
