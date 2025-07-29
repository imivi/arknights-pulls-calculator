import s from "./Button.module.scss"

import { useDarkModeStore } from "../stores/useDarkModeStore"
import { type ButtonHTMLAttributes } from "react"


export default function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
    const darkMode = useDarkModeStore(store => store.darkMode)
    return (
        <button className={s.Button} data-dark={darkMode} {...props} />
    )
}
