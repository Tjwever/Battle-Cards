import logo from './logo.svg'
import { Counter } from './features/counter/Counter'
import { PlayerHealth } from './components/Player/PlayerHealth'
import { PlayerDeck } from './components/Player/PlayerDeck'
import { ComputerDeck } from './components/Computer/ComputerDeck'
import styles from './App.module.css'

function App() {
    return (
        <div className={styles.App}>
            <header className={styles.AppHeader}>
                <PlayerHealth />
                <div className={styles.deckContainer}>
                    <PlayerDeck />
                    <ComputerDeck />
                </div>
                <img src={logo} className='App-logo' alt='logo' />
                <Counter />
            </header>
        </div>
    )
}

export default App
