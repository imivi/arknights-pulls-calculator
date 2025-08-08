import s from "./Button.module.scss"

import { useDarkModeStore } from "../stores/useDarkModeStore"
import { type ButtonHTMLAttributes } from "react"


type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    dark?: boolean
}

export default function Button(props: Props) {
    const dark = props.dark ?? useDarkModeStore(store => store.darkMode)
    return (
        <button className={s.Button} data-dark={dark} {...props} />
    )
}
