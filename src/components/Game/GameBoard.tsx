import { useState } from 'react'
import { useAppSelector, useAppDispatch } from '../../app/hooks'
import { cpuHealth, playerHealth, playerAP } from '../../features/player/playerSlice'
import {
    selectGamePhase,
    selectRound,
    selectWinner,
} from '../../features/game/gameSlice'
import {
    selectPlayerDeckId,
    selectCpuDeckId,
    selectDifficulty,
    setPlayerDeck,
    setCpuDeck,
    setDifficulty,
} from '../../features/game/setupSlice'
import { DECK_LIST, DECK_IDS, DECKS } from '../../app/decks'
import { selectStats } from '../../features/game/statsSlice'
import { useHealthHit } from '../../features/game/useHealthHit'
import {
    selectPlayerDeck,
    selectPlayerDiscardPile,
    selectComputerDeck,
    selectComputerDiscardPile,
    selectComputerCardsPlayed,
} from '../../features/cards/cardSlice'
import { initGame, revealAndResolve, advanceToNextRound } from '../../features/game/gameThunks'
import { PlayerStats } from '../Player/PlayerStats'
import PlayerHand from '../Player/PlayerHand'
import RoundLog from './RoundLog'
import CardSpot from '../Cards/CardSpot'
import Card from '../Cards/Card'
import CardBack from '../Cards/CardBack'
import DiscardViewer from './DiscardViewer'
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
    const playerDiscard = useAppSelector(selectPlayerDiscardPile)
    const cpuDeckSize = useAppSelector(selectComputerDeck).length
    const cpuDiscard = useAppSelector(selectComputerDiscardPile)
    const playerDiscardSize = playerDiscard.length
    const cpuDiscardSize = cpuDiscard.length
    const cpuCardsPlayed = useAppSelector(selectComputerCardsPlayed)
    const [openDiscard, setOpenDiscard] = useState<'player' | 'cpu' | null>(null)
    const playerDeckId = useAppSelector(selectPlayerDeckId)
    const cpuDeckId = useAppSelector(selectCpuDeckId)
    const difficulty = useAppSelector(selectDifficulty)
    const stats = useAppSelector(selectStats)
    const cpuHit = useHealthHit(cpusHealth)

    const handleStartGame = () => {
        // Player keeps their chosen deck; the CPU is dealt a random deck.
        const randomCpu =
            DECK_IDS[Math.floor(Math.random() * DECK_IDS.length)]
        dispatch(setCpuDeck(randomCpu))
        dispatch(initGame())
    }

    const handleReveal = () => {
        if (phase !== 'playerTurn') return
        dispatch(revealAndResolve())
    }

    const handleNextRound = () => {
        if (phase !== 'roundEnd') return
        dispatch(advanceToNextRound())
    }

    if (phase === 'idle') {
        return (
            <div className={styles.App}>
                <div className={styles.startScreen}>
                    <h1>Battle Cards</h1>
                    <p>A card game of strategy and combat</p>
                    <div className={styles.record}>
                        Record — Wins: {stats.wins} · Losses: {stats.losses}
                    </div>
                    <div className={styles.deckSelectTitle}>Choose your deck</div>
                    <div className={styles.deckOptions}>
                        {DECK_LIST.map((deck) => {
                            const selected = deck.id === playerDeckId
                            return (
                                <button
                                    key={deck.id}
                                    type="button"
                                    aria-pressed={selected}
                                    className={`${styles.deckOption} ${
                                        selected ? styles.deckOptionSelected : ''
                                    }`}
                                    onClick={() => dispatch(setPlayerDeck(deck.id))}
                                >
                                    <span className={styles.deckOptionName}>
                                        {deck.name}
                                    </span>
                                    <span className={styles.deckOptionDesc}>
                                        {deck.description}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                    <div className={styles.difficultyRow}>
                        <span className={styles.difficultyLabel}>CPU:</span>
                        {(['smart', 'greedy'] as const).map((d) => (
                            <button
                                key={d}
                                type="button"
                                aria-pressed={difficulty === d}
                                className={`${styles.difficultyOption} ${
                                    difficulty === d
                                        ? styles.difficultyOptionSelected
                                        : ''
                                }`}
                                onClick={() => dispatch(setDifficulty(d))}
                            >
                                {d === 'smart' ? 'Smart' : 'Basic'}
                            </button>
                        ))}
                    </div>
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
                    <div className={styles.record}>
                        Record — Wins: {stats.wins} · Losses: {stats.losses}
                    </div>
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
            <div className={styles.matchup}>
                You: {DECKS[playerDeckId].name} vs CPU: {DECKS[cpuDeckId].name}
            </div>
            <div className={styles.gameBoard}>
                <div className={styles.playersSide}>
                    <CardSpot
                        title={'Deck'}
                        count={cpuDeckSize}
                    />
                    <div className={styles.playersContainer}>
                        <div
                            className={`${styles.cpusHealthPoints} ${
                                cpuHit ? 'bc-damage-hit' : ''
                            }`}
                        >
                            Computer Health: {cpusHealth}
                        </div>
                        <div className={styles.cpusHand}>
                            CPU Hand (hidden)
                        </div>
                    </div>
                    <CardSpot
                        title={'Discard'}
                        count={cpuDiscardSize}
                        onClick={() => setOpenDiscard('cpu')}
                        ariaLabel={`View CPU discard pile (${cpuDiscardSize} cards)`}
                    />
                </div>

                {cpuCardsPlayed.length > 0 && (
                    <div className={styles.revealSection}>
                        <div className={styles.revealTitle}>
                            {phase === 'playerTurn'
                                ? `CPU Committed (${cpuCardsPlayed.length} face-down)`
                                : 'CPU Played'}
                        </div>
                        <div className={styles.revealCards}>
                            {phase === 'playerTurn'
                                ? cpuCardsPlayed.map((card) => (
                                      <CardBack
                                          key={card.id}
                                          label="CPU committed card"
                                      />
                                  ))
                                : cpuCardsPlayed.map((card) => (
                                      <div
                                          key={card.id}
                                          className="bc-reveal-flip"
                                      >
                                          <Card
                                              name={card.name}
                                              description={card.description}
                                              art={card.art}
                                              action_type={card.action_type}
                                              attack={card.attack}
                                              defense={card.defense}
                                              action_points={card.action_points}
                                          />
                                      </div>
                                  ))}
                        </div>
                    </div>
                )}

                <div className={styles.middleSection}>
                    {phase === 'roundEnd' ? (
                        <button
                            className={styles.playButton}
                            onClick={handleNextRound}
                        >
                            Continue
                        </button>
                    ) : (
                        <button
                            className={styles.playButton}
                            onClick={handleReveal}
                            disabled={phase !== 'playerTurn'}
                        >
                            Reveal
                        </button>
                    )}
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
                        onClick={() => setOpenDiscard('player')}
                        ariaLabel={`View your discard pile (${playerDiscardSize} cards)`}
                    />
                </div>
            </div>

            <PlayerHand />

            {openDiscard && (
                <DiscardViewer
                    title={
                        openDiscard === 'player'
                            ? 'Your Discard Pile'
                            : 'CPU Discard Pile'
                    }
                    cards={openDiscard === 'player' ? playerDiscard : cpuDiscard}
                    onClose={() => setOpenDiscard(null)}
                />
            )}
        </div>
    )
}
