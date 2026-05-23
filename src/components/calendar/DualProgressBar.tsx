import { ReactNode } from 'react'

import s from './DualProgressBar.module.scss'

interface DualProgressBarProps {
    value1: number
    value2: number
    color1: string
    color2: string
    max: number
    children?: ReactNode
}

export function DualProgressBar({
    value1,
    value2,
    color1,
    color2,
    max,
    children
}: DualProgressBarProps) {
    // Calculate raw percentages if max is valid
    const rawPct1 = max > 0 ? (value1 / max) * 100 : 0
    const rawPct2 = max > 0 ? (value2 / max) * 100 : 0

    // Cap values to prevent overflowing 100% total
    const pct1 = Math.max(0, Math.min(100, Math.round(rawPct1)))
    const pct2 = Math.max(0, Math.min(100 - pct1, Math.round(rawPct2)))

    return (
        <div className={s.DualProgressBar} style={{ position: 'relative', overflow: 'hidden' }}>
            {/* First segment (Left) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${pct1}%`,
                backgroundColor: color1,
                zIndex: 0,
                transition: 'width 0.3s ease',
            }} />

            {/* Second segment (Right next to first segment) */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: `${pct1}%`,
                bottom: 0,
                width: `${pct2}%`,
                backgroundColor: color2,
                zIndex: 0,
                transition: 'left 0.3s ease, width 0.3s ease',
            }} />

            {/* The cell content */}
            <span style={{ position: 'relative', zIndex: 1, width: '100%' }}>
                {children}
            </span>
        </div>
    )
}