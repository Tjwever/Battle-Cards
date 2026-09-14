import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import { MAX_HEALTH, STARTING_AP } from '../../app/gameConfig'

export interface PlayerState {
    player: { health: number; actionPoints: number; pendingAP: number }
    cpu: { health: number; actionPoints: number; pendingAP: number }
}

const initialState: PlayerState = {
    player: { health: MAX_HEALTH, actionPoints: STARTING_AP, pendingAP: 0 },
    cpu: { health: MAX_HEALTH, actionPoints: STARTING_AP, pendingAP: 0 },
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
            // Refill AP to the per-round base, then apply this round's net
            // buff (+) / debuff (-) deltas. AP does not carry over between
            // rounds (use-it-or-lose-it), so a player can never be locked out.
            state.player.actionPoints = Math.max(
                0,
                STARTING_AP + state.player.pendingAP
            )
            state.player.pendingAP = 0
            state.cpu.actionPoints = Math.max(
                0,
                STARTING_AP + state.cpu.pendingAP
            )
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
