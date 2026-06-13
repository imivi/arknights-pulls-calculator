import { create } from "zustand";
import { persist } from "zustand/middleware";


type Store = {
    certsPerDay: number
    setCertsPerDay: (certsPerDay: number) => void
}

export const useCertsPerDayStore = create(persist<Store>((set) => ({
    certsPerDay: 1.5,
    setCertsPerDay: (certsPerDay) => set({ certsPerDay }),
}),
    { name: "certs_per_day" },
))
