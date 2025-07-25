import { useMemo } from "react"
import { useSettingsStore } from "../stores/useSettings"
import { Resources } from "../resources"



type Resource = "orundum" | "op" | "tickets"

export function useStartingResources() {

    const { startingResources, setStartingResources } = useSettingsStore()

    const resources = useMemo(() => {
        const { orundum, tickets, op } = startingResources
        return new Resources(orundum || 0, tickets || 0, op || 0)
    }, [startingResources])

    function setResource(res: Resource, value: number) {
        const newResources = {
            ...resources,
            [res]: value,
        }
        setStartingResources(newResources)
    }

    return {
        startingResources: resources,
        setResource,
    }
}