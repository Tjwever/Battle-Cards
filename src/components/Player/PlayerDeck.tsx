import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../app/hooks'

import styles from '../Cards/Card.module.css'
import { shuffleDeck } from '../../features/cards/cardSlice'
import Card from '../Cards/Card'

export function PlayerDeck() {
    const dispatch = useAppDispatch()
    const deck = useAppSelector((state) => state.card.deck)

    useEffect(() => {
        dispatch(shuffleDeck())
    }, [])

    return (
        <>
            <div className={styles.cardContainer}>
                {deck.map((card) => (
                    <Card key={card.id} name={card.name} />
                ))}
            </div>
        </>
    )
}
