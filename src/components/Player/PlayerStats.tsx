import { useAppSelector } from '../../app/hooks'
import { playerHealth, playerAP } from '../../features/player/playerSlice'
import styles from '../../css/PlayerStats.module.css'

export function PlayerStats() {
    const playersHealth = useAppSelector(playerHealth)
    const ap = useAppSelector(playerAP)

    return (
        <div className={styles.playersContainer}>
            <div className={styles.playersHand}>
                <div className={styles.cardsInHand}>Cards in Hand</div>
                <div className={styles.cardsPlayed}>Cards Played</div>
            </div>
            <div className={styles.playerStats}>
                <div className={styles.healthDisplay}>
                    Health: {playersHealth}
                </div>
                <div className={styles.actionDisplay}>Action: {ap}</div>
            </div>
        </div>
    )
}
