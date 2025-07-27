import s from "./Button.module.scss"

import { useDarkModeStore } from "../stores/useDarkModeStore"
import { HTMLAttributes } from "react"


export default function Button(props: HTMLAttributes<HTMLButtonElement>) {
    const darkMode = useDarkModeStore(store => store.darkMode)
    return (
        <button className={s.Button} data-dark={darkMode} {...props} />
    )
}
