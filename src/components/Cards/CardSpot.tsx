import styles from '../../css/CardSpot.module.css'

interface CardSpotProps {
    title: string
    count?: number
    onClick?: () => void
    /** Accessible label when clickable (defaults to a sensible value). */
    ariaLabel?: string
}

const CardSpot: React.FC<CardSpotProps> = ({
    title,
    count,
    onClick,
    ariaLabel,
}) => {
    const content = (
        <>
            <div className={styles.label}>{title}</div>
            <div className={styles.cardVisual}>
                {count !== undefined && (
                    <span className={styles.count}>{count}</span>
                )}
            </div>
        </>
    )

    if (onClick) {
        return (
            <button
                type="button"
                className={`${styles.playersDeck} ${styles.clickable}`}
                onClick={onClick}
                aria-label={ariaLabel ?? `View ${title} (${count ?? 0} cards)`}
            >
                {content}
            </button>
        )
    }

    return <div className={styles.playersDeck}>{content}</div>
}

export default CardSpot
