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
import Chart from "./Chart"
import { downloadCsv } from "../utils/download-csv"
import { useState } from "react"
import { FaChevronDown, FaChevronRight, FaDownload, FaInfoCircle } from "react-icons/fa"
import Button from "./Button"
import Icon from "./Icon"
import ResourceBadge from "./ResourceBadge"


export default function App() {

    const { startingResources } = useStartingResources()

    const { monthlyCard } = useSettingsStore()
    const f2p = !monthlyCard

    const { clearedReruns } = useClearedReruns()
    const firstDayCleared = useClearedTodayStore(store => store.clearedToday)
    const days = useCalendar(f2p, firstDayCleared, clearedReruns, startingResources)

    const { darkMode } = useDarkModeStore()

    const { showResources, setShowResources } = useShowResourcesStore()

    const [showChart, setShowChart] = useState(window.innerWidth > 600)

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
                    &nbsp;Show resources
                </label>
                <div className={s.tips}>
                    <FaInfoCircle size={18} />
                    <ul>
                        <li>Click on a <strong data-dark={darkMode}>pull count</strong> to spend pulls</li>
                        <li>Click on the first date to claim today's resources</li>
                        {
                            showResources &&
                            <>
                                <li>Click or hover over any resource badge
                                    <ResourceBadge resource="orundum" tooltipId="" />
                                    <ResourceBadge resource="tickets" tooltipId="" />
                                    <ResourceBadge resource="op" tooltipId="" />
                                    for additional information
                                </li>
                                <li>
                                    Click on any
                                    <Icon type="orundum" size={24} />
                                    <Icon type="tickets" size={26} />
                                    <Icon type="op" size={20} />
                                    count to spend or gain resources
                                </li>
                            </>
                        }
                    </ul>
                </div>
            </div>

            <Table days={days} />

            <div className={s.buttons}>
                <Button onClick={() => downloadCsv(days)}>
                    <FaDownload />&nbsp;
                    Download table (.csv)
                </Button>

                <Button onClick={() => setShowChart(!showChart)}>
                    {showChart ? <FaChevronDown /> : <FaChevronRight />}&nbsp;
                    {showChart ? "Hide chart" : "Show chart"}
                </Button>
            </div>

            <Chart days={days} show={showChart} />

            <Footer />


        </main >
    )
}
