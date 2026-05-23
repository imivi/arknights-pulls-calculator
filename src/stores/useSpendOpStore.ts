import { create } from "zustand";
import { persist } from "zustand/middleware";


type Store = {
    spendOp: boolean
    setSpendOp: (spendOp: boolean) => void
}

/** User setting for whether to include OP when calculating pulls */
export const useSpendOpStore = create(persist<Store>((set) => ({
    spendOp: true,
    setSpendOp: (spendOp) => set({ spendOp }),
}),
    { name: "spend_op" },
))
