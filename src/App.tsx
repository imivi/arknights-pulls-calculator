import s from "./App.module.scss"

import Icon from "./components/Icon"
import { useStartingResources } from "./hooks/useStartingResources"
import { useClearedReruns } from "./hooks/useClearedReruns"
import TableRow from "./components/TableRow"
import { useCalendar } from "./hooks/useCalendar"
import Settings from "./components/Settings"
import { downloadCsv } from "./download-csv"
import { useSettingsStore } from "./stores/useSettings"
import { useClearedTodayStore } from "./stores/useClearedTodayStore"



export default function App() {


    const { startingResources } = useStartingResources()

    const { monthlyCard } = useSettingsStore()
    const f2p = !monthlyCard

    const { clearedReruns } = useClearedReruns()
    const firstDayCleared = useClearedTodayStore(store => store.clearedToday)
    const dailyResources = useCalendar(startingResources, f2p, clearedReruns, firstDayCleared)

    return (
        <main className={s.App}>

            <header>

                <main>
                    <img src={import.meta.env.VITE_ASSETS_BASE_URL + "bg/closure.png"} alt="logo" />
                    <h1>Arknights Pulls Calculator</h1>
                    <Settings />
                </main>

            </header>

            <div className={s.table_container}>
                <table>

                    <thead>
                        <tr>
                            <th rowSpan={2}>Event</th>
                            <th rowSpan={2}>Date</th>

                            <th colSpan={4} className={s.text_center}>Pulls</th>

                            <th rowSpan={2}><span><Icon type="orundum" size={30} /> <div className={s.caption}>Orundum</div></span></th>
                            <th rowSpan={2}><span><Icon type="ticket" size={30} /> <div className={s.caption}>HH Permits</div></span></th>
                            <th rowSpan={2}><span><Icon type="op" size={30} /> <div className={s.caption}>OP</div></span></th>
                        </tr>

                        <tr>
                            <th>Total pulls</th>
                            <th>
                                <Icon type="orundum" size={26} />
                                <Icon type="ticket" size={26} />
                            </th>
                            <th><Icon type="plus_op" size={30} /></th>
                            <th></th>
                        </tr>

                    </thead>

                    <tbody>
                        {
                            dailyResources.map((day, i) => (
                                <TableRow
                                    key={day.dateString}
                                    day={day}
                                    rowIsEven={i % 2 === 0}
                                    isToday={i === 0}
                                />
                            ))
                        }
                    </tbody>
                </table>

            </div>

            <footer>

                <button onClick={() => downloadCsv(dailyResources)}>Download table as CSV</button>

                <div className={s.notes}>
                    <h2>Not included:</h2>
                    <ul>
                        <li>24 free pulls on each limited banner (every 3 months)</li>
                        <li>Distinction Certificates (gold certs)</li>
                        <li>Orundum from the Intelligence Certification Store (purple certs)</li>
                        <li>Maintenance compensation and random gifts in the mail</li>
                    </ul>
                </div>

                <p>Feedback / suggestions? <a href="https://docs.google.com/forms/d/1OHmmz5OlnV6blkSeJUH_vLMn4XTCXbP3B1wlPHMFgVo/viewform" target="_blank" rel="noreferrer">Use this form</a> or open an issue on GitHub</p>

                <p>
                    <img src={import.meta.env.VITE_ASSETS_BASE_URL + "icons/closure_octocat.svg"} alt="github logo" />
                    <a href="https://github.com/imivi/arknights-pulls-calculator" target="_blank" rel="noreferrer">&nbsp;source</a>
                </p>

            </footer>

        </main>
    )
}

