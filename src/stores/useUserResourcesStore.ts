import { create } from "zustand";
import { persist } from "zustand/middleware";


export type UserResource = {
    value: number
    description: string
}

export type UserResources = {
    orundum: UserResource
    tickets: UserResource
    op: UserResource
}

// Maps the date to the custom user resources
export type AllUserResources = Record<string, UserResources>

type Store = {
    userResources: AllUserResources
    setUserResources: (userResources: AllUserResources) => void
}

/** Allows the user to manually gain/spend resources, 
 * for example OP for skins, from packs, or tickets from the shop */
export const useUserResourcesStore = create(persist<Store>((set) => ({
    userResources: {},
    setUserResources: (userResources) => set({ userResources }),
}),
    { name: "user_resources" },
))
