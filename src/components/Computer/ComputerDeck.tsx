import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../app/hooks'

import styles from '../../css/Card.module.css'
import { cpuShuffleDeck } from '../../features/cards/cardSlice'
import Card from '../Cards/Card'

export function ComputerDeck() {
    const dispatch = useAppDispatch()
    const deck = useAppSelector((state) => state.card.computerDeck)

    useEffect(() => {
        dispatch(cpuShuffleDeck())
    }, [])

    return (
        <div className={styles.cardContainer}>
            <h1>Computer's Deck</h1>
            {deck.map((card, index) => (
                <Card
                    key={card.id}
                    name={card.name}
                    description={card.description}
                    art={card.art}
                    action_type={card.action_type}
                    attack={card.attack}
                    defense={card.defense}
                    action_points={card.action_points}
                    style={{ animationDelay: `${index * 0.05}s` }}
                />
            ))}
        </div>
    )
}
