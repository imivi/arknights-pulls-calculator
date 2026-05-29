import { ReactNode } from "react"
import s from "./MessageBox.module.scss"
import { useDarkModeStore } from "../stores/useDarkModeStore"

interface MessageBoxProps {
    legend: ReactNode
    children: ReactNode
}

export default function MessageBox({ legend, children }: MessageBoxProps) {
    const { darkMode } = useDarkModeStore()

    return (
        <fieldset className={s.message_box} data-dark={darkMode}>
            <legend>
                {legend}
            </legend>
            {children}
        </fieldset>
    )
}
