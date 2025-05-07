import { useClearedRerunsStore } from "../stores/useClearedRerunsStore"


export function useClearedReruns() {

    const { clearedReruns, setClearedReruns } = useClearedRerunsStore()

    function toggleClearedRerun(eventId: string) {
        let newValue = []

        if (clearedReruns.includes(eventId))
            newValue = clearedReruns.filter(event => event !== eventId)
        else
            newValue = [...clearedReruns, eventId]

        setClearedReruns(newValue)
    }

    return {
        clearedReruns,
        toggleClearedRerun,
    }
}