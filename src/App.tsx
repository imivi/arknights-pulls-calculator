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

                <img src={import.meta.env.VITE_ASSETS_BASE_URL + "bg/closure.png"} alt="logo" />

                <h1>Arknights Pulls Calculator</h1>

                <Settings />

            </header>

            <div className={s.table_container}>
                <table>

                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Date</th>

                            <th><span><Icon type="orundum" size={30} /> <div className={s.caption}>Orundum</div></span></th>
                            <th><span><Icon type="ticket" size={30} /> <div className={s.caption}>HH Permits</div></span></th>
                            <th><span><Icon type="op" size={30} /> <div className={s.caption}>OP</div></span></th>

                            <th>
                                Pulls<br />
                                (no <Icon type="op" size={24} />)
                            </th>
                            <th>
                                Pulls<br />
                                (incl. <Icon type="op" size={24} />)
                            </th>

                        </tr>
                    </thead>

                    <tbody>
                        {
                            dailyResources.map((day, i) => (
                                <TableRow
                                    key={day.day}
                                    day={day}
                                    rowIsEven={i % 2 === 0}
                                />
                            ))
                        }
                    </tbody>
                </table>
            </div>

            <footer>
                <button onClick={() => downloadCsv(dailyResources)}>Download table as CSV</button>
                <span>
                    <img src={import.meta.env.VITE_ASSETS_BASE_URL + "icons/closure_octocat.svg"} alt="github logo" />
                    <a href="https://github.com/imivi/arknights-pulls-calculator" target="_blank" rel="noreferrer">source</a>
                </span>
            </footer>

        </main>
    )
}

