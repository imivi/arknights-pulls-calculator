import { env } from "../env"

type Resource = "orundum" | "op" | "ticket" | "monthly_card"

type Props = {
    type: Resource
    size?: number
}

export default function Icon({ type, size = 40 }: Props) {
    return (
        <img
            src={env.ASSETS_BASE_URL + `icons/${type}.png`}
            alt={type}
            style={{ width: size, height: size, objectFit: "contain" }}
        />
    )
}