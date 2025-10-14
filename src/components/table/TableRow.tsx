import s from "./TableRow.module.scss"

import imageColors from "../../data/image-colors.json"
import ResourceBadge from "./ResourceBadge"
import { Tooltip } from "react-tooltip"
import EventCell from "./EventCell"
import PullCount from "./PullCount"
import { useMemo } from "react"
import { Colors } from "../../scripts/get-image-colors"
import { resourceLabels } from "../../labels"
import { useClearedTodayStore } from "../../stores/useClearedTodayStore"
import { useDarkModeStore } from "../../stores/useDarkModeStore"
import { useShowResourcesStore } from "../../stores/useShowResourcesStore"
import { Day, Resource, ResourceGained } from "../../types"
import Icon from "../Icon"
import ResourceMenu from "../menus/ResourceMenu"

const colors = imageColors as unknown as Record<string, Colors>



const todayTooltipId = "tooltip-cleared-today"


type RowProps = {
    day: Day
    rowIsEven: boolean
    isToday: boolean
}


export default function TableRow({ day, rowIsEven, isToday }: RowProps) {

    const colors = getImageColors(day.event_id)

    const darkMode = useDarkModeStore(store => store.darkMode)

    const tooltipPullsTotal = "tooltip-pulls-total-" + day.date
    const tooltipPullsOrundum = "tooltip-pulls-orundum-" + day.date
    const tooltipPullsOP = "tooltip-pulls-op-" + day.date
    const tooltipMonthlyCard = "tooltip-monthly-card-" + day.date

    const { dayOfMonth, month, weekDay } = useMemo(() => getDateValues(day.date), [day.date])

    const { clearedToday, setClearedToday } = useClearedTodayStore()

    const { showResources } = useShowResourcesStore()

    return (
        <tr className={s.TableRow} data-dark={darkMode} data-even={rowIsEven}>

            <EventCell
                colors={colors}
                day={day}
            />

            <td
                data-event-id={day.event_id}
                data-dark={darkMode}
                data-even={rowIsEven}
                className={s.day_cell}
                data-cleared={isToday && clearedToday}
            >

                <span className={s.date} data-interactive={isToday}>
                    {
                        isToday &&
                        <input
                            type="checkbox"
                            name={todayTooltipId}
                            checked={clearedToday}
                            id="checkbox-today-cleared"
                            onChange={(e) => setClearedToday(e.target.checked)}
                        />
                    }

                    <label
                        data-interactive={isToday}
                        data-tooltip-id={isToday ? todayTooltipId : ""}
                        htmlFor={isToday ? "checkbox-today-cleared" : ""}
                    // title={JSON.stringify(day, null, 4)}
                    >
                        {month}&nbsp;{dayOfMonth}&nbsp;
                        <small>{weekDay.toUpperCase()}</small>
                    </label>

                    {
                        isToday &&
                        <Tooltip id={todayTooltipId} style={{ zIndex: 9 }} place="right">
                            Already cleared?
                        </Tooltip>
                    }
                </span>

            </td>

            <td
                className={s.align_right}
                data-column="pulls-total"
                data-tooltip-id={tooltipPullsTotal}
                data-dark={darkMode}
                data-event-id={day.rowSpan > 0 ? day.event_id : ""}
                data-even={rowIsEven}
            >
                <PullCount day={day} even={rowIsEven} />
            </td>

            <td
                data-column="pulls-breakdown"
                data-dark={darkMode}
                data-event-id={day.rowSpan > 0 ? day.event_id : ""}
                data-even={rowIsEven}
            >
                <span>
                    <span data-dark={darkMode} className={s.pulls_breakdown}>
                        <span data-dark={darkMode} data-cell="pulls-from-orundum" data-tooltip-id={tooltipPullsOrundum}>
                            {day.pullsAvailableWithoutOP.toFixed()}
                            <Tooltip id={tooltipPullsOrundum} style={{ zIndex: 9 }} place="bottom">
                                {day.pullsAvailableWithoutOP.toFixed()} pulls from orundum/permits
                            </Tooltip>
                        </span>
                        <span data-dark={darkMode} data-cell="pulls-from-op" className={s.align_left} data-tooltip-id={tooltipPullsOP}>
                            +&nbsp;{day.pullsAvailableFromOP.toFixed()}
                            <Tooltip id={tooltipPullsOP} style={{ zIndex: 9 }} place="bottom">
                                {(day.pullsAvailableFromOP).toFixed()} pulls from converting up to {day.cumulativeResources.op} OP
                            </Tooltip>
                        </span>
                        <div className={s.arrow_container} data-dark={darkMode} />
                    </span>
                </span>
            </td>

            <td
                data-column="pulls-free"
                data-dark={darkMode}
                data-event-id={day.rowSpan > 0 ? day.event_id : ""}
                data-even={rowIsEven}
            >
                {day.freePulls > 0 && <small data-dark={darkMode}>+{day.freePulls}&nbsp;free</small>}
            </td>

            <td
                data-show-global={showResources}
                data-resource="orundum"
                data-dark={darkMode}
                data-event-id={day.rowSpan > 0 ? day.event_id : ""}
                data-even={rowIsEven}
            >
                <div className={s.resources}>
                    <ResourceMenu day={day} resource="orundum" />
                    <ResourceBadgeWithTooltip day={day} resource="orundum" />
                </div>
            </td>
            <td
                data-show-global={showResources}
                data-resource="tickets"
                data-dark={darkMode}
                data-event-id={day.rowSpan > 0 ? day.event_id : ""}
                data-even={rowIsEven}
            >
                <div className={s.resources}>
                    <ResourceMenu day={day} resource="tickets" />
                    <ResourceBadgeWithTooltip day={day} resource="tickets" />
                </div>
            </td>
            <td
                data-show-global={showResources}
                data-resource="op"
                data-dark={darkMode}
                data-event-id={day.rowSpan > 0 ? day.event_id : ""}
                data-even={rowIsEven}
            >
                <div className={s.resources}>
                    <ResourceMenu day={day} resource="op" />
                    <ResourceBadgeWithTooltip day={day} resource="op" />
                </div>
            </td>

            <td
                data-column="monthly-card"
                data-dark={darkMode}
                data-event-id={day.rowSpan > 0 ? day.event_id : ""}
                data-even={rowIsEven}
            >
                <div className={s.icons}>
                    {
                        day.free_monthly_card &&
                        <>
                            <span data-tooltip-id={tooltipMonthlyCard}>
                                <Icon type="monthly_card" size={20} /></span>
                            <Tooltip id={tooltipMonthlyCard} style={{ zIndex: 9 }}>
                                Free monthly card
                            </Tooltip>
                        </>
                    }
                </div>
            </td>

        </tr>
    )
}



function ResourceBadgeWithTooltip({ day, resource }: { day: Day, resource: Resource }) {

    const infoToShow = day.activeResourcesInfo[resource]//.filter(item => item.value !== 0)

    if (infoToShow.length === 0)
        return null

    return (
        <ResourceBadge
            resource={resource}
            value={day.resourcesGainedToday[resource]}
            tooltipId={day.date + "-" + resource}
        >
            <ResourcesGained resources={infoToShow} />
        </ResourceBadge>
    )
}


function ResourcesGained({ resources }: { resources: ResourceGained[] }) {

    const items = resources.filter(resource => resource.value !== 0)

    return (
        <ul>
            {
                items.map((item, i) => (
                    <li key={i}>{`${item.value} ${resourceLabels[item.source] || item.source}`}</li>
                ))
            }
        </ul>
    )
}


function getDateValues(date: string) {

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
