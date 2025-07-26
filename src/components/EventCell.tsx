import s from "./EventCell.module.scss"

import { CSSProperties } from "react"
import { useClearedReruns } from "../hooks/useClearedReruns"
import { Colors } from "../scripts/get-image-colors"
import { Day } from "../day"
import { FaArrowUpRightFromSquare } from "react-icons/fa6"


type Props = {
    day: Day
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
                day.event_name &&
                <label style={eventNameStyle}>
                    {
                        day.event_link &&
                        <a className={s.event_title} href={day.event_link} target="_blank" rel="noreferrer">
                            {day.event_name}
                            <FaArrowUpRightFromSquare size={12} />
                        </a>
                    }
                    {
                        !day.event_link &&
                        <span className={s.event_title}>{day.event_name}</span>
                    }
                    {
                        day.event_ops.length > 0 &&
                        <Operators ops={day.event_ops} />
                    }
                    {
                        day.event_id &&
                        day.event_name.toLowerCase().includes("rerun") &&
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


function Operators({ ops }: { ops: string[] }) {
    return (
        <ul className={s.Operators}>
            {ops.map(op => (
                <li key={op}>
                    <a href={"https://arknights.wiki.gg/wiki/" + op} target="_blank" rel="noreferrer">
                        <img src={import.meta.env.VITE_ASSETS_BASE_URL + `operators/${op}.png`} alt={op} />
                        {op.replaceAll("_", " ")}
                    </a>
                </li>
            ))}
        </ul>
    )
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


function getEventCellStyle(colors: Colors | null): CSSProperties {

    if (colors) {
        return {
            verticalAlign: "top",
            border: "2px solid " + colors?.light.hex,
        }
    }

    return {}
}
