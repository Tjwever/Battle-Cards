import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../app/hooks'

import styles from '../Cards/Card.module.css'
import { playerShuffleDeck } from '../../features/cards/cardSlice'
import Card from '../Cards/Card'

export function PlayerDeck() {
    const dispatch = useAppDispatch()
    const deck = useAppSelector((state) => state.card.playerDeck)

    useEffect(() => {
        dispatch(playerShuffleDeck())
    }, [])

    return (
        <>
            <div className={styles.cardContainer}>
            <h1>Player's Deck</h1>
                {deck.map((card) => (
                    <Card key={card.id} name={card.name} description={card.description} art={card.art}/>
                ))}
            </div>
        </>
    )
}
