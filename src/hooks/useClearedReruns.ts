import { useClearedRerunsStore } from "../stores/useClearedRerunsStore"


export function useClearedReruns() {

    const { clearedReruns, setClearedReruns } = useClearedRerunsStore()

    function toggleClearedRerun(eventId: string) {

        if (clearedReruns.includes(eventId))
            setClearedReruns([...clearedReruns.filter(event => event !== eventId)])
        else
            setClearedReruns([...clearedReruns, eventId])
    }

    return {
        clearedReruns,
        toggleClearedRerun,
    }
}