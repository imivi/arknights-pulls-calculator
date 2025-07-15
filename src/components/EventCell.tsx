import { CSSProperties } from "react"
import { useClearedReruns } from "../hooks/useClearedReruns"
import { Colors } from "../scripts/get-image-colors"
import { DayWithResources } from "../types"
import s from "./EventCell.module.scss"
import Icon from "./Icon"


type Props = {
    day: DayWithResources
    colors: Colors | null
}

export default function EventCell({ day, colors }: Props) {

    const { clearedReruns, toggleClearedRerun } = useClearedReruns()

    if (day.rowSpan === 0)
        return null

    const eventCellStyle = getEventCellStyle(colors)
    const eventNameStyle = getEventNameStyle(colors)

    return (
        <td className={s.EventCell} rowSpan={day.rowSpan} style={eventCellStyle} data-column="event">
            {
                day.description &&
                <label style={eventNameStyle}>
                    {
                        day.event_link &&
                        <a className={s.event_title} href={day.event_link} target="_blank">
                            {day.description}
                            <Icon type="external-link" size={16} ext="svg" />
                        </a>
                    }
                    {
                        !day.event_link &&
                        <span className={s.event_title}>{day.description}</span>
                    }
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



/** Render the event cell as a link, if a url is provided */
// function LinkToEvent({ url, children }: { url?: string, children: ReactNode }) {
//     if (url) {
//         return <a href={url} target="_blank" rel="noreferrer">{children}</a>
//     }
//     return children
// }


function getEventNameStyle(eventColors: Colors | null): CSSProperties {

    if (!eventColors)
        return {}

    const [h, s, _] = eventColors?.light.hsl

    return {
        color: eventColors.dark.hex,
        backgroundColor: `hsla(${h}, ${s}%, 90%, 0.8)`,
    }
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
