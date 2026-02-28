import { create } from "zustand";
import { persist } from "zustand/middleware";


type Store = {
    dayCleared: string | null
    setDayCleared: (dayCleared: string | null) => void
}

export const useDayClearedStore = create(persist<Store>((set) => ({
    dayCleared: null,
    setDayCleared: (dayCleared) => set({ dayCleared }),
}),
    { name: "day_cleared" },
))
