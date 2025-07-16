import s from "./TableRow.module.scss"

import { CSSProperties } from "react"
import { Colors } from "../scripts/get-image-colors"
import { DayWithResources, ResourceGained, DateString } from "../types"
import ResourceBadge from "./ResourceBadge"

import imageColors from "../data/image-colors.json"
import { Tooltip } from "react-tooltip"
import { useClearedTodayStore } from "../stores/useClearedTodayStore"
import { useDarkModeStore } from "../stores/useDarkModeStore"
import Icon from "./Icon"
import EventCell from "./EventCell"

const colors = imageColors as unknown as Record<string, Colors>



const todayTooltipId = "tooltip-cleared-today"


type RowProps = {
    day: DayWithResources
    rowIsEven: boolean
    isToday: boolean
    firstLoad: boolean
}


export default function TableRow({ day, rowIsEven, isToday, firstLoad }: RowProps) {

    const colors = getImageColors(day.event_id)

    const darkMode = useDarkModeStore(store => store.darkMode)

    const dayStyle = getDayStyle(colors, rowIsEven, darkMode)
    const rowStyle = day.rowSpan > 0 ? { backgroundColor: dayStyle.backgroundColor } : {}

    const pullsWithoutOP = day.cumulativeResources.pullsWithoutOP()
    const pullsFromOP = day.cumulativeResources.opToPulls()

    const tooltipPullsTotal = "tooltip-pulls-total-" + day.dateString
    const tooltipPullsOrundum = "tooltip-pulls-orundum-" + day.dateString
    const tooltipPullsOP = "tooltip-pulls-op-" + day.dateString
    const tooltipMonthlyCard = "tooltip-monthly-card-" + day.dateString

    const { dayOfMonth, month, weekDay } = getDateValues(day.dateString)

    const { clearedToday, setClearedToday } = useClearedTodayStore()

    return (
        <tr className={s.TableRow} data-dark={darkMode} data-even={rowIsEven}>

            <EventCell
                colors={colors}
                day={day}
            />

            <td style={dayStyle} className={s.day_cell} data-cleared={isToday && clearedToday}>
                <span className={s.date}>

                    <label
                        data-interactive={isToday}
                        htmlFor={isToday ? "checkbox-today-cleared" : ""}
                    >
                        {month}&nbsp;{dayOfMonth}
                    </label>
                    {
                        isToday &&
                        <>
                            <input
                                type="checkbox"
                                name={todayTooltipId}
                                checked={clearedToday}
                                id="checkbox-today-cleared"
                                data-tooltip-id={isToday ? todayTooltipId : ""}
                                onChange={(e) => setClearedToday(e.target.checked)}
                            />
                            <Tooltip id={todayTooltipId} style={{ zIndex: 9 }} place="right" defaultIsOpen={firstLoad && !clearedToday}>
                                Already cleared?
                            </Tooltip>
                        </>
                    }
                    {!isToday && <small>{weekDay.toUpperCase()}</small>}
                </span>
            </td>

            <td className={s.align_right} data-dark={darkMode} data-column="pulls-total" data-even={rowIsEven} style={rowStyle} data-tooltip-id={tooltipPullsTotal}>
                <span data-dark={darkMode} data-even={rowIsEven}>
                    <strong>{pullsWithoutOP + pullsFromOP}</strong>
                    <small>pulls</small>
                    <Tooltip id={tooltipPullsTotal} style={{ zIndex: 9 }} place="bottom">
                        {pullsWithoutOP + pullsFromOP} pulls from orundum/tickets
                        <br />
                        and from converting {day.cumulativeResources.op} OP
                    </Tooltip>
                </span>
            </td>

            <td data-dark={darkMode} data-column="pulls-breakdown" style={rowStyle}>
                <span data-dark={darkMode}>
                    <span data-dark={darkMode} data-cell="pulls-from-orundum" data-tooltip-id={tooltipPullsOrundum}>
                        {pullsWithoutOP}
                        <Tooltip id={tooltipPullsOrundum} style={{ zIndex: 9 }} place="bottom">
                            {pullsWithoutOP} pulls from orundum/permits
                        </Tooltip>
                    </span>
                    <span data-dark={darkMode} data-cell="pulls-from-op" className={s.align_left} data-tooltip-id={tooltipPullsOP}>
                        + {pullsFromOP}
                        <Tooltip id={tooltipPullsOP} style={{ zIndex: 9 }} place="bottom">
                            {pullsFromOP} pulls from converting {day.cumulativeResources.op} OP
                        </Tooltip>
                    </span>
                    <div className={s.arrow_container} data-dark={darkMode} />
                </span>
            </td>

            <td style={rowStyle} data-dark={darkMode} data-column="pulls-free">
                {day.freePulls > 0 && <small data-dark={darkMode}>+{day.freePulls}&nbsp;free</small>}
            </td>

            <td data-resource="orundum" data-dark={darkMode} style={rowStyle}>
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
            <td data-resource="tickets" data-dark={darkMode} style={rowStyle}>
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
            <td data-resource="op" data-dark={darkMode} style={rowStyle}>
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

            <td data-column="monthly-card" data-dark={darkMode} style={rowStyle}>
                {
                    day.freeMonthlyCard &&
                    <>
                        <span data-tooltip-id={tooltipMonthlyCard}>
                            <Icon type="monthly_card" size={20} /></span>
                        <Tooltip id={tooltipMonthlyCard} style={{ zIndex: 9 }}>
                            Free monthly card
                        </Tooltip>
                    </>
                }
            </td>

        </tr>
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


function getDayStyle(eventColors: Colors | null, rowIsEven: boolean, darkMode: boolean): CSSProperties {

    if (eventColors?.light.hsl) {
        const [h, s, l] = eventColors?.light.hsl
        const opacity = rowIsEven ? 0.4 : 0.7
        return {
            backgroundColor: `hsla(${h}, ${s}%, ${l}%, ${opacity})`, // example: hsla(219, 71%, 43%, 0.391)
            color: darkMode ? "#eee" : eventColors.dark.hex,
        }
    }
    return {}
}


