import { useState } from "react";
import { Day } from "../types";
import { useSettings } from "../hooks/useSettings";

export default function DebugCalendar({ days }: { days: Day[] }) {

    const settings = useSettings()

    const [show, setShow] = useState(false)

    const jsonText = JSON.stringify({ settings, days }, null, 4)

    function copy() {
        navigator.clipboard.writeText(jsonText)
    }

    return (
        <>
            <div style={{ position: "fixed", bottom: 10, right: 10 }}>
                <button onClick={() => setShow(!show)}>Debug calendar</button>
                <button onClick={copy}>Copy days</button>
            </div>
            <div style={{
                overflow: "auto",
                display: show ? "grid" : "none",
                position: "fixed",
                top: 10,
                left: 10,
                height: "90vh",
                width: "90vw",
                zIndex: 100,
                backgroundColor: "white",
                padding: 10,
                gridTemplateRows: "auto 1fr",
            }}>
                <button onClick={copy}>copy</button>
                <pre>{jsonText}</pre>
            </div>
        </>
    )
}