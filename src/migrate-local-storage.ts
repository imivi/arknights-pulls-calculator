import { BasicResources } from "./types"
import { convertResourcesToPulls } from "./utils/utils"


type ResourcesSpentState = {
    state: {
        resourcesSpent: Record<string, BasicResources>
    }
    version: number
}

type SpendablePullsState = {
    state: {
        spendablePulls: Record<string, number>
    }
    version: number
}


export function migrateLocalStorage() {

    const migrateFromKey = "resources_spent"
    const migrateToKey = "spendable_pulls"

    const resourcesSpentState: ResourcesSpentState = readLocalStorage(migrateFromKey)
    const spendablePulls = readLocalStorage(migrateToKey)

    const migrate = resourcesSpentState && !spendablePulls

    if (!migrate)
        return

    const spendablePullsStore: SpendablePullsState = {
        state: {
            spendablePulls: {},
        },
        version: 0,
    }
    for (const date of Object.keys(resourcesSpentState.state.resourcesSpent)) {
        const resources = resourcesSpentState.state.resourcesSpent[date]
        const pulls = convertResourcesToPulls(resources, true)
        console.log({ resources, pulls })
        if (pulls > 0)
            spendablePullsStore.state.spendablePulls[date] = pulls
    }

    // Update localstorage and refresh the page
    localStorage.setItem(migrateToKey, JSON.stringify(spendablePullsStore))
    window.location.reload()
}


function readLocalStorage(key: string): any | null {
    const json = localStorage.getItem(key)

    if (!json)
        return null

    try {
        return JSON.parse(json)
    }
    catch {
        return null
    }
}