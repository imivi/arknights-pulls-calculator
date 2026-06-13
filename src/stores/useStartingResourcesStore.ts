import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BasicResources } from "../types";



type Store = {
    startingResources: BasicResources
    setStartingResources: (res: BasicResources) => void
    monthlyCard: boolean
    setMonthlyCard: (enabled: boolean) => void

}

export const useStartingResourcesStore = create(persist<Store>((set) => ({
    monthlyCard: false,
    setMonthlyCard: (monthlyCard: boolean) => set({ monthlyCard }),

    startingResources: {
        orundum: 0,
        op: 0,
        tickets: 0,
        certs: 0,
    },
    setStartingResources: (res: BasicResources) => set({ startingResources: res }),

}),
    {
        name: "settings",
        version: 1,
        migrate: (persistedState: any, version: number) => {
            if (version === 0) {
                if (persistedState.startingResources && typeof persistedState.startingResources.certs === 'undefined') {
                    persistedState.startingResources.certs = 0;
                }
            }
            return persistedState as Store;
        }
    },
))
