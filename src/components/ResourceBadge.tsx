import s from "./ResourceBadge.module.scss"

import { ReactNode } from "react"
import { Tooltip } from 'react-tooltip'
import Icon from "./Icon"


type Resource = "orundum" | "op" | "ticket"

type Props = {
    resource: Resource
    value: number
    tooltipId: string
    children: ReactNode
}

export default function ResourceBadge({ resource, value, tooltipId, children }: Props) {
    return (
        <div
            className={s.ResourceBadge}
            data-resource={resource}
            data-tooltip-id={tooltipId}
        >
            <Icon type={resource} size={20} />
            +{value}
            <Tooltip id={tooltipId} >{children}</Tooltip>
        </div>
    )
}