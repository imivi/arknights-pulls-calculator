type Resource = "orundum" | "op" | "ticket" | "monthly_card" | "no_op" | "plus_op"

type Props = {
    type: Resource
    size?: number
}

export default function Icon({ type, size = 40 }: Props) {
    return (
        <img
            src={import.meta.env.VITE_ASSETS_BASE_URL + `icons/${type}.png`}
            alt={type}
            style={{ width: size, height: size, objectFit: "contain" }}
        />
    )
}