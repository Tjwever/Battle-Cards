import React from 'react'
import styles from '../../css/Card.module.css'

interface CardProps {
    id?: number
    name: string
    description?: string
    art: string
    // Add other props and their types here if needed
}

const Card: React.FC<CardProps> = ({ name, description, art }) => {
    return (
        <div className={styles.card}>
            <div>{name}</div>

            <div className={styles.iconContainer}>
                <div className={styles.iconBG}> </div>
                <img src={`src/public/${art}`} />
            </div>

            <div className={styles.description}>{description}</div>
        </div>
    )
}

export default Card
// FaFistRaised
