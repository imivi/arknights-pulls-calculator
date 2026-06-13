import s from "./OrundumPerDay.module.scss"

import { useRef, useState } from "react"
import Icon from "./Icon"
import { useFarmingStore } from "../stores/useFarmingStore"


export default function OrundumPerDay() {

    const { orundumPerDay, setOrundumPerDay, everyday, setEveryday } = useFarmingStore()
    const [inputValue, setInputValue] = useState(orundumPerDay.toString())

    // For debouncing
    const timeoutIdRef = useRef(0)

    function onInputChange(inputValueString: string) {
        setInputValue(inputValueString)
        window.clearTimeout(timeoutIdRef.current)
        timeoutIdRef.current = window.setTimeout(() => {
            const number = Number(inputValueString)
            if (number && number > 0)
                setOrundumPerDay(number)
            else
                setOrundumPerDay(0)
        }, 800)
    }


    return (
        <div className={s.OrundumPerDay}>
            <label>
                <input
                    type="text"
                    inputMode="decimal"
                    pattern="^\d*\.\d+|\d+$"
                    min={0}
                    step={1}
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                />
                <span><Icon type="orundum" size={24} /> Daily orundum from farming</span>
            </label>
            {
                orundumPerDay > 0 &&
                <div className={s.radioButtons}>
                    <label className={!everyday ? s.active : ""}>
                        <input type="radio" checked={!everyday} onChange={() => setEveryday(false)} />
                        Outside events
                    </label>
                    <label className={everyday ? s.active : ""}>
                        <input type="radio" checked={everyday} onChange={() => setEveryday(true)} />
                        Every day
                    </label>
                </div>
            }
        </div>
    )
}