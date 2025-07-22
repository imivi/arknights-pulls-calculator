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
import { useShowResourcesStore } from "../stores/useShowResourcesStore"


export default function App() {

    const { startingResources } = useStartingResources()

    const { monthlyCard } = useSettingsStore()
    const f2p = !monthlyCard

    const { clearedReruns } = useClearedReruns()
    const firstDayCleared = useClearedTodayStore(store => store.clearedToday)
    const days = useCalendar(f2p, firstDayCleared, clearedReruns, startingResources)

    const { darkMode, setDarkMode } = useDarkModeStore()

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

                            <th data-show-global={showResources}><span><Icon type="orundum" size={30} /> <div className={s.caption}>Orundum</div></span></th>
                            <th data-show-global={showResources}><span><Icon type="ticket" size={30} /> <div className={s.caption}>HH Permits</div></span></th>
                            <th data-show-global={showResources}><span><Icon type="op" size={30} /> <div className={s.caption}>OP</div></span></th>

                            <th>
                                {/* Column for free monthly card */}
                            </th>

                        </tr>

                    </thead>

                    <tbody>
                        {
                            days.map((day, i) => (
                                <TableRow
                                    key={day.date}
                                    day={day}
                                    rowIsEven={i % 2 !== 0}
                                    isToday={i === 0}
                                />
                            ))
                        }
                    </tbody>

                </table>

            </div>

            <footer data-dark={darkMode}>

                <button onClick={() => downloadCsv(days)}>Download table as CSV</button>

                <div className={s.notes} data-dark={darkMode}>
                    <h2>Not included</h2>
                    <ul>
                        <li><strong>24 free pulls</strong> on each limited banner (every 3 months) are listed separately. They are excluded from the running total because they can&#39;t be saved.</li>
                        <li><strong>Distinction Certificates</strong> (gold certs), mostly from recruitment and extra event welfare tokens, you can exchange 258 of them for 38 HH permits.</li>
                        <li>Any orundum from the <strong>Intelligence Certification Store</strong> (purple certs) beyond the 2000 orundum added on each rerun. Note that this orundum does not expire after the rerun ends. Therefore, if you are a new player or you have not cleared past reruns, you can still purchase any remaining orundum.</li>
                        <li>Maintenance compensation and random gifts in the mail.</li>
                    </ul>

                    <h2>Notes</h2>
                    <ul>
                        <li>
                            2k orundum is added for every cleared rerun, obtained from
                            the Intelligence Certification Store by spending purple certs.
                            If you have not cleared all past reruns, you will be able to
                            spend excess certificates to buy orundum from past reruns.
                        </li>
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

            <script defer src={process.env.VITE_UMAMI_SCRIPT} data-website-id={process.env.VITE_UMAMI_WEBSITE_ID}></script>

        </main >
    )
}

