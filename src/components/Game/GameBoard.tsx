import { PlayerHealth } from '../Player/PlayerHealth'
import { PlayerDeck } from '../Player/PlayerDeck'
import { ComputerDeck } from '../Computer/ComputerDeck'

import styles from '../../App.module.css'

export default function GameBoard() {
    return (
        <div className={styles.App}>
            <header className={styles.AppHeader}>
                <PlayerHealth />
                <div className={styles.deckContainer}>
                    {/* <PlayerDeck />
                    <ComputerDeck /> */}
                </div>
            </header>
        </div>
    )
}
