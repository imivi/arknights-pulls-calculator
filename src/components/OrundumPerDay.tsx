import s from "./OrundumPerDay.module.scss"

import { useRef, useState } from "react"
import Icon from "./Icon"
import { useFarmingStore } from "../stores/useFarmingStore"


export default function OrundumPerDay() {

    const { orundumPerDay, setOrundumPerDay, everyday, setEveryday } = useFarmingStore()
    const [inputValue, setInputValue] = useState(orundumPerDay.toString())

    // For debouncing
    const timeoutIdRef = useRef(0)

    function onInputChange(inputValue: string) {
        setInputValue(inputValue)
        window.clearTimeout(timeoutIdRef.current)
        timeoutIdRef.current = window.setTimeout(() => {
            const number = Number(inputValue)
            if (number && !(Number.isNaN(number) || number < 0 || number > 100))
                setOrundumPerDay(number)
            else
                setOrundumPerDay(0)
        }, 800)
    }


    return (
        <div className={s.OrundumPerDay}>
            <input
                type="text"
                inputMode="decimal"
                pattern="^\d*\.\d+|\d+$"
                min={0}
                step={1}
                value={inputValue}
                onChange={(e) => onInputChange(e.target.value)}
            />
            <label>
                <span><Icon type="orundum" size={24} /> Daily orundum from farming</span>
                <span><input type="checkbox" checked={everyday} onChange={e => setEveryday(e.target.checked)} />&nbsp;Farm everyday</span>
            </label>
        </div>
    )
}