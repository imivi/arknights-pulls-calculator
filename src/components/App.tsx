import s from "./App.module.scss"

import { useDarkModeStore } from "../stores/useDarkModeStore"
import Settings from "./StartingResources"
import { useShowResourcesStore } from "../stores/useShowResourcesStore"
import Footer from "./Footer"
import Chart from "./Chart"
import { downloadCsv } from "../utils/download-csv"
import { useMemo, useState } from "react"
import { FaChevronRight, FaChevronUp, FaDownload, FaInfoCircle } from "react-icons/fa"
import Button from "./Button"
import Icon from "./Icon"
import { FaGear } from "react-icons/fa6"
import { IconOnlyResourceBadge } from "./table/ResourceBadge"
import Calendar from "./calendar/Calendar"
import { runPipeline } from "../utils/pipeline"
import tables from "../data/tables.json"
import { CalendarRow } from "../types"
import { useUserSettings } from "../hooks/useUserSettings"
import { useSpendOpStore } from "../stores/useSpendOpStore"
import { useShowDailyResourceChangeStore } from "../stores/useShowDailyResourceChangeStore"
import CertsPerDay from "./CertsPerDay"




function addFreePulls(row: CalendarRow): CalendarRow {

    if (row.is_collab)
        row.free_pulls = (row.day_of_event === 1 || row.day_of_event === 8) ? 10 : 0

    else if (row.is_limited && !row.is_rerun)
        row.free_pulls = row.day_of_event === 1 ? 11 : 1

    return row
}


export default function App() {

    const { darkMode } = useDarkModeStore()

    const { showResources, setShowResources } = useShowResourcesStore()

    const [showChart, setShowChart] = useState(window.innerWidth > 600)

    const userSettings = useUserSettings()

    const { showDailyResourceChange, setShowDailyResourceChange } = useShowDailyResourceChangeStore()

    // return <pre>{JSON.stringify(userSettings, null, 4)}</pre>

    // console.log(userSettings)

    const { dt_final_calendar, all_resources_gained_or_spent_by_day } = useMemo(() => runPipeline(userSettings, tables), [userSettings])

    const calendarRows = useMemo(() => dt_final_calendar.objects().map(row => addFreePulls(row as CalendarRow)), [dt_final_calendar])

    const { spendOp, setSpendOp } = useSpendOpStore()

    return (
        <main className={s.App} data-dark={darkMode}>

            <header className={s.Header} data-dark={darkMode}>

                <main>
                    <img src={import.meta.env.VITE_ASSETS_BASE_URL + "bg/closure.png"} alt="logo" />
                    <h1 data-dark={darkMode}>Arknights Pulls Calculator</h1>
                    <Settings />
                </main>

            </header>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "center", gap: 20 }}>

                <fieldset className={s.message_box} data-dark={darkMode}>
                    <legend>
                        <FaGear size={16} />&nbsp;settings
                    </legend>
                    <label>
                        <input type="checkbox" checked={showResources} onChange={e => setShowResources(e.target.checked)} />
                        &nbsp;Show resources
                        <Icon type="orundum" size={24} />
                        <Icon type="tickets" size={24} />
                        <Icon type="op" size={24} />
                        <Icon type="certs" size={24} />
                    </label>
                    <label>
                        <input type="checkbox" checked={showDailyResourceChange} onChange={e => setShowDailyResourceChange(e.target.checked)} />
                        &nbsp;Show daily resources gained/spent
                    </label>
                    <label>
                        <input type="checkbox" checked={spendOp} onChange={e => setSpendOp(e.target.checked)} />
                        &nbsp;Spend <Icon type="op" size={24} />for pulls
                    </label>
                    {/* <Button>Customize resource income</Button> */}

                    <CertsPerDay />

                </fieldset>

                <fieldset className={s.message_box} data-dark={darkMode}>
                    <legend>
                        <FaInfoCircle size={16} />&nbsp;tips
                    </legend>
                    <ul>
                        <li>Click on a <strong data-dark={darkMode}>pull count</strong> to spend pulls</li>
                        <li>Click on today's date to claim resources</li>
                        {
                            showResources &&
                            <>
                                <li>Click or hover over any resource badge
                                    <IconOnlyResourceBadge resource="orundum" />
                                    <IconOnlyResourceBadge resource="tickets" />
                                    <IconOnlyResourceBadge resource="op" />
                                    <IconOnlyResourceBadge resource="certs" />
                                    for additional info
                                </li>
                                <li>Click on any resource count to spend or gain resources<br />(can be used to trade certificates for tickets)</li>
                            </>
                        }
                    </ul>
                </fieldset>

            </div>

            <Calendar
                rows={calendarRows}
                resourcesGainedOrSpentByDay={all_resources_gained_or_spent_by_day}
            />

            <div className={s.buttons}>
                {/* <Button onClick={() => downloadCsv(days)}>
                    <FaDownload />&nbsp;
                    Download table (.csv)
                </Button> */}

                <Button onClick={() => setShowChart(!showChart)}>
                    {showChart ? <FaChevronUp /> : <FaChevronRight />}&nbsp;
                    {showChart ? "Hide chart" : "Show chart"}
                </Button>
            </div>

            {/* <Chart days={days} show={showChart} /> */}

            <Footer />

        </main >
    )
}
