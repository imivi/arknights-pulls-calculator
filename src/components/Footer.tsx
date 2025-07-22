import s from "./Footer.module.scss"

import { downloadCsv } from "../download-csv"
import { useDarkModeStore } from "../stores/useDarkModeStore"
import { Day } from "../day"


type Props = {
    days: Day[]
}

export default function Footer({ days }: Props) {

    const { darkMode, setDarkMode } = useDarkModeStore()

    return (
        <footer className={s.Footer} data-dark={darkMode}>

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

        </footer >
    )
}