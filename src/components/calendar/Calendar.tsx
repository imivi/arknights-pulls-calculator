import s from './Calendar.module.scss'

import { useDarkModeStore } from '../../stores/useDarkModeStore'
import EventCell from './EventCell'
import { ResourceChange } from '../../utils/pipeline'
import { IconOnlyResourceBadge } from '../table/ResourceBadge'
import { CalendarRow } from '../../types'
import { formatOrundum, TODAY } from '../../utils/utils'
import Stripes from '../table/Stripes'
import { CSSProperties, ReactNode, useRef } from 'react'
import { DualProgressBar } from './DualProgressBar'
import { useSpendOpStore } from '../../stores/useSpendOpStore'
import ResourceMenu from './ResourceMenu'
import { Tooltip } from 'react-tooltip'
import { resourceLabels } from '../../labels'
import { useResourceAdjustments } from '../../hooks/useResourceAdjustments'
import PullsMenu from './PullsMenu'
import { useStartingResourcesStore } from '../../stores/useStartingResourcesStore'
import { useShowDailyResourceChangeStore } from '../../stores/useShowDailyResourceChangeStore'
import { useShowResourcesStore } from '../../stores/useShowResourcesStore'
import { useDayClearedStore } from '../../stores/useDayClearedStore'



type Props = {
    rows: CalendarRow[]
    resourcesGainedOrSpentByDay: Record<string, ResourceChange[]>
}

export default function Calendar({ rows, resourcesGainedOrSpentByDay }: Props) {
    const { darkMode } = useDarkModeStore()

    // These are refs on the available pull counts
    // when the user clicks on a nearby pull count, click on the ref
    const pullButtonsRef = useRef<Record<string, HTMLButtonElement | null>>({})

    function onSpentPullsClick(day: string) {
        const targetButton = pullButtonsRef.current[day]
        if (targetButton) {
            targetButton.click()
        }
    }

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

    const { showDailyResourceChange } = useShowDailyResourceChangeStore()
    const { dayCleared, setDayCleared } = useDayClearedStore()

    const showResourceColumns = useShowResourcesStore(store => store.showResources)

    return (
        <div className={s.Calendar} data-dark={darkMode} data-show-resources={showResourceColumns}>
            <table>
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Day</th>

                        {userSpentPulls && <th>Pulls<br />spent</th>}

                        <th>
                            {/* <IconOnlyResourceBadge resource="pulls" /> */}
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

                        <th>Free<br />pulls</th>

                        <th data-show={showResourceColumns}><IconOnlyResourceBadge resource="orundum" /> Orundum</th>
                        <th data-show={showResourceColumns}><IconOnlyResourceBadge resource="tickets" /> Tickets</th>
                        <th data-show={showResourceColumns}><IconOnlyResourceBadge resource="op" /> OP</th>
                        <th data-show={showResourceColumns}><IconOnlyResourceBadge resource="certs" /> Certs</th>
                    </tr>
                </thead>

                <tbody>
                    {rows.map((row, i) => {

                        const yesterday = rows[i - 1]

                        return (
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
                                    onClick={() => {
                                        // For debug
                                        if (import.meta.env.DEV)
                                            console.log({ row, resources: resourcesGainedOrSpentByDay[row.day] })
                                    }}
                                >
                                    {/* {!row.date_confirmed && <Stripes color={row.color_dark_hex!} />} */}
                                    <span data-interactive={i === 0} data-tooltip-id={row.day}>
                                        {
                                            i === 0 &&
                                            <input
                                                type="checkbox"
                                                checked={dayCleared === TODAY}
                                                onChange={() => setDayCleared(dayCleared ? null : TODAY)}
                                                name='checkbox-today-cleared'
                                                id="checkbox-today-cleared"
                                            />
                                        }
                                        <label htmlFor={i === 0 ? 'checkbox-today-cleared' : undefined}>
                                            {formatDate(row.day, row.weekday)}
                                        </label>
                                    </span>
                                    {/* <Tooltip id={row.day} style={{ zIndex: 2 }} place="bottom">
                                    {row.day}
                                </Tooltip> */}
                                </td>

                                {
                                    userSpentPulls &&
                                    <td className={s.pulls_spent_cell}>
                                        {row.pulls_spent > 0 &&
                                            <button
                                                className={s.pulls_spent}
                                                data-dark={darkMode}
                                                onClick={() => { import.meta.env.DEV && onSpentPullsClick(row.day); console.log(row.day) }}
                                            >
                                                {row.pulls_spent}
                                            </button>
                                        }
                                    </td>
                                }

                                {/* Pulls */}
                                <td className={s.ProgressCell} data-column="pulls" data-tooltip-id={row.day + "-pulls"}>
                                    {/* <ProgressBar value={row.pulls_available_incl_op} max={row.max_pulls_leftover} color="var(--pulls-progress)"> */}
                                    <PullsMenu row={row}>
                                        <button className={s.btn_open_menu} aria-label="Spend pulls" ref={(el) => { pullButtonsRef.current[row.day] = el }}>
                                            <DualProgressBar
                                                value1={row.pulls_available_excl_op}
                                                value2={row.pulls_available_incl_op - row.pulls_available_excl_op}
                                                max={row.max_pulls_leftover}
                                            >
                                                {/* <IconOnlyResourceBadge resource="pulls" /> */}
                                                <span>{row.pulls_available_incl_op}&nbsp;pull{row.pulls_available_incl_op > 1 && 's'}&nbsp;</span>
                                                <Details
                                                    value={<>{row.pulls_available_excl_op}&nbsp;+&nbsp;{row.pulls_available_incl_op - row.pulls_available_excl_op}</>}
                                                    highlight={false}
                                                    showUnhighlighted={false}
                                                    show={spendOp}
                                                // highlight={opSpentByDay[row.day]}
                                                />
                                            </DualProgressBar>
                                        </button>
                                    </PullsMenu>

                                    <Tooltip id={row.day + "-pulls"} style={{ zIndex: 2 }} place="bottom">
                                        {row.pulls_available_excl_op} pulls from {formatOrundum(row.orundum_spendable)} orundum and {row.tickets_spendable} tickets
                                        <br />
                                        {row.pulls_available_incl_op - row.pulls_available_excl_op} pulls from converting up to {row.op_spendable} OP
                                    </Tooltip>
                                </td>

                                {/* Free pulls */}
                                <td>
                                    {
                                        row.free_pulls > 0 &&
                                        <small className={s.free_pulls}>
                                            +{row.free_pulls}&nbsp;free
                                        </small>
                                    }
                                </td>

                                {/* Orundum */}
                                < td className={s.ProgressCell} data-show={showResourceColumns} >

                                    <ProgressBar
                                        value={row.orundum_leftover}
                                        max={row.max_orundum_leftover}
                                        resource="orundum" odd={i % 2 === 1}
                                        show={yesterday?.orundum_leftover !== row.orundum_leftover}
                                    >

                                        <ResourceMenu row={row} resource="orundum">
                                            <button
                                                className={s.btn_open_menu}
                                                aria-label="Spend or gain resources"
                                                data-tooltip-id={row.day + ':' + 'orundum'}
                                            >
                                                {/* <IconOnlyResourceBadge resource="orundum" /> */}
                                                {formatOrundum(row.orundum_leftover)}
                                                <Details
                                                    value={row.orundum_gained - row.orundum_spent}
                                                    highlight={!!getResourceAdjustment(row.day, 'orundum')}
                                                    showUnhighlighted={showDailyResourceChange}
                                                    show={showDailyResourceChange}
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

                                <td className={s.ProgressCell} data-show={showResourceColumns} >

                                    <ProgressBar
                                        value={row.tickets_leftover}
                                        max={row.max_tickets_leftover}
                                        resource="tickets" odd={i % 2 === 1}
                                        show={yesterday?.tickets_leftover !== row.tickets_leftover}
                                    >

                                        <ResourceMenu row={row} resource="tickets">
                                            <button
                                                className={s.btn_open_menu}
                                                aria-label="Spend or gain resources"
                                                data-tooltip-id={row.day + ':' + 'tickets'}
                                            >
                                                {/* <IconOnlyResourceBadge resource="tickets" /> */}
                                                {row.tickets_leftover}
                                                <Details
                                                    value={row.tickets_gained - row.tickets_spent}
                                                    highlight={!!getResourceAdjustment(row.day, 'tickets')}
                                                    showUnhighlighted={showDailyResourceChange}
                                                    show={showDailyResourceChange}
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
                                <td className={s.ProgressCell} data-show={showResourceColumns} >

                                    <ProgressBar value={row.op_leftover} max={row.max_op_leftover} resource="op" odd={i % 2 === 1} show={yesterday?.op_leftover !== row.op_leftover}>

                                        <ResourceMenu row={row} resource="op">
                                            <button
                                                className={s.btn_open_menu}
                                                aria-label="Spend or gain resources"
                                                data-tooltip-id={row.day + ':' + 'op'}
                                            >
                                                {/* <IconOnlyResourceBadge resource="op" /> */}
                                                {row.op_leftover}
                                                <Details
                                                    value={row.op_gained - row.op_spent}
                                                    highlight={!!getResourceAdjustment(row.day, 'op')}
                                                    showUnhighlighted={showDailyResourceChange}
                                                    show={showDailyResourceChange}
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
                                <td className={s.ProgressCell} data-show={showResourceColumns} >

                                    <ProgressBar value={row.certs_leftover} max={row.max_certs_leftover} resource="certs" odd={i % 2 === 1} show={yesterday?.certs_leftover !== row.certs_leftover}>

                                        <ResourceMenu row={row} resource="certs">
                                            <button
                                                className={s.btn_open_menu}
                                                aria-label="Spend or gain resources"
                                                data-tooltip-id={row.day + ':' + 'certs'}
                                            >
                                                {/* <IconOnlyResourceBadge resource="certs" /> */}
                                                {Math.floor(row.certs_leftover)}
                                                <Details
                                                    value={row.certs_gained}
                                                    highlight={!!getResourceAdjustment(row.day, 'certs')}
                                                    showUnhighlighted={showDailyResourceChange}
                                                    show={showDailyResourceChange}
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
                        )
                    })}
                </tbody>
            </table >
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


function Details({ value, highlight, showUnhighlighted, show }: { value: number | string | ReactNode, highlight: boolean, showUnhighlighted: boolean, show: boolean }) {

    // If show=false, hide the element; otherwise, only show it showUnhighlighted=true; always show highlighted values
    // const visible = show && (highlight || showUnhighlighted)
    const visible = highlight || show || showUnhighlighted

    if (typeof value === 'string')
        return <small className={s.Details} data-show={visible}>{value}</small>
    if (value === 0)
        return null
    else if (typeof value === 'number')
        return <small className={s.Details} data-show={visible} data-highlight={!!highlight}>{formatSignedValue(value)}</small>
    else
        return <small className={s.Details} data-show={visible} data-highlight={!!highlight}>{value}</small>
}


/** Convert YYYY-MM-DD to Jan 01 Mon */
function formatDate(dateStr: string, dayofweek: number): string {
    const [_, month, day] = dateStr.split('-')
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    return `${months[parseInt(month) - 1]} ${day} ${days[dayofweek - 1]}`
}


function ProgressBar({ value, max, resource, odd, children, show }: { value: number, max: number, resource: "orundum" | "tickets" | "op" | "certs", odd: boolean, children: ReactNode, show: boolean }) {
    const percentage = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0
    return (
        <div className={s.ProgressBar} data-resource={resource} data-odd={odd}>
            {/* The progress bar background */}
            {/* {show && <div className={s.Bar} style={{ width: `${percentage}%` }} />} */}
            <div className={s.Bar} style={{ width: `${percentage}%` }} />
            {/* The cell content */}
            <span className={s.Content}>{children}</span>
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
            backgroundColor: `hsla(${row.color_dark_hue}, ${row.color_dark_sat! - 10}%, ${row.color_dark_light! + 45}%, ${alpha})`,
        }
    }

}
