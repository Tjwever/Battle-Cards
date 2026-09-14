import { useAppSelector, useAppDispatch } from '../../app/hooks'
import {
    selectPlayerHand,
    selectPlayerCardsPlayed,
    playerPlayCard,
    playerDrawCards,
    selectPlayerDeck,
    selectPlayerDiscardPile,
} from '../../features/cards/cardSlice'
import { playerAP, spendAP } from '../../features/player/playerSlice'
import { selectGamePhase, selectRound } from '../../features/game/gameSlice'
import { apCostOf } from '../../features/game/combat'
import Card from '../Cards/Card'
import styles from '../../css/PlayerHand.module.css'

export default function PlayerHand() {
    const dispatch = useAppDispatch()
    const hand = useAppSelector(selectPlayerHand)
    const cardsPlayed = useAppSelector(selectPlayerCardsPlayed)
    const ap = useAppSelector(playerAP)
    const phase = useAppSelector(selectGamePhase)
    const round = useAppSelector(selectRound)
    const deckSize = useAppSelector(selectPlayerDeck).length
    const discardSize = useAppSelector(selectPlayerDiscardPile).length

    const canPlay = phase === 'playerTurn'
    const canDraw =
        canPlay &&
        round > 1 &&
        hand.length < 5 &&
        (deckSize > 0 || discardSize > 0)

    const handlePlayCard = (cardId: number, cost: number) => {
        if (!canPlay) return
        if (cost > ap) return
        dispatch(playerPlayCard(cardId))
        if (cost > 0) {
            dispatch(spendAP({ amount: cost, player: 'player' }))
        }
    }

    const handleDraw = () => {
        if (!canDraw) return
        dispatch(playerDrawCards(1))
    }

    return (
        <div className={styles.handArea}>
            <div className={styles.handSection}>
                <div className={styles.sectionTitle}>Your Hand</div>
                <div className={styles.cardRow}>
                    {hand.map((card) => {
                        const cost = apCostOf(card)
                        const affordable = cost <= ap
                        return (
                            <button
                                key={card.id}
                                className={`${styles.cardButton} ${
                                    canPlay && affordable
                                        ? styles.playable
                                        : styles.disabled
                                }`}
                                onClick={() =>
                                    handlePlayCard(card.id, cost)
                                }
                                disabled={!canPlay || !affordable}
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
                            </button>
                        )
                    })}
                </div>
                {canDraw && (
                    <button className={styles.drawButton} onClick={handleDraw}>
                        Draw Card ({hand.length}/5)
                    </button>
                )}
            </div>

            {cardsPlayed.length > 0 && (
                <div className={styles.playedSection}>
                    <div className={styles.sectionTitle}>
                        Cards Played This Round
                    </div>
                    <div className={styles.cardRow}>
                        {cardsPlayed.map((card) => (
                            <div key={card.id} className={styles.playedCard}>
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
        </div>
    )
}
