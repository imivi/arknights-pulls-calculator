import s from "./Chart.module.scss"

import { useMemo } from "react"
import { Day } from "../types"
import { useDarkModeStore } from "../stores/useDarkModeStore"
import { type LineSeries, ResponsiveLine } from '@nivo/line'



type Props = {
    days: Day[]
    show: boolean
}

export default function Chart({ days, show }: Props) {

    const { data, labels } = useMemo(() => getData(days), [days])

    const { darkMode } = useDarkModeStore()

    return (
        <div className={s.chart_container} data-show={show}>
            <div className={s.Chart}>
                <ResponsiveLine
                    theme={{
                        text: {
                            fill: darkMode ? "#eee" : "black",
                            fontSize: 15,
                        },
                        tooltip: {
                            container: {
                                color: "black",
                            }
                        }
                    }}
                    curve="monotoneX"
                    data={data}
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    colors={["#4090dcff", "#e9b546ff"]}
                    animate={true}
                    axisTop={null}
                    axisRight={null}
                    enableTouchCrosshair={true}
                    useMesh={true}
                    isInteractive={true}
                    axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        tickRotation: 0,
                        legend: "Pulls",
                        legendPosition: "middle",
                        legendOffset: -40,
                    }}
                    axisBottom={{
                        tickSize: 10,
                        format: (value) => labels[value],
                        tickRotation: 45,
                    }}
                    legends={[
                        {
                            anchor: 'bottom-right',
                            direction: 'column',
                            translateX: -60,
                            translateY: -10,
                            itemWidth: 80,
                            itemHeight: 22,
                            symbolShape: 'circle'
                        },
                    ]}
                    tooltip={(props) => (
                        <Tooltip
                            date={labels[props.point.data.x as number]}
                            pulls={props.point.data.y as number}
                            color={props.point.seriesColor}
                        />
                    )}
                />
            </div>
        </div>
    )
}

type TooltipProps = {
    date: string
    pulls: number
    color: string
}

function Tooltip({ date, pulls, color }: TooltipProps) {
    return (
        <div className={s.Tooltip}>
            <div><span style={{ color }}>■</span>{date}</div>
            <div><span></span>{pulls.toFixed()}&nbsp;pulls</div>
        </div>
    )
}


type LabeledPoint = {
    x: number
    y: number
    label: string
}

function getData(days: Day[]) {
    const fewerDays = days.filter((_, i) => i % 5 === 0)

    const totalPulls: LabeledPoint[] = []
    const totalPullsWithoutOP: LabeledPoint[] = []
    const labels: string[] = []

    fewerDays.forEach((day, i) => {
        const label = formatDate(day.date)
        labels.push(label)
        totalPulls.push({
            x: i,
            y: day.pullsAvailableTotal,
            label,
        })
        totalPullsWithoutOP.push({
            x: i,
            y: day.pullsAvailableWithoutOP,
            label,
        })
    })
    const data: LineSeries[] = [
        {
            id: "Pulls (excl. OP)",
            data: totalPullsWithoutOP,
        },
        {
            id: "Pulls (incl. OP)",
            data: totalPulls,
        },
    ]
    return { data, labels }
}

const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]
function formatDate(date: string): string {
    const [_, month, day] = date.split("-")
    return months[Number(month) - 1] + " " + day
}
