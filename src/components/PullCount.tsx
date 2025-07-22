import s from "./PullCount.module.scss"

import { Day } from "../day"
import { useDarkModeStore } from "../stores/useDarkModeStore"
import PullsMenu from "./PullsMenu"


type Props = {
    day: Day
    even: boolean
}

export default function PullCount({ day, even }: Props) {

    const { darkMode } = useDarkModeStore()

    return (
        <PullsMenu day={day} maxPulls={day.pullsAvailable}>
            <span className={s.PullCount}>
                {
                    day.pullsSpent > 0 &&
                    <span className={s.pulls_spent}>
                        &nbsp;-{day.pullsSpent}
                    </span>
                }
                <span className={s.pulls_available} data-dark={darkMode} data-even={even}>
                    <strong>{day.pullsAvailable.toFixed()}</strong>
                    <small>pulls</small>
                </span>
            </span>
        </PullsMenu>
    )
}