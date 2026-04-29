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

const typeClassMap: Record<string, string> = {
    Attack: styles.attackCard,
    Defense: styles.defenseCard,
    Buff: styles.buffCard,
    Heal: styles.healCard,
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
    const typeClass = action_type ? typeClassMap[action_type] ?? '' : ''

    return (
        <div className={`${styles.card} ${typeClass}`} style={style}>
            <div className={styles.cardName}>{name}</div>

            <div className={styles.iconContainer}>
                <div className={styles.iconBG} />
                <img src={`src/public/${art}`} alt={name} />
            </div>

            <div className={styles.description}>{description}</div>

            {(attack !== undefined || defense !== undefined || action_points !== undefined) && (
                <div className={styles.cardStats}>
                    {attack !== undefined && attack > 0 && (
                        <span className={styles.statAttack}>ATK {attack}</span>
                    )}
                    {defense !== undefined && defense > 0 && (
                        <span className={styles.statDefense}>DEF {defense}</span>
                    )}
                    {action_points !== undefined && (
                        <span className={styles.statAP}>AP {action_points}</span>
                    )}
                </div>
            )}
        </div>
    )
}

export default Card
