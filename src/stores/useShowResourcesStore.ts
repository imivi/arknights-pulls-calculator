import { create } from "zustand";
import { persist } from "zustand/middleware";


type Store = {
    showResources: boolean
    setShowResources: (showResources: boolean) => void
}

export const useShowResourcesStore = create(persist<Store>((set) => ({
    showResources: isDesktop(),
    setShowResources: (showResources) => set({ showResources }),
}),
    { name: "show_resources" },
))


function isDesktop(): boolean {
    return window.innerWidth > 600
}
