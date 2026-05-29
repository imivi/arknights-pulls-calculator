import { create } from "zustand";
import { persist } from "zustand/middleware";


type Store = {
    orundumPerDay: number
    setOrundumPerDay: (orundumPerDay: number) => void

    everyday: boolean
    setEveryday: (everyday: boolean) => void
}

export const useFarmingStore = create(persist<Store>((set) => ({
    orundumPerDay: 0,
    setOrundumPerDay: (orundumPerDay: number) => set({ orundumPerDay }),

    everyday: true,
    setEveryday: (everyday: boolean) => set({ everyday }),
}),
    { name: "orundum_per_day" },
))
