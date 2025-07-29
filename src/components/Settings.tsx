import s from "./Settings.module.scss"

import { Tooltip } from "react-tooltip"
import Icon from "./Icon"
import { useSettingsStore } from "../stores/useSettings"
import { useStartingResources } from "../hooks/useStartingResources"
import { useRef, useState } from "react"
import { BasicResources, Resource } from "../types"



const INPUT_DEBOUNCE_MS = 500


export default function Settings() {

    const { monthlyCard, setMonthlyCard, startingResources } = useSettingsStore()
    const { setResource } = useStartingResources()

    // On first page load, load the resource values from localstorage (zustand store)
    const [inputValues, setInputValues] = useState<BasicResources>(startingResources)

    const timeoutIdRef = useRef(0)

    // Immediately update displayed input values,
    // then wait some time before updating the global store values
    function setInputValue(res: Resource, value: number) {
        setInputValues({
            ...inputValues,
            [res]: value,
        })
        window.clearTimeout(timeoutIdRef.current)
        timeoutIdRef.current = window.setTimeout(() => {
            setResource(res, value)
        }, INPUT_DEBOUNCE_MS)
    }

    return (
        <fieldset className={s.Settings}>

            <label data-resource="starting-orundum" data-tooltip-id="starting-orundum">
                <Icon type="orundum" size={32} />
                <input
                    type="number"
                    value={inputValues.orundum}
                    onChange={(e) => setInputValue("orundum", e.target.valueAsNumber)}
                    min={0}
                />
                <Tooltip id="starting-orundum" content="Your current orundum" defaultIsOpen={startingResources.orundum === 0} />
            </label>

            <label data-resource="starting-tickets" data-tooltip-id="starting-tickets">
                <Icon type="tickets" size={32} />
                <input
                    type="number"
                    value={inputValues.tickets}
                    onChange={(e) => setInputValue("tickets", e.target.valueAsNumber)}
                    min={0}
                />
                <Tooltip id="starting-tickets" content="Your current HH permits" />
            </label>

            <label data-resource="starting-op" data-tooltip-id="starting-op">
                <Icon type="op" size={32} />
                <input
                    type="number"
                    value={inputValues.op}
                    onChange={(e) => setInputValue("op", e.target.valueAsNumber)}
                    min={0}
                />
                <Tooltip id="starting-op" content="Your current OP" />
            </label>
            <label data-resource="monthly_card" data-tooltip-id="monthly_card">
                <input type="checkbox" checked={monthlyCard} onChange={(e) => setMonthlyCard(e.target.checked)} />
                card
                <Icon type="monthly_card" size={26} />
                <Tooltip id="monthly_card" content="Monthly card" />
            </label>

        </fieldset>
    )
}