import { useState } from 'react'

import { useAppSelector, useAppDispatch } from '../../app/hooks'
import {
    decrementHealth,
    incrementHealth,
    playerHealth,
    cpuHealth,
} from '../../features/player/playerSlice'
import styles from '../../App.module.css'

export function PlayerHealth() {
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
        <div className={styles.gameBoard}>
            <div className={styles.cpuGameBoard}>
                <span className={styles.value}>CPU's Health: {cpusHealth}</span>
                <button onClick={handleDecrementCPUHealth}>Attack CPU</button>
            </div>
            <div className={styles.playerGameBoard}>
                <span className={styles.value}>
                    Player's Health: {playersHealth}
                </span>
                <button onClick={handleDecrementPlayerHealth}>
                    Attack Player
                </button>
            </div>
        </div>
    )
}
