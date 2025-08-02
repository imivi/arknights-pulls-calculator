import { Day } from "../types"
import { useDarkModeStore } from "../stores/useDarkModeStore"
import { useShowResourcesStore } from "../stores/useShowResourcesStore"
import Icon from "./Icon"
import s from "./Table.module.scss"
import TableRow from "./TableRow"


type Props = {
    days: Day[]
}

export default function Table({ days }: Props) {

    const { darkMode } = useDarkModeStore()
    const { showResources } = useShowResourcesStore()

    return (
        <div className={s.Table}>
            <table>

                <thead data-dark={darkMode}>
                    <tr>
                        <th>Event</th>
                        <th>Date</th>

                        <th>Total pulls</th>
                        <th data-column="pulls-breakdown">
                            <span>
                                <Icon type="orundum" size={26} />
                                <Icon type="tickets" size={26} />
                            </span>
                            <span>
                                <Icon type="plus_op" size={30} />
                            </span>
                        </th>

                        <th>{/*Column for free pulls*/}</th>

                        <th data-show-global={showResources}><span><Icon type="orundum" size={30} /> <div className={s.caption}>Orundum</div></span></th>
                        <th data-show-global={showResources}><span><Icon type="tickets" size={30} /> <div className={s.caption}>HH Permits</div></span></th>
                        <th data-show-global={showResources}><span><Icon type="op" size={30} /> <div className={s.caption}>OP</div></span></th>

                        <th>
                            {/* Column for free monthly card and custom resource spending icon */}
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
    )
}