type Resource = "orundum" | "op" | "tickets" | "monthly_card" | "no_op" | "plus_op"

type Props = {
    type: Resource
    size?: number
    ext?: string
}

export default function Icon({ type, size = 40, ext = "png" }: Props) {
    return (
        <img
            src={import.meta.env.VITE_ASSETS_BASE_URL + `icons/${type}.${ext}`}
            alt={type}
            style={{ width: size, height: size, objectFit: "contain" }}
        />
    )
}