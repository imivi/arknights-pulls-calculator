import { create } from "zustand";
import { persist } from "zustand/middleware";


type Store = {
    showDailyResourceChange: boolean
    setShowDailyResourceChange: (showDailyResourceChange: boolean) => void
}

export const useShowDailyResourceChangeStore = create(persist<Store>((set) => ({
    showDailyResourceChange: true,
    setShowDailyResourceChange: (showDailyResourceChange) => set({ showDailyResourceChange }),
}),
    { name: "show_daily_resource_change" },
))
