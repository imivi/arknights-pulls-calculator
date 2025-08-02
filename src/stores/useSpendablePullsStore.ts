import { create } from "zustand";
import { persist } from "zustand/middleware";


type Store = {
    spendablePulls: Record<string, number>
    setSpendablePulls: (pullsSpent: Record<string, number>) => void
}

/** The maximum pulls that can be spent per day */
export const useSpendablePullsStore = create(persist<Store>((set) => ({
    spendablePulls: {},
    setSpendablePulls: (spendablePulls) => set({ spendablePulls }),
}),
    { name: "spendable_pulls" },
))
