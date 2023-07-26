import logo from './logo.svg'
import { Counter } from './features/counter/Counter'
import { PlayerHealth } from './components/Player/PlayerHealth'
import './App.css'

function App() {
    return (
        <div className='App'>
            <header className='App-header'>
                <PlayerHealth />
                <img src={logo} className='App-logo' alt='logo' />
                <Counter />
            </header>
        </div>
    )
}

export default App
