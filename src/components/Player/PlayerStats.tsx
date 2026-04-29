import { useAppSelector } from '../../app/hooks'
import { playerHealth } from '../../features/player/playerSlice'
import styles from '../../css/PlayerStats.module.css'

export function PlayerStats() {
    const playersHealth = useAppSelector(playerHealth)

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
                <div className={styles.actionDisplay}>
                    Action: 2
                </div>
            </div>
        </div>
    )
}
