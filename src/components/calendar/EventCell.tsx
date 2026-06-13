import s from "./EventCell.module.scss"

import { CSSProperties, ReactNode } from "react"
import { useClearedReruns } from "../../hooks/useClearedReruns"
import { FaArrowUpRightFromSquare } from "react-icons/fa6"
import { FaExclamationTriangle } from "react-icons/fa"
import { CalendarRow } from "../../types"


type Props = {
    day: CalendarRow
    rowSpan: number
    showBannerOperators: boolean
}

export default function EventCell({ day, rowSpan, showBannerOperators }: Props) {

    const { clearedReruns, toggleClearedRerun } = useClearedReruns()

    if (rowSpan === 0)
        return null

    const eventCellStyle: CSSProperties = {
        verticalAlign: "top",
        border: "2px solid " + day.color_light_hex,
    }

    const eventNameStyle: CSSProperties = {
        color: day.color_dark_hex,
        backgroundColor: `hsla(${day.color_light_hue}, ${day.color_light_sat}%, 90%, 0.8)`,
    }

    const dateTBD = !day.date_confirmed

    const noBanner = !!day.is_limited && !!day.is_rerun

    let eventOps: string[] = []
    if (day.event_ops !== "")
        eventOps = day.event_ops!.split(",").map(s => s.trim())

    return (
        <td className={s.EventCell} rowSpan={rowSpan} style={eventCellStyle} data-column="event">

            <header style={eventNameStyle}>

                <a className={s.event_title} href={day.event_link} target="_blank" rel="noreferrer">
                    <span>{day.title}</span>
                    <FaArrowUpRightFromSquare size={12} />
                </a>

                {
                    (dateTBD || noBanner) &&
                    <ul className={s.warnings}>
                        {dateTBD && <li><Warning borderColor={day.color_dark_hex!} >Date TBD</Warning></li>}
                        {noBanner && <li><Warning borderColor={day.color_dark_hex!}>No banner</Warning></li>}
                    </ul>
                }

                {
                    eventOps.length > 0 &&
                    showBannerOperators &&
                    <Operators ops={eventOps} />
                }

                {
                    !!day.event_id &&
                    !!day.is_rerun &&
                    <label className={s.already_cleared}>
                        <input
                            type="checkbox"
                            checked={clearedReruns.includes(day.event_id)}
                            onChange={() => toggleClearedRerun(day.event_id!)}
                        />
                        already cleared
                    </label>
                }
            </header>

            {
                // Background image of the event
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
                    <a className={s.operator} href={"https://arknights.wiki.gg/wiki/" + op} target="_blank" rel="noreferrer">
                        <img className={s.operator_portrait} src={import.meta.env.VITE_ASSETS_BASE_URL + `operators/${op}.webp`} alt={op} />
                        {op.replaceAll("_", " ")}
                    </a>
                </li>
            ))}
        </ul>
    )
}



export function Warning({ borderColor, children }: { borderColor: string, children: ReactNode }) {
    return (
        <small className={s.warning} style={{ borderColor }}>
            <FaExclamationTriangle size={14} /> {children}
        </small>
    )
}