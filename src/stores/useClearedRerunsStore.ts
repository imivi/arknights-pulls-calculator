import { create } from "zustand";
import { persist } from "zustand/middleware";


type Store = {
    clearedReruns: string[]
    setClearedReruns: (clearedReruns: string[]) => void
}

export const useClearedRerunsStore = create(persist<Store>((set) => ({
    clearedReruns: [],
    setClearedReruns: (clearedReruns) => set({ clearedReruns }),
}),
    { name: "cleared_reruns" },
))
