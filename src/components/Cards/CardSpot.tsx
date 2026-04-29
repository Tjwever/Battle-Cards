import styles from '../../css/CardSpot.module.css'

interface CardSpotProps {
    title: string
    count?: number
}

const CardSpot: React.FC<CardSpotProps> = ({ title, count }) => {
    return (
        <div className={styles.playersDeck}>
            <div className={styles.label}>{title}</div>
            <div className={styles.cardVisual}>
                {count !== undefined && (
                    <span className={styles.count}>{count}</span>
                )}
            </div>
        </div>
    )
}

export default CardSpot
