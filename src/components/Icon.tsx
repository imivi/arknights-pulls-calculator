type Resource = "orundum" | "op" | "ticket" | "monthly_card"

type Props = {
    type: Resource
    size?: number
}

export default function Icon({ type, size = 40 }: Props) {
    return (
        <img
            src={`/icons/${type}.png`}
            alt={type}
            style={{ width: size, height: size, objectFit: "contain" }}
        />
    )
}