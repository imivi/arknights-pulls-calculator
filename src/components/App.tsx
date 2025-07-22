import s from "./App.module.scss"

import { useCalendar } from "../hooks/useCalendar"
import { useClearedReruns } from "../hooks/useClearedReruns"
import { useStartingResources } from "../hooks/useStartingResources"
import { useClearedTodayStore } from "../stores/useClearedTodayStore"
import { useDarkModeStore } from "../stores/useDarkModeStore"
import { useSettingsStore } from "../stores/useSettings"
import Settings from "./Settings"
import { useShowResourcesStore } from "../stores/useShowResourcesStore"
import Footer from "./Footer"
import Table from "./Table"


export default function App() {

    const { startingResources } = useStartingResources()

    const { monthlyCard } = useSettingsStore()
    const f2p = !monthlyCard

    const { clearedReruns } = useClearedReruns()
    const firstDayCleared = useClearedTodayStore(store => store.clearedToday)
    const days = useCalendar(f2p, firstDayCleared, clearedReruns, startingResources)

    const { darkMode } = useDarkModeStore()

    const { showResources, setShowResources } = useShowResourcesStore()

    return (
        <main className={s.App} data-dark={darkMode}>

            <header data-dark={darkMode}>

                <main>
                    <img src={import.meta.env.VITE_ASSETS_BASE_URL + "bg/closure.png"} alt="logo" />
                    <h1 data-dark={darkMode}>Arknights Pulls Calculator</h1>
                    <Settings />
                </main>

            </header>

            <div className={s.message_box} data-dark={darkMode}>
                <label>
                    <input type="checkbox" checked={showResources} onChange={e => setShowResources(e.target.checked)} />
                    &nbsp;Show resource total
                </label>
                <small>
                    <img src={import.meta.env.VITE_ASSETS_BASE_URL + darkMode ? "icons/info_white.svg" : "icons/info_dark.svg"} alt="info icon" />
                    Click on a <strong data-dark={darkMode}>pull count</strong> to spend pulls
                </small>
            </div>

            <Table days={days} />

            <Footer days={days} />

        </main >
    )
}
