import React from 'react'
import styles from '../../css/Card.module.css'

interface CardProps {
    id?: number
    name: string
    description?: string
    art: string
    action_type?: 'Attack' | 'Defense' | 'Buff' | 'Heal'
    attack?: number
    defense?: number
    action_points?: number
    style?: React.CSSProperties
}

const Card: React.FC<CardProps> = ({
    name,
    description,
    art,
    action_type,
    attack,
    defense,
    action_points,
    style,
}) => {
    return (
        <div className={styles.card} style={style}>
            <div className={styles.cardName}>{name}</div>

            <div className={styles.iconContainer}>
                <div className={styles.iconBG} />
                <img src={`src/public/${art}`} alt={name} />
            </div>

            <div className={styles.description}>{description}</div>

            {(attack !== undefined ||
                defense !== undefined ||
                action_points !== undefined) && (
                <div className={styles.cardStats}>
                    {attack !== undefined && attack > 0 && (
                        <span className={styles.statAttack}>ATK {attack}</span>
                    )}
                    {defense !== undefined && defense > 0 && (
                        <span className={styles.statDefense}>
                            DEF {defense}
                        </span>
                    )}
                    {action_points !== undefined && (
                        <span className={styles.statAP}>
                            AP {action_points}
                        </span>
                    )}
                </div>
            )}

            {action_type && (
                <div className={styles.cardType}>{action_type}</div>
            )}
        </div>
    )
}

export default Card
