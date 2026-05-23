import { useMemo } from "react"
import { Resources } from "../utils/resources"
import { useStartingResourcesStore } from "../stores/useStartingResourcesStore"
import { Resource } from "../types"




export function useStartingResources() {

    const { startingResources, setStartingResources } = useStartingResourcesStore()

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