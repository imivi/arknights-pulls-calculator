import { CSSProperties } from "react"
import s from "./Stripes.module.scss"


type Props = {
    color: string
}

export default function Stripes({ color }: Props) {

    // If the event date is TBD, show stripes across the table cell
    const stripeStyle: CSSProperties = {
        background: `linear-gradient(${color} 0%, ${color} 50%, transparent 50%, transparent 100%)`,
        backgroundSize: "12px 12px",
        backgroundRepeat: "repeat",
    }

    return (
        <div className={s.Stripes} style={stripeStyle} />
    )
}