import s from "./Icon.module.scss"

type Resource = "orundum" | "op" | "tickets" | "monthly_card" | "no_op" | "plus_op"

type Props = {
    type: Resource
    size?: number
    ext?: string
    inline?: boolean
}

export default function Icon({ type, size = 40, ext = "png", inline = true }: Props) {
    return (
        <img
            className={s.Icon}
            src={import.meta.env.VITE_ASSETS_BASE_URL + `icons/${type}.${ext}`}
            alt={type}
            style={{ width: size, height: size }}
            data-inline={inline}
        />
    )
}