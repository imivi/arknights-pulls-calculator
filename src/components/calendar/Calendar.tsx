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
import { resourceLabels } from '../../labels'
import { useResourceAdjustments } from '../../hooks/useResourceAdjustments'


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

    const { getResourceAdjustment } = useResourceAdjustments()

    // Filter resourcesGainedOrSpentByDay by resource type (orundum, tickets, op, certs)
    function getResourcesSpentByDay(allResources: Record<string, ResourceChange[]>, resourceNum: number) {
        return Object.entries(allResources)
            .filter(([_, resources]) => resources.some(res => res.resource === resourceNum))
            .reduce((acc, [day, resources]) => {
                acc[day] = resources.filter(res => res.resource === resourceNum)
                return acc
            }, {} as Record<string, ResourceChange[]>)
    }

    const orundumSpentByDay = getResourcesSpentByDay(resourcesGainedOrSpentByDay, 1)
    const ticketsSpentByDay = getResourcesSpentByDay(resourcesGainedOrSpentByDay, 2)
    const opSpentByDay = getResourcesSpentByDay(resourcesGainedOrSpentByDay, 3)
    const certsSpentByDay = getResourcesSpentByDay(resourcesGainedOrSpentByDay, 4)

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
                                <td></td>
                            }

                            {/* Date */}
                            <td className={s.date_cell}>
                                {!row.date_confirmed && <Stripes color={row.color_dark_hex!} />}
                                {formatDate(row.day, row.weekday)}
                            </td>

                            {userSpentPulls && <td>{row.pulls_spent}</td>}

                            {/* Pulls */}
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
                                        <Details
                                            value={`${row.pulls_available_excl_op} + ${row.pulls_available_incl_op - row.pulls_available_excl_op}`}
                                            highlight={false}
                                        // highlight={opSpentByDay[row.day]}
                                        />
                                    }
                                </DualProgressBar>
                                {/* </ProgressBar> */}
                            </td>

                            {/* Orundum */}
                            <td className={s.ProgressCell}
                            // title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 1), null, 4)}
                            >

                                <ProgressBar value={row.orundum_leftover} max={row.max_orundum_leftover} color="var(--orundum-progress)">

                                    <ResourceMenu row={row} resource="orundum">
                                        <button
                                            className={s.btn_open_menu}
                                            aria-label="Spend or gain resources"
                                            data-tooltip-id={row.day + ':' + 'orundum'}
                                        >
                                            <IconOnlyResourceBadge resource="orundum" />
                                            {formatOrundum(row.orundum_leftover)}
                                            <Details
                                                value={row.orundum_gained - row.orundum_spent}
                                                highlight={!!getResourceAdjustment(row.day, 'orundum')}
                                            />
                                        </button>
                                    </ResourceMenu>

                                </ProgressBar>

                                <div className={s.tooltip}>
                                    <Tooltip id={row.day + ':' + 'orundum'} place="bottom">
                                        <p>Click to add or deduct orundum</p>
                                        <ul>
                                            {
                                                orundumSpentByDay[row.day] &&
                                                Object.values(orundumSpentByDay[row.day])
                                                    .map((res, i) => <li key={i}>{res.amount} {resourceLabels[res.source] || res.source}</li>)
                                            }
                                        </ul>
                                    </Tooltip>
                                </div>

                            </td>

                            {/* Tickets */}
                            {/* <td className={s.ProgressCell} title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 2), null, 4)}>
                                <ProgressBar value={row.tickets_leftover} max={row.max_tickets_leftover} color="var(--ticket-progress)">
                                    <IconOnlyResourceBadge resource="tickets" />
                                    {row.tickets_leftover}
                                    <Details
                                        value={row.tickets_gained - row.tickets_spent}
                                        highlight={!!getResourceAdjustment(row.day, 'tickets')}
                                    />
                                </ProgressBar>
                            </td> */}

                            <td className={s.ProgressCell}
                            // title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 1), null, 4)}
                            >

                                <ProgressBar value={row.tickets_leftover} max={row.max_tickets_leftover} color="var(--ticket-progress)">

                                    <ResourceMenu row={row} resource="tickets">
                                        <button
                                            className={s.btn_open_menu}
                                            aria-label="Spend or gain resources"
                                            data-tooltip-id={row.day + ':' + 'tickets'}
                                        >
                                            <IconOnlyResourceBadge resource="tickets" />
                                            {row.tickets_leftover}
                                            <Details
                                                value={row.tickets_gained - row.tickets_spent}
                                                highlight={!!getResourceAdjustment(row.day, 'tickets')}
                                            />
                                        </button>
                                    </ResourceMenu>

                                </ProgressBar>

                                <div className={s.tooltip}>
                                    <Tooltip id={row.day + ':' + 'tickets'} place="bottom">
                                        <p>Click to add or deduct tickets</p>
                                        <ul>
                                            {
                                                ticketsSpentByDay[row.day] &&
                                                Object.values(ticketsSpentByDay[row.day])
                                                    .map((res, i) => <li key={i}>{res.amount} {resourceLabels[res.source] || res.source}</li>)
                                            }
                                        </ul>
                                    </Tooltip>
                                </div>

                            </td>

                            {/* OP */}
                            <td className={s.ProgressCell}
                            // title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 1), null, 4)}
                            >

                                <ProgressBar value={row.op_leftover} max={row.max_op_leftover} color="var(--op-progress)">

                                    <ResourceMenu row={row} resource="op">
                                        <button
                                            className={s.btn_open_menu}
                                            aria-label="Spend or gain resources"
                                            data-tooltip-id={row.day + ':' + 'op'}
                                        >
                                            <IconOnlyResourceBadge resource="op" />
                                            {row.op_leftover}
                                            <Details
                                                value={row.op_gained - row.op_spent}
                                                highlight={!!getResourceAdjustment(row.day, 'op')}
                                            />
                                        </button>
                                    </ResourceMenu>

                                </ProgressBar>

                                <div className={s.tooltip}>
                                    <Tooltip id={row.day + ':' + 'op'} place="bottom">
                                        <p>Click to add or deduct op</p>
                                        <ul>
                                            {
                                                opSpentByDay[row.day] &&
                                                Object.values(opSpentByDay[row.day])
                                                    .map((res, i) => <li key={i}>{res.amount} {resourceLabels[res.source] || res.source}</li>)
                                            }
                                        </ul>
                                    </Tooltip>
                                </div>

                            </td>

                            {/* Certificates */}
                            <td className={s.ProgressCell}
                            // title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 1), null, 4)}
                            >

                                <ProgressBar value={row.certs_leftover} max={row.max_certs_leftover} color="var(--cert-progress)">

                                    <ResourceMenu row={row} resource="cert">
                                        <button
                                            className={s.btn_open_menu}
                                            aria-label="Spend or gain resources"
                                            data-tooltip-id={row.day + ':' + 'certs'}
                                        >
                                            <IconOnlyResourceBadge resource="cert" />
                                            {row.certs_leftover}
                                            <Details
                                                value={row.certs_gained}
                                                highlight={!!getResourceAdjustment(row.day, 'cert')}
                                            />
                                        </button>
                                    </ResourceMenu>

                                </ProgressBar>

                                <div className={s.tooltip}>
                                    <Tooltip id={row.day + ':' + 'certs'} place="bottom">
                                        <p>Click to add or deduct certs</p>
                                        <ul>
                                            {
                                                certsSpentByDay[row.day] &&
                                                Object.values(certsSpentByDay[row.day])
                                                    .map((res, i) => <li key={i}>{res.amount} {resourceLabels[res.source] || res.source}</li>)
                                            }
                                        </ul>
                                    </Tooltip>
                                </div>

                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div >
    )
}



function formatSignedValue(value: number) {
    if (value === 0)
        return '0'
    else if (value > 0)
        return `+${value}`
    else
        return `-${Math.abs(value)}`
}


function Details({ value, highlight }: { value: number | string, highlight: boolean }) {
    if (typeof value === 'string')
        return <small className={s.Details}>{value}</small>
    if (value === 0)
        return null
    else
        return <small className={s.Details} data-highlight={!!highlight}>{formatSignedValue(value)}</small>
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
            <div className={s.Bar} style={{ width: `${percentage}%`, backgroundColor: color }} />
            {/* The cell content */}
            <span className={s.Content}>
                {children}
            </span>
        </div>
    )
}
