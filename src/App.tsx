import s from "./App.module.scss"

import Icon from "./components/Icon"
import { useStartingResources } from "./hooks/useStartingResources"
import { useClearedReruns } from "./hooks/useClearedReruns"
import TableRow from "./components/TableRow"
import { useCalendar } from "./hooks/useCalendar"
import Settings from "./components/Settings"
import { downloadCsv } from "./download-csv"
import { useSettingsStore } from "./stores/useSettings"



export default function App() {


    const { startingResources } = useStartingResources()

    const { monthlyCard } = useSettingsStore()
    const f2p = !monthlyCard

    const { clearedReruns } = useClearedReruns()
    const dailyResources = useCalendar(startingResources, f2p, clearedReruns)

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

                            <th rowSpan={2}><span><Icon type="orundum" size={30} /> <div className={s.caption}>Orundum</div></span></th>
                            <th rowSpan={2}><span><Icon type="ticket" size={30} /> <div className={s.caption}>HH Permits</div></span></th>
                            <th rowSpan={2}><span><Icon type="op" size={30} /> <div className={s.caption}>OP</div></span></th>

                            <th colSpan={3} className={s.text_center}>Pulls</th>

                        </tr>

                        <tr>
                            <th>
                                <Icon type="orundum" size={26} />
                                <Icon type="ticket" size={26} />
                            </th>
                            <th><Icon type="plus_op" size={30} /></th>
                            <th>note</th>
                        </tr>

                    </thead>

                    <tbody>
                        {
                            dailyResources.map((day, i) => (
                                <TableRow
                                    key={day.dateString}
                                    day={day}
                                    rowIsEven={i % 2 === 0}
                                />
                            ))
                        }
                    </tbody>
                </table>

            </div>

            <footer>

                <div className={s.notes}>
                    <h2>Not included:</h2>
                    <ul>
                        <li>24 free pulls on each limited banner (every 3 months)</li>
                        <li>Distinction Certificates (gold certs)</li>
                        <li>Orundum from the Intelligence Certification Store (purple certs)</li>
                        <li>Maintenance compensation and random gifts in the mail</li>
                    </ul>
                </div>

                <button onClick={() => downloadCsv(dailyResources)}>Download table as CSV</button>
                <span>
                    <img src={import.meta.env.VITE_ASSETS_BASE_URL + "icons/closure_octocat.svg"} alt="github logo" />
                    <a href="https://github.com/imivi/arknights-pulls-calculator" target="_blank" rel="noreferrer">source</a>
                </span>
            </footer>

        </main>
    )
}

