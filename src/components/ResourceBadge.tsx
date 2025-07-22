import s from "./ResourceBadge.module.scss"

import { ReactNode } from "react"
import { Tooltip } from 'react-tooltip'
import Icon from "./Icon"
import { useDarkModeStore } from "../stores/useDarkModeStore"
import { formatOrundum } from "../utils"


type Resource = "orundum" | "op" | "ticket"

type Props = {
    resource: Resource
    value: number
    tooltipId: string
    children: ReactNode
}

export default function ResourceBadge({ resource, value, tooltipId, children }: Props) {

    const { darkMode } = useDarkModeStore()

    return (
        <div
            className={s.ResourceBadge}
            data-resource={resource}
            data-tooltip-id={tooltipId}
            data-dark={darkMode}
        >
            <Icon type={resource} size={20} />
            {value > 0 && "+"}
            {Math.abs(value) >= 10_000 ? formatOrundum(value) : value}
            <Tooltip id={tooltipId} style={{ zIndex: 9 }}>{children}</Tooltip>
        </div>
    )
}
