import s from "./CertsPerDay.module.scss"

import { useRef, useState } from "react"
import { useCertsPerDayStore } from "../stores/useCertsPerDayStore"
import Icon from "./Icon"
import { FaInfoCircle } from "react-icons/fa"


export default function CertsPerDay() {

    const { certsPerDay, setCertsPerDay } = useCertsPerDayStore()
    const [inputValue, setInputValue] = useState(certsPerDay.toString())

    // For debouncing
    const timeoutIdRef = useRef(0)

    function onInputChange(inputValue: string) {
        setInputValue(inputValue)
        window.clearTimeout(timeoutIdRef.current)
        timeoutIdRef.current = window.setTimeout(() => {
            const number = Number(inputValue)
            if (number && !(Number.isNaN(number) || number < 0 || number > 100))
                setCertsPerDay(number)
            else
                setCertsPerDay(0)
        }, 800)
    }


    return (
        <div className={s.CertsPerDay}>
            <label>
                <input
                    type="text"
                    inputMode="decimal"
                    pattern="^\d*\.\d+|\d+$"
                    min={0}
                    max={100}
                    step={0.1}
                    value={inputValue}
                    onChange={(e) => onInputChange(e.target.value)}
                />
                <Icon type="certs" size={24} />
                Certificates per day
            </label>
            <small>
                <FaInfoCircle size={16} /> 1Y+ account: around 1.5 certs/day from recruitment
            </small>
        </div>
    )
}