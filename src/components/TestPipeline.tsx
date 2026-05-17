import { useState } from "react"
import { runPipeline, UserSettings } from "../utils/pipeline"
import tables from "../data/tables.json"


export default function TestPipeline() {

    const userSettings: UserSettings = {
        startingOrundum: 10_000,
        startingTickets: 20,
        startingOp: 200,
        startingCerts: 50,
        monthlyCard: false,
        claimedDay: '2026-05-16',
        certsPerDay: 1.5,
        clearedReruns: [
            'exodus_rerun',
            'reunion_lim_rerun',
        ],
        maxPullsToSpend: {
            '2026-07-16': 176,
        },
        // resources added or subtracted by the user
        userResources: {
            '2026-06-02': {
                orundum: { value: 1_000, description: 'user_input' },
                tickets: { value: 38, description: 'user_input' },
                op: { value: 10, description: 'user_input' },
                certs: { value: -258, description: 'user_input' },
            },
        },
    }

    const output = runPipeline(userSettings, tables)

    return (
        <main>
            <p>Rows (full): {output.dt_merged.objects().length}</p>
            <p>Rows (filtered): {output.dt_filtered.objects().length}</p>

            <Tabs dts={{
                '📅 Days': output.dt_days.objects(),
                '🎇 Events': output.dt_events.objects(),
                '💰 Daily Certs': output.dt_certs.objects(),
                '🏦 User Resources': output.dt_user_resources.orderby('day').objects(),
                '🏦 All Resources': output.dt_all_resources.orderby('day').objects(),
                '🔄 Merged': output.dt_merged.objects(),
                '🔍 Filtered': output.dt_filtered.objects(),
                '💰 Resources Gained by Day': output.dt_res_gained_by_day.objects(),
                '💰 Res after pulling': output.res_gained_by_day,
                '💰 Final Calendar': output.dt_final_calendar.objects(),
                '💰 Resources Spent for Pulling': output.dt_resources_spent_from_pulling.objects(),
                '💰 All Resources incl Pulls': output.dt_all_resources_incl_pulls.objects(),
            }} />

            {/* <TableDisplay rows={dt_days.objects()} />
            <TableDisplay rows={dt_events.objects()} />
            <TableDisplay rows={dt_resources.objects()} /> */}
        </main>
    )
}


function Tabs({ dts }: { dts: Record<string, any> }) {
    const [activeTab, setActiveTab] = useState(0)

    return (
        <div>
            {Object.entries(dts).map(([label, dt], i) => (
                <button key={i} onClick={() => setActiveTab(i)}>{label}</button>
            ))}
            {Object.values(dts).map((dt, i) => (
                activeTab === i && <TableDisplay key={i} rows={dt} />
            ))}
        </div>
    )
}



function TableDisplay({ rows }: { rows: Record<string, string | number>[] }) {
    if (rows.length === 0) return <p>No data</p>

    const headers = Object.keys(rows[0])

    return <table style={{ borderCollapse: 'collapse', border: '1px solid #000', textAlign: 'left', padding: '0.5rem' }}>
        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'white', borderBottom: '2px solid #000' }}>
            <tr style={{ border: '1px solid #000' }}>
                {headers.map(h => <th key={h} style={{ border: '1px solid #000', textAlign: 'left', padding: '0.5rem' }}>{h}</th>)}
            </tr>
        </thead>
        <tbody>
            {rows.map((row, i) => (
                <tr key={i}>
                    {Object.values(row).map((v, j) => (
                        <td key={j} style={{ border: '1px solid #ddd', textAlign: 'left', padding: '2px 5px' }}>{v}</td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
}