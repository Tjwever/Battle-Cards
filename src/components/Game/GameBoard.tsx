import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { cpuHealth, playerHealth, playerAP } from '../../features/player/playerSlice'
import {
    selectGamePhase,
    selectRound,
    selectWinner,
} from '../../features/game/gameSlice'
import {
    selectPlayerDeck,
    selectPlayerDiscardPile,
    selectComputerDeck,
    selectComputerDiscardPile,
    selectComputerCardsPlayed,
} from '../../features/cards/cardSlice'
import { initGame, playRound } from '../../features/game/gameThunks'
import { PlayerStats } from '../Player/PlayerStats'
import PlayerHand from '../Player/PlayerHand'
import RoundLog from './RoundLog'
import CardSpot from '../Cards/CardSpot'
import Card from '../Cards/Card'
import styles from '../../css/GameBoard.module.css'

export default function GameBoard() {
    const dispatch = useAppDispatch()
    const cpusHealth = useAppSelector(cpuHealth)
    const playersHealth = useAppSelector(playerHealth)
    const ap = useAppSelector(playerAP)
    const phase = useAppSelector(selectGamePhase)
    const round = useAppSelector(selectRound)
    const winner = useAppSelector(selectWinner)
    const playerDeckSize = useAppSelector(selectPlayerDeck).length
    const playerDiscardSize = useAppSelector(selectPlayerDiscardPile).length
    const cpuDeckSize = useAppSelector(selectComputerDeck).length
    const cpuDiscardSize = useAppSelector(selectComputerDiscardPile).length
    const cpuCardsPlayed = useAppSelector(selectComputerCardsPlayed)

    const handleStartGame = () => {
        dispatch(initGame())
    }

    const handlePlayRound = () => {
        if (phase !== 'playerTurn') return
        dispatch(playRound())
    }

    if (phase === 'idle') {
        return (
            <div className={styles.App}>
                <div className={styles.startScreen}>
                    <h1>Battle Cards</h1>
                    <p>A card game of strategy and combat</p>
                    <button
                        className={styles.playButton}
                        onClick={handleStartGame}
                    >
                        Start Game
                    </button>
                </div>
            </div>
        )
    }

    if (phase === 'gameOver') {
        return (
            <div className={styles.App}>
                <div className={styles.gameOverScreen}>
                    <h1>Game Over</h1>
                    <p className={styles.winnerText}>
                        {winner === 'player'
                            ? 'You Win!'
                            : 'CPU Wins!'}
                    </p>
                    <p>
                        Final Score — You: {playersHealth} HP | CPU:{' '}
                        {cpusHealth} HP
                    </p>
                    <RoundLog />
                    <button
                        className={styles.playButton}
                        onClick={handleStartGame}
                    >
                        Play Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className={styles.App}>
            <div className={styles.roundIndicator}>Round {round}</div>
            <div className={styles.gameBoard}>
                <div className={styles.playersSide}>
                    <CardSpot
                        title={'Deck'}
                        count={cpuDeckSize}
                    />
                    <div className={styles.playersContainer}>
                        <div className={styles.cpusHealthPoints}>
                            Computer Health: {cpusHealth}
                        </div>
                        <div className={styles.cpusHand}>
                            CPU Hand (hidden)
                        </div>
                    </div>
                    <CardSpot
                        title={'Discard'}
                        count={cpuDiscardSize}
                    />
                </div>

                {cpuCardsPlayed.length > 0 && (
                    <div className={styles.revealSection}>
                        <div className={styles.revealTitle}>
                            CPU Played
                        </div>
                        <div className={styles.revealCards}>
                            {cpuCardsPlayed.map((card) => (
                                <Card
                                    key={card.id}
                                    name={card.name}
                                    description={card.description}
                                    art={card.art}
                                    action_type={card.action_type}
                                    attack={card.attack}
                                    defense={card.defense}
                                    action_points={card.action_points}
                                />
                            ))}
                        </div>
                    </div>
                )}

                <div className={styles.middleSection}>
                    <button
                        className={styles.playButton}
                        onClick={handlePlayRound}
                        disabled={phase !== 'playerTurn'}
                    >
                        Play Round
                    </button>
                    <div className={styles.apDisplay}>AP: {ap}</div>
                </div>

                <RoundLog />

                <div className={styles.playersSide}>
                    <CardSpot
                        title={'Deck'}
                        count={playerDeckSize}
                    />
                    <PlayerStats />
                    <CardSpot
                        title={'Discard'}
                        count={playerDiscardSize}
                    />
                </div>
            </div>

            <PlayerHand />
        </div>
    )
}
