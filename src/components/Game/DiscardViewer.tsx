import type { Card as CardType } from '../../features/cards/cardSlice'
import Card from '../Cards/Card'
import styles from '../../css/DiscardViewer.module.css'

interface DiscardViewerProps {
    title: string
    cards: CardType[]
    onClose: () => void
}

/**
 * Modal that lists the contents of a discard pile. Handles the empty state
 * (nothing discarded yet) and provides an explicit close affordance.
 */
export default function DiscardViewer({
    title,
    cards,
    onClose,
}: DiscardViewerProps) {
    return (
        <div
            className={styles.overlay}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={onClose}
        >
            <div
                className={styles.panel}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h2 className={styles.title}>{title}</h2>
                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={onClose}
                        aria-label="Close discard viewer"
                    >
                        ✕
                    </button>
                </div>

                {cards.length === 0 ? (
                    <p className={styles.empty}>No cards discarded yet.</p>
                ) : (
                    <div className={styles.cards}>
                        {cards.map((card, i) => (
                            <Card
                                key={`${card.id}-${i}`}
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
                )}
            </div>
        </div>
    )
}
