import { create } from "zustand";
import { persist } from "zustand/middleware";


type Resources = {
    orundum: number
    tickets: number
    op: number
}

type Store = {
    startingResources: Resources
    setStartingResources: (res: Resources) => void
    monthlyCard: boolean
    setMonthlyCard: (enabled: boolean) => void

}

export const useSettingsStore = create(persist<Store>((set) => ({
    monthlyCard: false,
    setMonthlyCard: (monthlyCard: boolean) => set({ monthlyCard }),

    startingResources: {
        orundum: 0,
        op: 0,
        tickets: 0,
    },
    setStartingResources: (res: Resources) => set({ startingResources: res }),

}),
    { name: "settings" },
))
