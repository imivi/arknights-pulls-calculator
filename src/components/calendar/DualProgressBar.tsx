import { ReactNode } from 'react'

import s from './DualProgressBar.module.scss'

interface DualProgressBarProps {
    value1: number
    value2: number
    // color1: string
    // color2: string
    max: number
    children?: ReactNode
}

export function DualProgressBar({
    value1,
    value2,
    max,
    children
}: DualProgressBarProps) {
    // Calculate raw percentages if max is valid
    const rawPct1 = max > 0 ? (value1 / max) * 100 : 0
    const rawPct2 = max > 0 ? (value2 / max) * 100 : 0

    // Cap values to prevent overflowing 100% total
    const pct1 = Math.max(0, Math.min(100, Math.round(rawPct1)))
    const pct2 = Math.max(0, Math.min(100 - pct1, Math.round(rawPct2)))

    // If there is no OP bar, round the pull bar's right corners
    const roundedRightPullsBar = value2 === 0

    return (
        <div className={s.DualProgressBar}>
            {/* First segment (Left) */}
            <div className={s.bar1} data-right-rounded-corners={roundedRightPullsBar} style={{
                width: `${pct1}%`,
            }} />

            {/* Second segment (Right next to first segment) */}
            <div className={s.bar2} style={{
                left: `${pct1}%`,
                width: `${pct2}%`,
            }} />

            {/* The cell content */}
            <span className={s.content}>
                {children}
            </span>
        </div>
    )
}