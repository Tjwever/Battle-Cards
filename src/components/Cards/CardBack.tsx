import styles from '../../css/Card.module.css'

interface CardBackProps {
    /** Accessible label, e.g. "CPU committed card". */
    label?: string
}

/**
 * A face-down card back, shown for cards that have been committed but not yet
 * revealed (the CPU's played cards during the player's turn).
 */
const CardBack: React.FC<CardBackProps> = ({ label = 'Face-down card' }) => {
    return (
        <div
            className={`${styles.card} ${styles.cardBack}`}
            role="img"
            aria-label={label}
        >
            <div className={styles.cardBackEmblem}>⚔</div>
        </div>
    )
}

export default CardBack
