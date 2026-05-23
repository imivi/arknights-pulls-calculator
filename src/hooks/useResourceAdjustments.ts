import { useResourceAdjustmentsStore } from "../stores/useResourceAdjustmentsStore"
import { Resource } from "../types"

export function useResourceAdjustments() {
    const { resourceAdjustments, setResourceAdjustments } = useResourceAdjustmentsStore()

    function getResourceAdjustment(date: string, resource: Resource) {
        const key = `${date}:${resource}`
        if (!resourceAdjustments.hasOwnProperty(key)) return null
        if (resourceAdjustments[key].amount === 0) return null
        return resourceAdjustments[key]
    }

    function setResourceAdjustment(date: string, resource: Resource, amount: number, description: string) {
        setResourceAdjustments({ ...resourceAdjustments, [`${date}:${resource}`]: { amount, description } })
    }

    function deleteResourceAdjustment(date: string, resource: Resource) {
        const key = `${date}:${resource}`
        const { [key]: _, ...rest } = resourceAdjustments
        setResourceAdjustments(rest)
    }

    return { getResourceAdjustment, setResourceAdjustment, deleteResourceAdjustment }
}