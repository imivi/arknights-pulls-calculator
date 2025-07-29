import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BasicResources } from "../types";



type Store = {
    startingResources: BasicResources
    setStartingResources: (res: BasicResources) => void
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
    setStartingResources: (res: BasicResources) => set({ startingResources: res }),

}),
    { name: "settings" },
))
