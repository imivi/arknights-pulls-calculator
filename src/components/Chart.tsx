import s from "./Chart.module.scss"

import { useEffect, useRef, useState } from "react"
import { LineChart, type LineChartOptions } from "chartist"
import "chartist/dist/index.css"
import { CalendarRow } from "../types"


type Props = {
    rows: CalendarRow[]
    show: boolean
}

type TooltipData = {
    x: number
    y: number
    date: string
    pullsInclOp: number
    pullsExclOp: number
}


export default function Chart({ rows, show }: Props) {
    const chartContainerRef = useRef<HTMLDivElement>(null)
    const [tooltip, setTooltip] = useState<TooltipData | null>(null)

    useEffect(() => {
        if (!show || !chartContainerRef.current) return

        const { data, labels, sampledRows } = getData(rows)

        const options: LineChartOptions = {
            showArea: true,
            showPoint: true,
            fullWidth: true,
            lineSmooth: false,
            chartPadding: {
                top: 20,
                right: 35,
                bottom: 60,
                left: 20,
            },
            low: 0,
            axisY: {
                onlyInteger: true,
                offset: 40,
            },
            axisX: {
                offset: 60,
            },
        }

        const chart = new LineChart(chartContainerRef.current, data, options)

        chart.on("draw", (context) => {
            if (context.type === "point") {
                const pointEl = context.element.getNode() as SVGElement
                const idx = context.index

                const onMouseEnter = () => {
                    const rect = chartContainerRef.current?.getBoundingClientRect()
                    if (!rect) return
                    const pointRect = pointEl.getBoundingClientRect()
                    const row = sampledRows[idx]
                    if (!row) return

                    setTooltip({
                        x: pointRect.left + pointRect.width / 2 - rect.left,
                        y: pointRect.top - rect.top,
                        date: labels[idx],
                        pullsInclOp: row.pulls_available_incl_op,
                        pullsExclOp: row.pulls_available_excl_op,
                    })
                }

                const onMouseLeave = () => {
                    setTooltip(null)
                }

                pointEl.addEventListener("mouseenter", onMouseEnter)
                pointEl.addEventListener("mouseleave", onMouseLeave)
            }
        })

        return () => {
            chart.detach()
        }
    }, [rows, show])

    return (
        <div className={s.chart_container} data-show={show}>
            <div className={s.ChartWrapper}>
                <div ref={chartContainerRef} className={s.Chart} />

                {tooltip && (
                    <div
                        className={s.Tooltip}
                        style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
                    >
                        <div className={s.tooltip_date}>{tooltip.date}</div>
                        <div className={s.tooltip_row}>
                            <span className={s.tooltip_dot} style={{ backgroundColor: "#e9b546" }} />
                            <span>Pulls (incl. OP): {Math.round(tooltip.pullsInclOp)}</span>
                        </div>
                        <div className={s.tooltip_row}>
                            <span className={s.tooltip_dot} style={{ backgroundColor: "#4090dc" }} />
                            <span>Pulls (excl. OP): {Math.round(tooltip.pullsExclOp)}</span>
                        </div>
                    </div>
                )}

                <div className={s.legend}>
                    <div className={s.legend_item}>
                        <span className={s.legend_marker} style={{ backgroundColor: "#4090dc" }} />
                        <span>Pulls (excl. OP)</span>
                    </div>
                    <div className={s.legend_item}>
                        <span className={s.legend_marker} style={{ backgroundColor: "#e9b546" }} />
                        <span>Pulls (incl. OP)</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function getData(days: CalendarRow[]) {
    const sampledRows = days.filter((_, i) => i % 5 === 0)

    const totalPullsInclOp: number[] = []
    const totalPullsExclOp: number[] = []
    const labels: string[] = []

    sampledRows.forEach((day) => {
        const label = formatDate(day.day)
        labels.push(label)
        totalPullsInclOp.push(day.pulls_available_incl_op)
        totalPullsExclOp.push(day.pulls_available_excl_op)
    })

    const data = {
        labels,
        series: [
            {
                name: "Pulls (incl. OP)",
                data: totalPullsInclOp,
            },
            {
                name: "Pulls (excl. OP)",
                data: totalPullsExclOp,
            },
        ],
    }

    return { data, labels, sampledRows }
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
function formatDate(date: string): string {
    const [_, month, day] = date.split("-")
    return months[Number(month) - 1] + " " + day
}
