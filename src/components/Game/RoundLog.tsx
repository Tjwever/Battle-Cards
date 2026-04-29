import { useAppSelector } from '../../app/hooks'
import { selectRoundLog } from '../../features/game/gameSlice'
import styles from '../../css/RoundLog.module.css'

export default function RoundLog() {
    const log = useAppSelector(selectRoundLog)

    if (log.length === 0) return null

    return (
        <div className={styles.logContainer}>
            <div className={styles.logTitle}>Battle Log</div>
            <div className={styles.logEntries}>
                {log.map((entry, i) => (
                    <div key={i} className={styles.logEntry}>
                        {entry}
                    </div>
                ))}
            </div>
        </div>
    )
}
