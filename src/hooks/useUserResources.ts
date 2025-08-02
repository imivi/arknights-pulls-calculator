import { AllUserResources, useUserResourcesStore } from "../stores/useUserResourcesStore";


type Resource = "orundum" | "tickets" | "op"

export function useUserResources() {

    const { userResources, setUserResources } = useUserResourcesStore()

    function setResource(date: string, resource: Resource, value: number, description: string) {

        const newUserResources: AllUserResources = {
            ...userResources,
            [date]: {
                ...userResources[date],
                [resource]: {
                    description: description || "",
                    value: value || 0,
                },
            }
        }

        setUserResources(newUserResources)
    }

    function deleteResource(date: string, resource: Resource) {
        const newUserResources: AllUserResources = { ...userResources }

        delete newUserResources[date][resource]

        if (Object.keys(date).length === 0)
            delete newUserResources[date]

        setUserResources(newUserResources)
    }

    return {
        setResource,
        userResources,
        deleteResource,
    }
}