import s from "./PullsMenu.module.scss"

import { ReactNode, useEffect, useState } from "react";
import { Popover } from "radix-ui";
import { useResourcesSpentStore } from "../stores/useResourcesSpentStore";
import { Day } from "../day";
import { constrain, convertPullsToResources, convertResourcesToPulls } from "../utils";
import Icon from "./Icon";
import { useDarkModeStore } from "../stores/useDarkModeStore";



type Props = {
    day: Day
    maxPulls: number
    children: ReactNode
}

export default function PullsMenu({ day, maxPulls, children }: Props) {

    const { resourcesSpent, setResourcesSpent } = useResourcesSpentStore()
    const [inputValue, setInputValue] = useState(0)
    const { resourcesTotal } = day

    const resources = convertPullsToResources(resourcesTotal, inputValue)

    // Make sure the input value is always showing the spent pulls
    // (calculated from the spent resources)
    useEffect(() => {
        if (day.date in resourcesSpent) {
            const pullsSpent = convertResourcesToPulls(resourcesSpent[day.date], true)
            setInputValue(pullsSpent)
        }
        else {
            setInputValue(0)
        }
    }, [])

    function increment(n: number) {
        setInputValue(constrain(inputValue + n, 0, maxPulls) || 0)
    }

    function spendPulls() {
        setResourcesSpent({
            ...resourcesSpent,
            [day.date]: resources.spent,
        })
    }

    const { darkMode } = useDarkModeStore()

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button className={s.btn_open_menu} aria-label="Update dimensions">
                    {children}
                </button>
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className={s.Content} sideOffset={5}>
                    <Popover.Arrow className={s.Arrow} />

                    <main data-dark={darkMode}>

                        <label>
                            Spend
                            <input
                                type="number"
                                value={inputValue}
                                onChange={e => setInputValue(constrain(e.target.valueAsNumber, 0, maxPulls))}
                                style={{ maxWidth: 60 }}
                                min={0}
                                max={maxPulls}
                            />
                            / {maxPulls} pulls
                        </label>
                        <fieldset>
                            <button onClick={() => setInputValue(0)}>0</button>
                            <button onClick={() => increment(-1)}>-1</button>
                            <button onClick={() => increment(+1)}>+1</button>
                            <button onClick={() => increment(-10)}>-10</button>
                            <button onClick={() => increment(+10)}>+10</button>
                        </fieldset>
                        <fieldset>
                            <button onClick={() => setInputValue(day.pullsAvailableWithoutOP)}>Max, no OP ({day.pullsAvailableWithoutOP})</button>
                            <button onClick={() => setInputValue(maxPulls)}>Max ({maxPulls})</button>
                        </fieldset>

                        {
                            inputValue > 0 &&
                            <ul>
                                {
                                    resourcesTotal.tickets > 0 &&
                                    <li><Icon type="ticket" size={20} /> {resources.spent.tickets} / {resourcesTotal.tickets}</li>
                                }
                                {
                                    resources.spent.orundum > 0 &&
                                    <li><Icon type="orundum" size={20} /> {resources.spent.orundum} / {resourcesTotal.orundum}</li>
                                }
                                {
                                    resources.spent.op > 0 &&
                                    <li>
                                        <Icon type="op" size={20} />
                                        {resources.spent.op} / {resourcesTotal.op}
                                        →
                                        <Icon type="orundum" size={20} />
                                        {resources.spent.op * 180}
                                    </li>
                                }
                            </ul>
                        }

                    </main>

                    {/* <pre>{JSON.stringify({ res: day.resourcesTotal, inputValue, resourcesSpent: resources.spent }, null, 4)}</pre> */}
                    {/* <pre>{JSON.stringify({ inputValue, resourcesTotal, resources }, null, 4)}</pre> */}

                    <footer>
                        <Popover.Close aria-label="Close">
                            cancel
                        </Popover.Close>
                        <Popover.Close aria-label="Confirm" onClick={spendPulls}>
                            OK
                        </Popover.Close>
                    </footer>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}
