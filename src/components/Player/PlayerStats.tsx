import { useState } from 'react'

import { useAppSelector, useAppDispatch } from '../../app/hooks'
import {
    decrementHealth,
    incrementHealth,
    playerHealth,
    cpuHealth,
} from '../../features/player/playerSlice'
import styles from '../../css/PlayerStats.module.css'
import CardSpot from '../Cards/CardSpot'

export function PlayerStats() {
    const playersHealth = useAppSelector(playerHealth)
    const cpusHealth = useAppSelector(cpuHealth)
    const dispatch = useAppDispatch()

    const handleDecrementPlayerHealth = () => {
        dispatch(decrementHealth({ amount: 3, player: 'player' })) // Decrement 3 health points for the player
    }

    const handleDecrementCPUHealth = () => {
        dispatch(decrementHealth({ amount: 3, player: 'cpu' })) // Decrement 3 health points for the CPU
    }

    return (
        <div className={styles.playersContainer}>
            <div className={styles.playersHand}>
                <div className={styles.cardsInHand}>asdf</div>
                <div className={styles.cardsPlayed}>asdf</div>
                <div>Player's Hand</div>
            </div>
            <div className={styles.playerStats}>
                <div>Player's Health: {playersHealth}</div>
                <div>Player's Action: 2</div>
            </div>
        </div>
    )
}
