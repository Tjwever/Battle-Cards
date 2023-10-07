import { PlayerStats } from '../Player/PlayerStats'
import { PlayerDeck } from '../Player/PlayerDeck'
import { ComputerDeck } from '../Computer/ComputerDeck'
import CardSpot from '../Cards/CardSpot'

import { useAppSelector, useAppDispatch } from '../../app/hooks'
import {
    decrementHealth,
    incrementHealth,
    playerHealth,
    cpuHealth,
} from '../../features/player/playerSlice'
import styles from '../../css/GameBoard.module.css'

export default function GameBoard() {
    const playersHealth = useAppSelector(playerHealth)
    const cpusHealth = useAppSelector(cpuHealth)
    const dispatch = useAppDispatch()

    const handleDecrementPlayerHealth = () => {
        dispatch(decrementHealth({ amount: 3, player: 'player' })) // Decrement 3 health points for the player
    }

    const handleDecrementCPUHealth = () => {
        dispatch(decrementHealth({ amount: 3, player: 'cpu' })) // Decrement 3 health points for the CPU
    }
    return (
        <div className={styles.App}>
            <div className={styles.gameBoard}>
                <div className={styles.playersSide}>
                    <CardSpot title={'Deck'} />
                    <div className={styles.playersContainer}>
                        <div className={styles.cpusHealthPoints}>
                            Computer's Health: {playersHealth}
                        </div>
                        <div className={styles.cpusHand}>Computer's Hand</div>
                    </div>
                    <CardSpot title={'Discard Pile'} />
                </div>

                <button className={styles.playButton}>Play Round!</button>

                <div className={styles.playersSide}>
                    <CardSpot title={'Deck'} />
                    <PlayerStats />
                    <CardSpot title={'Discard Pile'} />
                </div>
            </div>
        </div>
    )
}
