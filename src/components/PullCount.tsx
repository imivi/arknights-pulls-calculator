import s from "./PullCount.module.scss"

import { Day } from "../types"
import { useDarkModeStore } from "../stores/useDarkModeStore"
import PullsMenu from "./PullsMenu"
import { useSpendablePullsStore } from "../stores/useSpendablePullsStore"
import { Tooltip } from "react-tooltip"
import { FaExclamationTriangle } from "react-icons/fa"


type Props = {
    day: Day
    even: boolean
}

export default function PullCount({ day, even }: Props) {

    const { darkMode } = useDarkModeStore()
    const { spendablePulls } = useSpendablePullsStore()

    // Check if the user entered too many pulls compared to the pulls available
    // It can happen if the user increases the spent pulls on multiple days
    const spendablePullsToday = day.date in spendablePulls ? spendablePulls[day.date] : 0
    const tooManyPullsRequested = spendablePullsToday > day.pullsSpent
    const warningTooltipId = tooManyPullsRequested ? day.date + "-too-many-pulls" : ""

    return (
        <PullsMenu day={day}>
            <span className={s.PullCount}>
                {
                    day.pullsSpent > 0 &&
                    <span
                        className={s.pulls_spent}
                        data-warning-too-many-pulls={tooManyPullsRequested}
                        data-tooltip-id={warningTooltipId}
                    >
                        &nbsp;-{day.pullsSpent}
                        {tooManyPullsRequested && <FaExclamationTriangle size={14} />}
                    </span>
                }
                {tooManyPullsRequested && <Tooltip id={warningTooltipId} style={{ zIndex: 1 }}>
                    Only {day.pullsSpent} pulls available out of {spendablePullsToday}
                </Tooltip>}

                <span className={s.pulls_available} data-dark={darkMode} data-even={even}>
                    <strong>{day.pullsAvailableTotal.toFixed()}</strong>
                    <small>pulls</small>
                </span>
            </span>
        </PullsMenu>
    )
}