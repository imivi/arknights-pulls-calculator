import s from "./Settings.module.scss"

import { Tooltip } from "react-tooltip"
import Icon from "./Icon"
import { useSettingsStore } from "../stores/useSettings"
import { useStartingResources } from "../hooks/useStartingResources"



export default function Settings() {

    const { monthlyCard, setMonthlyCard, startingResources } = useSettingsStore()
    const { setResource } = useStartingResources()

    return (
        <fieldset className={s.Settings}>

            <label data-resource="starting-orundum" data-tooltip-id="starting-orundum">
                <Icon type="orundum" size={32} />
                <input
                    type="number"
                    value={startingResources.orundum}
                    onChange={(e) => setResource("orundum", e.target.valueAsNumber)}
                    min={0}
                />
                <Tooltip id="starting-orundum" content="Your current orundum" />
            </label>

            <label data-resource="starting-tickets" data-tooltip-id="starting-tickets">
                <Icon type="ticket" size={32} />
                <input
                    type="number"
                    value={startingResources.tickets}
                    onChange={(e) => setResource("tickets", e.target.valueAsNumber)}
                    min={0}
                />
                <Tooltip id="starting-tickets" content="Your current HH permits" />
            </label>

            <label data-resource="starting-op" data-tooltip-id="starting-op">
                <Icon type="op" size={32} />
                <input
                    type="number"
                    value={startingResources.op}
                    onChange={(e) => setResource("op", e.target.valueAsNumber)}
                    min={0}
                />
                <Tooltip id="starting-op" content="Your current OP" />
            </label>
            <label data-resource="monthly_card" data-tooltip-id="monthly_card">
                <Icon type="monthly_card" size={32} />
                card
                <input type="checkbox" checked={monthlyCard} onChange={(e) => setMonthlyCard(e.target.checked)} />
                <Tooltip id="monthly_card" content="Monthly card" />
            </label>

        </fieldset>
    )
}