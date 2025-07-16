import { useEffect } from "react"


const localStorageKey = "first_load"

export function useFirstLoad() {

    const firstLoad = !localStorage.getItem(localStorageKey)

    useEffect(() => {
        localStorage.setItem(localStorageKey, "false")
    }, [])

    return firstLoad
}