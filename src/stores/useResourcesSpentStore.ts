import { create } from "zustand";
import { persist } from "zustand/middleware";


type Resources = {
    orundum: number
    tickets: number
    op: number
}

type ResourcesSpent = Record<string, Resources>

type Store = {
    resourcesSpent: ResourcesSpent
    setResourcesSpent: (resourcesSpent: ResourcesSpent) => void
}

export const useResourcesSpentStore = create(persist<Store>((set) => ({
    resourcesSpent: {},
    setResourcesSpent: (resourcesSpent) => set({ resourcesSpent }),
}),
    { name: "resources_spent" },
))
