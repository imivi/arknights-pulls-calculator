import s from "./PullsMenu.module.scss"
import buttonStyle from "../Button.module.scss"

import { ReactNode, useEffect, useState } from "react";
import { Popover } from "radix-ui";
import { useSpendablePullsStore } from "../../stores/useSpendablePullsStore";
import { useDarkModeStore } from "../../stores/useDarkModeStore";
import { convertPullsToResources, constrain, formatOrundum } from "../../utils/utils";
import Button from "../Button";
import Icon from "../Icon";
import { getPullOdds } from "../../utils/get-pull-odds";
import { BasicResources, CalendarRow } from "../../types";
import { FaExclamationTriangle } from "react-icons/fa";






type Props = {
    row: CalendarRow
    children: ReactNode
}

export default function PullsMenu({ row, children }: Props) {

    const [showPullMenu, setShowPullMenu] = useState(false)

    const { spendablePulls, setSpendablePulls } = useSpendablePullsStore()
    // const spendablePullsToday = row.pulls_available_incl_op

    const operators = row.event_ops?.split(",").map(op => op.trim()) || []

    const [inputValue, setInputValue] = useState("0")
    const inputValueAsNumber = Number(inputValue) || 0

    const cumulativeSpendableResources: Omit<BasicResources, "certs"> = {
        orundum: row.orundum_spendable,
        tickets: row.tickets_spendable,
        op: row.op_spendable,
    }

    const maxSpendablePulls = Math.min(inputValueAsNumber, row.pulls_available_incl_op)
    const { spent: resourcesSpent } = convertPullsToResources(cumulativeSpendableResources, maxSpendablePulls)

    const bannerType = getBannerType(row.event_id, row.is_collab === 1, row.is_limited === 1, operators)

    // Example: one rate-up, 50% chance
    // two rate-ups, 35% each, 70% for either
    let pullOdds: Record<string, number> = {}
    if (bannerType !== "none")
        pullOdds = getPullOdds(inputValueAsNumber, bannerType)

    const activeBanner = row.event_id && !(row.is_rerun && row.is_limited)

    // Make sure the input value is always showing the spendable pulls
    useEffect(() => {
        if (row.pulls_spent > 0)
            setInputValue(row.pulls_spent.toFixed())
        else
            setInputValue('0')
        // setInputValue(spendablePullsToday.toFixed())
    }, [showPullMenu])

    function increment(n: number) {
        setInputValue(constrain(inputValueAsNumber + n, 0, row.pulls_available_incl_op).toFixed())
    }

    function spendPulls() {
        setSpendablePulls({
            ...spendablePulls,
            [row.day]: inputValueAsNumber,
        })
    }

    function reset() {
        setSpendablePulls({
            ...spendablePulls,
            [row.day]: 0,
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
                {/* <button className={s.btn_open_menu} aria-label="Spend pulls"> */}
                {children}
                {/* </button> */}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content
                    className={s.Content}
                    sideOffset={15} // shift up/down
                >
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
                                    max={row.pulls_available_incl_op}
                                />
                                / {row.pulls_available_incl_op} pulls
                            </label>

                            <fieldset>
                                <Button type="button" dark={false} onClick={() => setInputValue("0")}>0</Button>
                                <Button type="button" dark={false} onClick={() => increment(-1)}>-1</Button>
                                <Button type="button" dark={false} onClick={() => increment(+1)}>+1</Button>
                                <Button type="button" dark={false} onClick={() => increment(-10)}>-10</Button>
                                <Button type="button" dark={false} onClick={() => increment(+10)}>+10</Button>
                            </fieldset>
                            {
                                bannerType !== "collab" &&
                                <fieldset>
                                    <Button type="button" dark={false} onClick={() => setInputValue(row.pulls_available_excl_op.toFixed())}>Max, no OP ({row.pulls_available_excl_op})</Button>
                                    <Button type="button" dark={false} onClick={() => setInputValue(row.pulls_available_incl_op.toFixed())}>Max ({row.pulls_available_incl_op})</Button>
                                </fieldset>
                            }

                            {
                                inputValueAsNumber >= 0 &&
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
                                            {formatOrundum(resourcesSpent.op * 180)}
                                        </li>
                                    }


                                    {
                                        cumulativeSpendableResources.tickets === 0 &&
                                        <li data-active={false}><Icon type="tickets" size={20} /> -</li>
                                    }
                                    {
                                        resourcesSpent.orundum === 0 &&
                                        <li data-active={false}><Icon type="orundum" size={20} /> -</li>
                                    }
                                    {
                                        resourcesSpent.op === 0 &&
                                        <li data-active={false}><Icon type="op" size={20} /> -</li>
                                    }

                                </ul>
                            }

                            {
                                !activeBanner &&
                                <span><FaExclamationTriangle size={14} /> No active banner</span>
                            }

                            {
                                activeBanner &&
                                Object.keys(pullOdds).length > 0 &&
                                <table className={s.pull_odds}>
                                    <tbody>
                                        {Object.entries(pullOdds).map(([key, chance]) => (
                                            <tr key={key}>
                                                <td>
                                                    <span>
                                                        {
                                                            operators.length === 1 &&
                                                            <img
                                                                src={`/operators/${operators}.webp`}
                                                                alt={key}
                                                                width={24}
                                                                height={24}
                                                            />
                                                        }
                                                        {key}
                                                    </span>
                                                </td>
                                                <td>{formatProbability(chance)} %</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            }

                        </main>

                        <footer>
                            {
                                row.user_max_pulls > 0 &&
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


type BannerType = "debut" | "limited" | "collab" | "none"

function getBannerType(event_id: string | undefined, is_collab: boolean, is_limited: boolean, operators: string[]): BannerType {

    if (!event_id || event_id === "")
        return "none"

    if (is_collab)
        return "collab"

    if (is_limited)
        return "limited"

    if (operators.length === 1)
        return "debut"

    return "none"
}


function formatProbability(value: number): string {
    if (value === 0) return "0"
    if (value === 1) return "100"
    if (value < 0.99) return (value * 100).toFixed(1)
    return (value * 100)?.toFixed(2)
}
