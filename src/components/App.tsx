import s from "./App.module.scss"

import { downloadCsv } from "../download-csv"
import { useCalendar } from "../hooks/useCalendar"
import { useClearedReruns } from "../hooks/useClearedReruns"
import { useStartingResources } from "../hooks/useStartingResources"
import { useClearedTodayStore } from "../stores/useClearedTodayStore"
import { useDarkModeStore } from "../stores/useDarkModeStore"
import { useSettingsStore } from "../stores/useSettings"
import Icon from "./Icon"
import Settings from "./Settings"
import TableRow from "./TableRow"
import { useFirstLoad } from "../hooks/useFirstLoad"


export default function App() {

    const { startingResources } = useStartingResources()

    const { monthlyCard } = useSettingsStore()
    const f2p = !monthlyCard

    const { clearedReruns } = useClearedReruns()
    const firstDayCleared = useClearedTodayStore(store => store.clearedToday)
    const dailyResources = useCalendar(startingResources, f2p, clearedReruns, firstDayCleared)

    const { darkMode, setDarkMode } = useDarkModeStore()
    const firstLoad = useFirstLoad()

    return (
        <main className={s.App} data-dark={darkMode}>

            <header data-dark={darkMode}>

                <main>
                    <img src={import.meta.env.VITE_ASSETS_BASE_URL + "bg/closure.png"} alt="logo" />
                    <h1 data-dark={darkMode}>Arknights Pulls Calculator</h1>
                    <Settings />
                </main>

            </header>

            <div className={s.table_container}>
                <table>

                    <thead data-dark={darkMode}>
                        <tr>
                            <th>Event</th>
                            <th>Date</th>

                            <th>Total pulls</th>
                            <th data-column="pulls-breakdown">
                                <span>
                                    <Icon type="orundum" size={26} />
                                    <Icon type="ticket" size={26} />
                                </span>
                                <span>
                                    <Icon type="plus_op" size={30} />
                                </span>
                            </th>

                            <th>{/*Column for free pulls*/}</th>

                            <th><span><Icon type="orundum" size={30} /> <div className={s.caption}>Orundum</div></span></th>
                            <th><span><Icon type="ticket" size={30} /> <div className={s.caption}>HH Permits</div></span></th>
                            <th><span><Icon type="op" size={30} /> <div className={s.caption}>OP</div></span></th>

                            <th>
                                {/* Column for free monthly card */}
                            </th>

                        </tr>

                    </thead>

                    <tbody>
                        {
                            dailyResources.map((day, i) => (
                                <TableRow
                                    key={day.dateString}
                                    day={day}
                                    rowIsEven={i % 2 !== 0}
                                    isToday={i === 0}
                                    firstLoad={firstLoad}
                                />
                            ))
                        }
                    </tbody>
                </table>

            </div>

            <footer data-dark={darkMode}>

                <button onClick={() => downloadCsv(dailyResources)}>Download table as CSV</button>

                <div className={s.notes} data-dark={darkMode}>
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

                <fieldset className={s.darkmode_toggle}>

                    <label data-active={!darkMode}>
                        <input
                            type="radio"
                            name="light-mode"
                            value="light"
                            checked={!darkMode}
                            onChange={e => setDarkMode(!e.target.checked)}
                        />
                        ☀️ Light
                    </label>

                    <label data-active={darkMode}>
                        <input
                            type="radio"
                            name="dark-mode"
                            value="dark"
                            checked={darkMode}
                            onChange={e => setDarkMode(e.target.checked)}
                        />
                        🌙 Dark
                    </label>

                </fieldset>

            </footer>

        </main >
    )
}

