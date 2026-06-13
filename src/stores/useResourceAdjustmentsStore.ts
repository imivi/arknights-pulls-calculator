import { create } from "zustand";
import { persist } from "zustand/middleware";


export type ResourceAdjustment = {
    amount: number
    description: string
}

// Each key is a string like "2026-01-01:orundum"
export type ResourceAdjustments = Record<string, ResourceAdjustment>

type Store = {
    resourceAdjustments: ResourceAdjustments
    setResourceAdjustments: (resourceAdjustments: ResourceAdjustments) => void
}

/** Allows the user to manually gain/spend resources, 
 * for example OP for skins, from packs, or tickets from the shop */
export const useResourceAdjustmentsStore = create(persist<Store>((set) => ({
    resourceAdjustments: {
        // Example:
        //     '2026-06-02:orundum': {
        //         amount: 1_000,
        //         description: 'random reward'
        //     },
        //     '2026-06-02:tickets': {
        //         amount: 12,
        //         description: 'buy tickets in store'
        //     },
        //     '2026-07-16:op': {
        //         amount: -18,
        //         description: 'skin purchase'
        //     },
        //     '2026-07-16:certs': {
        //         amount: -50,
        //         description: 'buy tickets in store'
        //     },
    },
    setResourceAdjustments: (resourceAdjustments) => set({ resourceAdjustments }),
}),
    {
        name: "user_resources",
        version: 1,
        migrate: (persistedState: any, version: number) => {
            if (version === 0) {
                console.info("Running migration script")
                console.info("Before:", persistedState)
                const newAdjustments: ResourceAdjustments = {}
                const oldAdjustments = persistedState.userResources || {}

                for (const [date, resources] of Object.entries(oldAdjustments)) {
                    if (typeof resources !== 'object' || resources === null) continue;

                    for (const [resourceType, data] of Object.entries(resources as Record<string, any>)) {
                        if (typeof data !== 'object' || data === null) continue;

                        newAdjustments[`${date}:${resourceType}`] = {
                            amount: data.value ?? 0,
                            description: data.description ?? ""
                        }
                    }
                }

                console.info("After:", newAdjustments)
                persistedState.resourceAdjustments = newAdjustments
            }

            return persistedState as Store
        }
    },
))
