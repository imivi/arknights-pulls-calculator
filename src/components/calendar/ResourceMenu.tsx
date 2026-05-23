import s from "./ResourceMenu.module.scss"
import buttonStyle from "../Button.module.scss"

import { ReactNode, useEffect, useState } from "react";
import { Popover } from "radix-ui";
import { Tooltip } from "react-tooltip";
import { useDarkModeStore } from "../../stores/useDarkModeStore";
import { CalendarRow, Resource } from "../../types";
import { formatOrundum } from "../../utils/utils";
import Button from "../Button";
import Icon from "../Icon";
import { useResourceAdjustments } from "../../hooks/useResourceAdjustments";



const allValueShortcuts = {
    orundum: [],
    tickets: [0, 38],
    op: [0, -15, -18, -21, -24],
    cert: [0, -258],
}



type Props = {
    row: CalendarRow
    resource: Resource
    children: ReactNode
}

export default function ResourceMenu({ row, resource, children }: Props) {

    const date = row.day

    const [showMenu, setShowMenu] = useState(false)

    const [inputValue, setInputValue] = useState<string | number>(0)
    const amountAsNumber = Number(inputValue) || 0
    const [description, setDescription] = useState("")

    const { getResourceAdjustment, setResourceAdjustment, deleteResourceAdjustment } = useResourceAdjustments()
    const resourceAdjustment = getResourceAdjustment(date, resource)

    // Make sure the input fields are always showing the latest values
    useEffect(() => {
        if (showMenu) {
            setInputValue(resourceAdjustment?.amount || 0)
            setDescription(resourceAdjustment?.description || "")
        }
    }, [showMenu])

    function onSubmit() {
        setShowMenu(false)
        if (inputValue === 0 && description === "")
            deleteResourceAdjustment(date, resource)
        else
            setResourceAdjustment(date, resource, amountAsNumber, description)
    }

    const { darkMode } = useDarkModeStore()

    const valueShortcuts = allValueShortcuts[resource]

    return (
        <Popover.Root open={showMenu} onOpenChange={(open) => setShowMenu(open)} >
            <Popover.Trigger asChild>
                {children}
            </Popover.Trigger>
            <Popover.Portal>
                <Popover.Content className={s.Content} sideOffset={5}>
                    <Popover.Arrow className={s.Arrow} />

                    <form onSubmit={e => { e.preventDefault(); onSubmit() }}>

                        <main data-dark={darkMode}>

                            <label data-resource={resource}>
                                Gain or spend
                                &nbsp;
                                <input
                                    type="number"
                                    value={inputValue}
                                    onChange={e => setInputValue(e.target.value)}
                                    style={{ maxWidth: 60 }}
                                />
                                <Icon type={resource} size={22} />
                            </label>
                            <fieldset>
                                {
                                    valueShortcuts.length > 0 &&
                                    valueShortcuts.map(value => (
                                        <Button type="button" dark={false} key={value} onClick={() => setInputValue(value)}>{value}</Button>
                                    ))
                                }
                            </fieldset>

                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="Custom note"
                            />

                        </main>

                        <footer>
                            <Popover.Close aria-label="Close" type="button" className={buttonStyle.Button}>
                                cancel
                            </Popover.Close>
                            <Popover.Close aria-label="Confirm" onClick={onSubmit} type="submit" className={buttonStyle.Button}>
                                OK
                            </Popover.Close>
                        </footer>

                    </form>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root >
    )
}
