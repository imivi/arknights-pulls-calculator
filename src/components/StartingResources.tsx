import s from "./StartingResources.module.scss"

import { Tooltip } from "react-tooltip"
import Icon from "./Icon"
import { useStartingResourcesStore } from "../stores/useStartingResourcesStore"
import { useStartingResources } from "../hooks/useStartingResources"
import { useRef, useState } from "react"
import { BasicResources, Resource } from "../types"
import { useCertsPerDayStore } from "../stores/useCertsPerDayStore"



const INPUT_DEBOUNCE_MS = 800


export default function StartingResources() {

    const { monthlyCard, setMonthlyCard, startingResources } = useStartingResourcesStore()
    const { setResource } = useStartingResources()

    // On first page load, load the resource values from localstorage (zustand store)
    const [inputValues, setInputValues] = useState<Record<Resource, string>>({
        orundum: startingResources.orundum.toString(),
        tickets: startingResources.tickets.toString(),
        op: startingResources.op.toString(),
        certs: (startingResources?.certs || 0).toString(),
    })

    const timeoutIdRef = useRef(0)

    // Immediately update displayed input values,
    // then wait some time before updating the global store values
    function setInputValue(res: Resource, value: string) {
        setInputValues({
            ...inputValues,
            [res]: value,
        })
        window.clearTimeout(timeoutIdRef.current)
        timeoutIdRef.current = window.setTimeout(() => {
            setResource(res, Number(value))
        }, INPUT_DEBOUNCE_MS)
    }

    return (
        <fieldset className={s.StartingResources}>

            <label data-resource="starting-orundum" data-tooltip-id="starting-orundum">
                <Icon type="orundum" size={32} />
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputValues.orundum}
                    onChange={(e) => {
                        if (!Number.isNaN(Number(e.target.value))) {
                            setInputValue("orundum", e.target.value)
                        }
                    }}
                />
                <Tooltip id="starting-orundum" content="Your current orundum" defaultIsOpen={startingResources.orundum === 0} />
            </label>

            <label data-resource="starting-tickets" data-tooltip-id="starting-tickets">
                <Icon type="tickets" size={32} />
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputValues.tickets}
                    onChange={(e) => {
                        if (!Number.isNaN(Number(e.target.value))) {
                            setInputValue("tickets", e.target.value)
                        }
                    }}
                />
                <Tooltip id="starting-tickets" content="Your current HH permits" />
            </label>

            <label data-resource="starting-op" data-tooltip-id="starting-op">
                <Icon type="op" size={32} />
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputValues.op}
                    onChange={(e) => {
                        if (!Number.isNaN(Number(e.target.value))) {
                            setInputValue("op", e.target.value)
                        }
                    }}
                />
                <Tooltip id="starting-op" content="Your current OP" />
            </label>

            <label data-resource="starting-certs" data-tooltip-id="starting-certs">
                <Icon type="certs_dark" size={32} />
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={inputValues?.certs || 0}
                    onChange={(e) => {
                        if (!Number.isNaN(Number(e.target.value))) {
                            setInputValue("certs", e.target.value)
                        }
                    }}
                />
                <Tooltip id="starting-certs" content="Your current distinction certificates" />
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