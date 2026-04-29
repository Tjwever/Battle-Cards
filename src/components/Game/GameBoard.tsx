import { PlayerStats } from '../Player/PlayerStats'
import CardSpot from '../Cards/CardSpot'

import { useAppSelector } from '../../app/hooks'
import { cpuHealth } from '../../features/player/playerSlice'
import styles from '../../css/GameBoard.module.css'

export default function GameBoard() {
    const cpusHealth = useAppSelector(cpuHealth)

    return (
        <div className={styles.App}>
            <div className={styles.gameBoard}>
                <div className={styles.playersSide}>
                    <CardSpot title={'Deck'} />
                    <div className={styles.playersContainer}>
                        <div className={styles.cpusHealthPoints}>
                            Computer Health: {cpusHealth}
                        </div>
                        <div className={styles.cpusHand}>Computer's Hand</div>
                    </div>
                    <CardSpot title={'Discard'} />
                </div>

                <button className={styles.playButton}>Play Round</button>

                <div className={styles.playersSide}>
                    <CardSpot title={'Deck'} />
                    <PlayerStats />
                    <CardSpot title={'Discard'} />
                </div>
            </div>
        </div>
    )
}
