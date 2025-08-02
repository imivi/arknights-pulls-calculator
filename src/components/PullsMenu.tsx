import s from "./PullsMenu.module.scss"
import buttonStyle from "./Button.module.scss"

import { ReactNode, useEffect, useState } from "react";
import { Popover } from "radix-ui";
import { Day } from "../types";
import { constrain, convertPullsToResources, formatOrundum } from "../utils/utils";
import Icon from "./Icon";
import { useDarkModeStore } from "../stores/useDarkModeStore";
import Button from "./Button";
import { useSpendablePullsStore } from "../stores/useSpendablePullsStore";



type Props = {
    day: Day
    children: ReactNode
}

export default function PullsMenu({ day, children }: Props) {

    const [showPullMenu, setShowPullMenu] = useState(false)

    const { spendablePulls, setSpendablePulls } = useSpendablePullsStore()
    const spendablePullsToday = day.date in spendablePulls ? spendablePulls[day.date] : 0

    const [inputValue, setInputValue] = useState("0")
    const inputValueAsNumber = Number(inputValue) || 0
    const { cumulativeSpendableResources } = day

    const maxSpendablePulls = Math.min(inputValueAsNumber, day.pullsAvailableTotal)
    const { spent: resourcesSpent } = convertPullsToResources(cumulativeSpendableResources, maxSpendablePulls)

    // Make sure the input value is always showing the spendable pulls
    useEffect(() => {
        setInputValue(spendablePullsToday.toFixed())
    }, [showPullMenu])

    function increment(n: number) {
        setInputValue(constrain(inputValueAsNumber + n, 0, day.pullsAvailableTotal).toFixed())
    }

    function spendPulls() {
        setSpendablePulls({
            ...spendablePulls,
            [day.date]: inputValueAsNumber,
        })
    }

    function reset() {
        setSpendablePulls({
            ...spendablePulls,
            [day.date]: 0,
        })
    }

    function onSubmit() {
        spendPulls()
        setShowPullMenu(false)
    }

    const { darkMode } = useDarkModeStore()

    return (
        <Popover.Root open={showPullMenu} onOpenChange={(open) => setShowPullMenu(open)} >
            <Popover.Trigger asChild>
                <button className={s.btn_open_menu} aria-label="Spend pulls">
                    {children}
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className={s.Content} sideOffset={5}>
                    <Popover.Arrow className={s.Arrow} />

                    <form onSubmit={e => { e.preventDefault(); onSubmit() }}>
                        <main data-dark={darkMode}>

                            <label>
                                Spend
                                &nbsp;
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    style={{ maxWidth: 60 }}
                                    min={0}
                                    max={day.pullsAvailableTotal}
                                />
                                / {day.pullsAvailableTotal} pulls
                            </label>

                            <fieldset>
                                <Button type="button" onClick={() => setInputValue("0")}>0</Button>
                                <Button type="button" onClick={() => increment(-1)}>-1</Button>
                                <Button type="button" onClick={() => increment(+1)}>+1</Button>
                                <Button type="button" onClick={() => increment(-10)}>-10</Button>
                                <Button type="button" onClick={() => increment(+10)}>+10</Button>
                            </fieldset>
                            <fieldset>
                                <Button type="button" onClick={() => setInputValue(day.pullsAvailableWithoutOP.toFixed())}>Max, no OP ({day.pullsAvailableWithoutOP})</Button>
                                <Button type="button" onClick={() => setInputValue(day.pullsAvailableTotal.toFixed())}>Max ({day.pullsAvailableTotal})</Button>
                            </fieldset>

                            {
                                inputValueAsNumber > 0 &&
                                <ul>
                                    {
                                        cumulativeSpendableResources.tickets > 0 &&
                                        <li><Icon type="tickets" size={20} /> {resourcesSpent.tickets} / {cumulativeSpendableResources.tickets}</li>
                                    }
                                    {
                                        resourcesSpent.orundum > 0 &&
                                        <li><Icon type="orundum" size={20} /> {formatOrundum(resourcesSpent.orundum)} / {formatOrundum(cumulativeSpendableResources.orundum)}</li>
                                    }
                                    {
                                        resourcesSpent.op > 0 &&
                                        <li>
                                            <Icon type="op" size={20} />
                                            {resourcesSpent.op} / {cumulativeSpendableResources.op}
                                            →
                                            <Icon type="orundum" size={20} />
                                            {resourcesSpent.op * 180}
                                        </li>
                                    }
                                </ul>
                            }

                        </main>

                        <footer>
                            {
                                day.spendablePulls > 0 &&
                                <Popover.Close aria-label="Reset" onClick={reset} type="button" className={buttonStyle.Button}>
                                    Don't pull
                                </Popover.Close>
                            }
                            <Popover.Close aria-label="Close" type="button" className={buttonStyle.Button}>
                                Close
                            </Popover.Close>
                            <Popover.Close aria-label="Confirm" onClick={spendPulls} type="submit" className={buttonStyle.Button}>
                                OK
                            </Popover.Close>
                        </footer>

                    </form>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root >
    )
}
