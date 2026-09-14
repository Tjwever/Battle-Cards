import { useAppSelector } from '../../app/hooks'
import { playerHealth, playerAP } from '../../features/player/playerSlice'
import { useHealthHit } from '../../features/game/useHealthHit'
import styles from '../../css/PlayerStats.module.css'

export function PlayerStats() {
    const playersHealth = useAppSelector(playerHealth)
    const ap = useAppSelector(playerAP)
    const hit = useHealthHit(playersHealth)

    return (
        <div className={styles.playersContainer}>
            <div className={styles.playerStats}>
                <div
                    className={`${styles.healthDisplay} ${
                        hit ? 'bc-damage-hit' : ''
                    }`}
                >
                    Health: {playersHealth}
                </div>
                <div className={styles.actionDisplay}>
                    AP: {ap}
                </div>
            </div>
        </div>
    )
}
