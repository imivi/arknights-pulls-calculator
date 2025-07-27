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
                    description,
                    value,
                },
            }
        }

        setUserResources(newUserResources)
    }

    return {
        setResource,
        userResources,
    }
}