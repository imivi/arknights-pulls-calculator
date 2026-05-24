import s from './Calendar.module.scss'

import { useDarkModeStore } from '../../stores/useDarkModeStore'
import EventCell from './EventCell'
import { ResourceChange } from '../../utils/pipeline'
import { IconOnlyResourceBadge } from '../table/ResourceBadge'
import { CalendarRow } from '../../types'
import { formatOrundum } from '../../utils/utils'
import Stripes from '../table/Stripes'
import { CSSProperties, ReactNode } from 'react'
import { DualProgressBar } from './DualProgressBar'
import { useSpendOpStore } from '../../stores/useSpendOpStore'
import ResourceMenu from './ResourceMenu'
import { Tooltip } from 'react-tooltip'
import { resourceLabels } from '../../labels'
import { useResourceAdjustments } from '../../hooks/useResourceAdjustments'
import PullsMenu from '../menus/PullsMenu'
import { useStartingResourcesStore } from '../../stores/useStartingResourcesStore'
import { useShowDailyResourceChangeStore } from '../../stores/useShowDailyResourceChangeStore'


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

    // const { startingResources } = useStartingResourcesStore()
    // console.log(startingResources)
    // console.log(rows[0])

    const { showDailyResourceChange } = useShowDailyResourceChangeStore()

    return (
        <div className={s.Calendar} data-dark={darkMode}>
            <table>
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Day</th>

                        {userSpentPulls && <th className={s.pulls_spent}>Pulls<br />spent</th>}

                        <th>
                            Pulls available
                            <br />
                            <IconOnlyResourceBadge resource="orundum" />
                            <IconOnlyResourceBadge resource="tickets" />
                            {spendOp && (
                                <>
                                    +
                                    <IconOnlyResourceBadge resource="op" />
                                </>
                            )}
                        </th>

                        <th>Orundum</th>
                        <th>Tickets</th>
                        <th>OP</th>
                        <th>Certs</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, i) => (
                        <tr key={row.day}>

                            {/* Event banner or empty cell */}
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
                            <td className={s.date_cell} style={getDateCellStyle(row, i % 2 === 0, darkMode)}
                                title={import.meta.env.DEV ? JSON.stringify(row, null, 4) : undefined}
                            >
                                {!row.date_confirmed && <Stripes color={row.color_dark_hex!} />}
                                <span>{formatDate(row.day, row.weekday)}</span>
                            </td>

                            {
                                userSpentPulls &&
                                <td className={s.pulls_spent_cell}>
                                    {row.pulls_spent > 0 ? <span className={s.pulls_spent}>{row.pulls_spent}</span> : null}
                                </td>
                            }

                            {/* Pulls */}
                            <td className={s.ProgressCell} data-column="pulls">
                                {/* <ProgressBar value={row.pulls_available_incl_op} max={row.max_pulls_leftover} color="var(--pulls-progress)"> */}
                                <PullsMenu row={row}>
                                    <DualProgressBar
                                        value1={row.pulls_available_excl_op}
                                        value2={row.pulls_available_incl_op - row.pulls_available_excl_op}
                                        color1="var(--pulls-progress)"
                                        color2="var(--op-progress)"
                                        max={row.max_pulls_leftover}
                                    >
                                        <IconOnlyResourceBadge resource="pulls" />
                                        {row.pulls_available_incl_op}&nbsp;pulls
                                        &nbsp;
                                        {
                                            spendOp &&
                                            <Details
                                                value={<>{row.pulls_available_excl_op}&nbsp;+&nbsp;{row.pulls_available_incl_op - row.pulls_available_excl_op}</>}
                                                highlight={false}
                                                showUnhighlighted={true}
                                            // highlight={opSpentByDay[row.day]}
                                            />
                                        }
                                    </DualProgressBar>
                                </PullsMenu>

                                {/* </ProgressBar> */}
                            </td>

                            {/* Orundum */}
                            <td className={s.ProgressCell}>

                                <ProgressBar value={row.orundum_leftover} max={row.max_orundum_leftover} resource="orundum">

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
                                                showUnhighlighted={showDailyResourceChange}
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

                            <td className={s.ProgressCell}>

                                <ProgressBar value={row.tickets_leftover} max={row.max_tickets_leftover} resource="tickets">

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
                                                showUnhighlighted={showDailyResourceChange}
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

                                <ProgressBar value={row.op_leftover} max={row.max_op_leftover} resource="op">

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
                                                showUnhighlighted={showDailyResourceChange}
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

                                {/* <td className={s.ProgressCell} title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 3), null, 4)}>
                                <ProgressBar value={row.op_leftover} max={row.max_op_leftover} color="var(--op-progress)">
                                    <IconOnlyResourceBadge resource="op" />
                                    {row.op_leftover} <Details value={row.op_gained - row.op_spent} />
                                </ProgressBar>
                            </td> */}

                            </td>

                            {/* Certificates */}
                            <td className={s.ProgressCell}
                            // title={JSON.stringify(resourcesGainedOrSpentByDay[row.day].filter(res => res.resource === 1), null, 4)}
                            >

                                <ProgressBar value={row.certs_leftover} max={row.max_certs_leftover} resource="certs">

                                    <ResourceMenu row={row} resource="cert">
                                        <button
                                            className={s.btn_open_menu}
                                            aria-label="Spend or gain resources"
                                            data-tooltip-id={row.day + ':' + 'certs'}
                                        >
                                            <IconOnlyResourceBadge resource="cert" />
                                            {Math.floor(row.certs_leftover)}
                                            <Details
                                                value={row.certs_gained}
                                                highlight={!!getResourceAdjustment(row.day, 'cert')}
                                                showUnhighlighted={showDailyResourceChange}
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


function Details({ value, highlight, showUnhighlighted }: { value: number | string | ReactNode, highlight: boolean, showUnhighlighted: boolean }) {
    if (!showUnhighlighted && !highlight)
        return null
    if (typeof value === 'string')
        return <small className={s.Details}>{value}</small>
    if (value === 0)
        return null
    else if (typeof value === 'number')
        return <small className={s.Details} data-highlight={!!highlight}>{formatSignedValue(value)}</small>
    else
        return <small className={s.Details} data-highlight={!!highlight}>{value}</small>
}


/** Convert YYYY-MM-DD to Jan 01 Mon */
function formatDate(dateStr: string, dayofweek: number): string {
    const [_, month, day] = dateStr.split('-')
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return `${months[parseInt(month) - 1]} ${day} ${days[dayofweek - 1]}`
}


function ProgressBar({ value, max, resource, children }: { value: number, max: number, resource: "orundum" | "tickets" | "op" | "certs", children: ReactNode }) {
    const percentage = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0
    return (
        <div className={s.ProgressBar} data-resource={resource}>
            {/* The progress bar background */}
            <div className={s.Bar} style={{ width: `${percentage}%` }} />
            {/* The cell content */}
            <span className={s.Content}>
                {children}
            </span>
        </div>
    )
}

function getDateCellStyle(row: CalendarRow, rowIsEven: boolean, darkMode: boolean): CSSProperties {

    const alpha = rowIsEven ? 0.7 : 0.4;

    if (darkMode) {
        return {
            color: "#eee",
            backgroundColor: `hsla(${row.color_light_hue}, ${row.color_light_sat}%, ${row.color_light_light}%, ${alpha})`,
        }
    }

    else {
        return {
            color: row.color_dark_hex,
            backgroundColor: `hsla(${row.color_dark_hue}, ${row.color_dark_sat}%, ${row.color_dark_light}%, ${alpha})`,
        }
    }

}