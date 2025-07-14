import { create } from "zustand";
import { persist } from "zustand/middleware";


type Store = {
    clearedToday: boolean
    setClearedToday: (clearedToday: boolean) => void
}

export const useClearedTodayStore = create(persist<Store>((set) => ({
    clearedToday: false,
    setClearedToday: (clearedToday) => set({ clearedToday }),
}),
    { name: "cleared_today" },
))
