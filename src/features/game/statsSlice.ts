import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export interface StatsState {
    wins: number
    losses: number
}

const initialState: StatsState = {
    wins: 0,
    losses: 0,
}

export const statsSlice = createSlice({
    name: 'stats',
    initialState,
    reducers: {
        recordWin(state) {
            state.wins += 1
        },
        recordLoss(state) {
            state.losses += 1
        },
        resetStats() {
            return initialState
        },
    },
})

export const { recordWin, recordLoss, resetStats } = statsSlice.actions

export const selectStats = (state: RootState) => state.stats
export const selectWins = (state: RootState) => state.stats.wins
export const selectLosses = (state: RootState) => state.stats.losses

export default statsSlice.reducer
