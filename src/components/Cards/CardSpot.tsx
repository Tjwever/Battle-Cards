import styles from '../../css/CardSpot.module.css'

interface CardSpotProps {
    title: string
}

const CardSpot: React.FC<CardSpotProps> = ({ title }) => {
    return (
        <div className={styles.playersDeck}>
            <div>{title}</div>
            <div className={styles.cardVisual}></div>
        </div>
    )
}

export default CardSpot