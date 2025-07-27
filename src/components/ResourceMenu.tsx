import s from "./ResourceMenu.module.scss"
import buttonStyle from "./Button.module.scss"

import { ReactNode, useEffect, useState } from "react";
import { Popover } from "radix-ui";
import Icon from "./Icon";
import { useDarkModeStore } from "../stores/useDarkModeStore";
import Button from "./Button";
import { useUserResources } from "../hooks/useUserResources";
import { UserResource } from "../stores/useUserResourcesStore";
import { Resource } from "../types";



const allValueShortcuts = {
    orundum: [],
    tickets: [0, 38],
    op: [0, -15, -18, -21, -24],
}



type Props = {
    resource: Resource
    date: string
    children: ReactNode
}

export default function ResourceMenu({ date, resource, children }: Props) {

    const [showMenu, setShowMenu] = useState(false)

    const [amount, setAmount] = useState(0)
    const [description, setDescription] = useState("")

    const { userResources, setResource } = useUserResources()

    const isActive = (date in userResources) && (resource in userResources[date]) && userResources[date][resource].value !== 0

    function getResources(): UserResource {
        if (date in userResources && resource in userResources[date]) {
            return userResources[date][resource]
        }
        return {
            value: 0,
            description: "",
        }
    }

    // Make sure the input fields are always showing the latest values
    useEffect(() => {
        if (showMenu) {
            const res = getResources()
            setAmount(res.value)
            setDescription(res.description)
        }
    }, [showMenu])

    function onSubmit() {
        setResource(date, resource, amount, description)
        setShowMenu(false)
    }

    const { darkMode } = useDarkModeStore()

    const valueShortcuts = allValueShortcuts[resource]

    return (
        <Popover.Root open={showMenu} onOpenChange={(open) => setShowMenu(open)} >
            <Popover.Trigger asChild>
                <button
                    className={s.btn_open_menu}
                    aria-label="Spend or gain resources"
                    data-resource={resource}
                    data-dark={darkMode}
                    data-active={isActive}
                >
                    {children}
                </button>
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
                                    value={amount}
                                    onChange={e => setAmount(e.target.valueAsNumber)}
                                    style={{ maxWidth: 60 }}
                                />
                                <Icon type={resource} size={22} />
                            </label>
                            <fieldset>
                                {
                                    valueShortcuts.length > 0 &&
                                    valueShortcuts.map(value => (
                                        <Button key={value} onClick={() => setAmount(value)}>{value}</Button>
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
