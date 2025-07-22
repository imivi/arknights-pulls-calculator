import { create } from "zustand";
import { persist } from "zustand/middleware";


type Store = {
    showResources: boolean
    setShowResources: (showResources: boolean) => void
}

export const useShowResourcesStore = create(persist<Store>((set) => ({
    showResources: isMobile(),
    setShowResources: (showResources) => set({ showResources }),
}),
    { name: "show_resources" },
))


function isMobile(): boolean {
    return window.innerWidth < 600
}
