import s from "./TableRow.module.scss"

import { CSSProperties } from "react"
import { Colors } from "../scripts/get-image-colors"
import { DayWithResources, ResourceGained, DateString } from "../types"
import ResourceBadge from "./ResourceBadge"

import imageColors from "../data/image-colors.json"
import { useClearedReruns } from "../hooks/useClearedReruns"
import { Tooltip } from "react-tooltip"
import { useClearedTodayStore } from "../stores/useClearedTodayStore"

const colors = imageColors as unknown as Record<string, Colors>



type RowProps = {
    day: DayWithResources
    rowIsEven: boolean
    isToday: boolean
}


export default function TableRow({ day, rowIsEven, isToday }: RowProps) {

    const colors = getImageColors(day.event_id)

    const dayStyle = getDayStyle(colors, rowIsEven)
    const rowStyle = day.rowSpan > 0 ? { backgroundColor: dayStyle.backgroundColor } : {}

    const pullsWithoutOP = day.cumulativeResources.pullsWithoutOP()
    const pullsFromOP = day.cumulativeResources.opToPulls()

    const tooltipId = "total-pulls-" + day.dateString

    const { dayOfMonth, month, weekDay } = getDateValues(day.dateString)

    const { clearedToday, setClearedToday } = useClearedTodayStore()

    return (
        <tr className={s.TableRow}>

            <EventCell
                colors={colors}
                day={day}
            />

            <td style={dayStyle} className={s.day_cell} data-cleared={isToday && clearedToday}>
                <span className={s.date}>
                    <label data-interactive={isToday} htmlFor={isToday ? "checkbox-cleared-today" : ""}>{month}&nbsp;{dayOfMonth}</label>
                    {/* <small>{new Date(day.dateString).toUTCString()}</small> */}
                    {
                        isToday &&
                        <>
                            <input
                                type="checkbox"
                                name="checkbox-cleared-today"
                                checked={clearedToday}
                                id="checkbox-cleared-today"
                                data-tooltip-id="checkbox-cleared-today"
                                onChange={(e) => setClearedToday(e.target.checked)}
                            />
                            <Tooltip id="checkbox-cleared-today" style={{ zIndex: 9 }}>Already cleared</Tooltip>
                        </>
                    }
                    {!isToday && <small>{weekDay.toUpperCase()}</small>}
                </span>
            </td>

            {/* <td>{day.rowSpan}</td> */}

            <td className={s.align_right} data-column="pulls-total" data-even={rowIsEven} style={rowStyle} data-tooltip-id={tooltipId}>
                {pullsWithoutOP + pullsFromOP}
                {/* <Tooltip id={tooltipId} style={{ zIndex: 9 }} place="left">
                    <span>Pulls from orundum + permits: {pullsWithoutOP}</span>
                    <br />
                    <span>Pulls from OP: {pullsFromOP}</span>
                </Tooltip> */}
            </td>
            <td className={s.align_right} data-column="pulls-no-op" style={rowStyle}>
                ({pullsWithoutOP}
                {/* <Icon type="orundum" size={20} /> */}
                {/* <Icon type="ticket" size={20} /> */}
            </td>
            <td className={s.align_right} data-column="pulls-op" style={rowStyle}>
                +&nbsp;{pullsFromOP})
                {/* <Icon type="plus_op" size={20} /> */}
            </td>
            <td style={rowStyle} data-column="pulls-free">
                {day.freePulls > 0 && <small>+{day.freePulls}&nbsp;free</small>}
            </td>



            <td data-resource="orundum" style={rowStyle}>
                <div className={s.resources}>
                    {formatOrundum(day.cumulativeResources.orundum)}
                    {
                        day.totalResources.orundum > 0 &&
                        <ResourceBadge
                            resource="orundum"
                            value={day.totalResources.orundum}
                            tooltipId={day.dateString + "-orundum"}
                        >
                            <ResourcesGained sources={day.resourcesGained.orundum} />
                        </ResourceBadge>
                    }
                </div>
            </td>
            <td data-resource="tickets" style={rowStyle}>
                <div className={s.resources}>
                    {day.cumulativeResources.tickets}
                    {
                        day.totalResources.tickets > 0 &&
                        <ResourceBadge
                            resource="ticket"
                            value={day.totalResources.tickets}
                            tooltipId={day.dateString + "-tickets"}
                        >
                            <ResourcesGained sources={day.resourcesGained.tickets} />
                        </ResourceBadge>
                    }
                </div>
            </td>
            <td data-resource="op" style={rowStyle}>
                <div className={s.resources}>
                    {day.cumulativeResources.op}
                    {
                        day.totalResources.op > 0 &&
                        <ResourceBadge
                            resource="op"
                            value={day.totalResources.op}
                            tooltipId={day.dateString + "-op"}
                        >
                            <ResourcesGained sources={day.resourcesGained.op} />
                        </ResourceBadge>
                    }
                </div>
            </td>


        </tr>
    )
}


type EventCellProps = {
    day: DayWithResources
    colors: Colors | null
}

function EventCell({ day, colors }: EventCellProps) {

    if (day.rowSpan === 0)
        return null

    const eventCellStyle = getEventCellStyle(colors)
    const eventNameStyle = getEventNameStyle(colors)

    const { clearedReruns, toggleClearedRerun } = useClearedReruns()

    return (
        <td className={s.event_cell} rowSpan={day.rowSpan} style={eventCellStyle} data-column="event">
            {
                day.description &&
                <label style={eventNameStyle}>
                    <span>{day.description}</span>
                    {
                        day.event_id &&
                        day.description.toLowerCase().includes("rerun") &&
                        <label className={s.already_cleared}>
                            <input
                                type="checkbox"
                                checked={clearedReruns.includes(day.event_id)}
                                onChange={() => toggleClearedRerun(day.event_id!)}
                            />
                            already cleared
                        </label>
                    }
                </label>
            }
            {
                day.event_id &&
                <img className={s.bg} src={import.meta.env.VITE_ASSETS_BASE_URL + `events/${day.event_id}.jpg`} alt={day.event_id} />
            }
        </td>
    )
}


function ResourcesGained({ sources }: { sources: ResourceGained[] }) {
    return (
        <ul>
            {
                sources.map((source, i) => (
                    <li key={i}>{`${source.value} ${source.description}`}</li>
                ))
            }
        </ul>
    )
}


function formatOrundum(n: number): string {
    if (n < 1000)
        return n.toFixed(0)
    else
        return (n / 1000).toFixed(1) + "k"
}

function getDateValues(date: DateString) {

    const [weekDay, day, month] = new Date(date).toUTCString().split(" ")

    return {
        weekDay: weekDay.replace(",", ""),
        dayOfMonth: day,
        month,
    }
}

function getImageColors(img: string | undefined): Colors | null {
    if (img && (img in colors)) {
        return colors[img]
    }
    return null
}



function getEventNameStyle(eventColors: Colors | null): CSSProperties {

    if (!eventColors)
        return {}

    const [h, s, _] = eventColors?.light.hsl

    return {
        color: eventColors.dark.hex,
        backgroundColor: `hsla(${h}, ${s}%, 90%, 0.8)`,
    }
}


function getDayStyle(eventColors: Colors | null, rowIsEven: boolean): CSSProperties {

    if (eventColors?.light.hsl) {
        const [h, s, l] = eventColors?.light.hsl
        const opacity = rowIsEven ? 0.4 : 0.6
        return {
            backgroundColor: `hsla(${h}, ${s}%, ${l}%, ${opacity})`, // example: hsla(219, 71%, 43%, 0.391)
            color: eventColors?.dark.hex,
        }
    }
    return {}
}


function getEventCellStyle(colors: Colors | null): CSSProperties {

    if (colors) {
        return {
            verticalAlign: "top",
            border: "2px solid " + colors?.light.hex,
        }
    }

    return {}
}
