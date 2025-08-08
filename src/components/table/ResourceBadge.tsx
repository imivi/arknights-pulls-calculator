import s from "./ResourceBadge.module.scss"

import { ReactNode } from "react"
import { Tooltip } from 'react-tooltip'
import Icon from "./../Icon"
import { useDarkModeStore } from "../../stores/useDarkModeStore"
import { formatOrundum } from "../../utils/utils"


type Resource = "orundum" | "op" | "tickets"

type Props = {
    resource: Resource
    value?: number
    tooltipId?: string
    children?: ReactNode
}

export default function ResourceBadge({ resource, value, tooltipId, children }: Props) {

    const { darkMode } = useDarkModeStore()

    function getLabel() {
        if (value) {
            const prefix = value > 0 ? "+" : ""
            const text = Math.abs(value) >= 10_000 ? formatOrundum(value) : value.toString()
            return prefix + text
        }
        return value
    }

    return (
        <div
            className={s.ResourceBadge}
            data-resource={resource}
            data-tooltip-id={tooltipId || ""}
            data-dark={darkMode}
        >
            <Icon type={resource} size={20} />
            {getLabel()}
            {children && <Tooltip id={tooltipId} style={{ zIndex: 9 }}>{children}</Tooltip>}
        </div>
    )
}


export function IconOnlyResourceBadge({ resource }: Props) {

    const { darkMode } = useDarkModeStore()

    return (
        <div
            className={s.ResourceBadge}
            data-resource={resource}
            data-dark={darkMode}
            style={{ display: "inline-flex", margin: 2 }}
        >
            <Icon type={resource} size={20} />
        </div>
    )
}
