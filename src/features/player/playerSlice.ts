import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export interface PlayerState {
    player: { health: number; actionPoints: number; pendingAP: number }
    cpu: { health: number; actionPoints: number; pendingAP: number }
}

const MAX_HEALTH = 10

const initialState: PlayerState = {
    player: { health: 10, actionPoints: 2, pendingAP: 0 },
    cpu: { health: 10, actionPoints: 2, pendingAP: 0 },
}

export const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        incrementHealth(
            state,
            action: PayloadAction<{ amount: number; player: 'player' | 'cpu' }>
        ) {
            const { amount, player } = action.payload
            const target = state[player]
            target.health = Math.min(target.health + amount, MAX_HEALTH)
        },
        decrementHealth(
            state,
            action: PayloadAction<{ amount: number; player: 'player' | 'cpu' }>
        ) {
            const { amount, player } = action.payload
            const target = state[player]
            target.health = Math.max(target.health - amount, 0)
        },
        spendAP(
            state,
            action: PayloadAction<{ amount: number; player: 'player' | 'cpu' }>
        ) {
            const { amount, player } = action.payload
            state[player].actionPoints = Math.max(
                state[player].actionPoints - amount,
                0
            )
        },
        addPendingAP(
            state,
            action: PayloadAction<{ amount: number; player: 'player' | 'cpu' }>
        ) {
            const { amount, player } = action.payload
            state[player].pendingAP += amount
        },
        applyPendingAP(state) {
            state.player.actionPoints += state.player.pendingAP
            state.player.pendingAP = 0
            state.cpu.actionPoints += state.cpu.pendingAP
            state.cpu.pendingAP = 0
        },
        resetAP(state) {
            state.player.actionPoints = 2
            state.player.pendingAP = 0
            state.cpu.actionPoints = 2
            state.cpu.pendingAP = 0
        },
        resetPlayers() {
            return initialState
        },
    },
})

export const {
    incrementHealth,
    decrementHealth,
    spendAP,
    addPendingAP,
    applyPendingAP,
    resetAP,
    resetPlayers,
} = playerSlice.actions

export const playerHealth = (state: RootState) => state.player.player.health
export const cpuHealth = (state: RootState) => state.player.cpu.health
export const playerAP = (state: RootState) =>
    state.player.player.actionPoints
export const cpuAP = (state: RootState) => state.player.cpu.actionPoints
export const selectPlayerState = (state: RootState) => state.player.player
export const selectCpuState = (state: RootState) => state.player.cpu

export default playerSlice.reducer
