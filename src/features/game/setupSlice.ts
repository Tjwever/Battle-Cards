import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { DeckId } from '../../app/decks'
import type { Difficulty } from './ai'

export interface SetupState {
    playerDeckId: DeckId
    cpuDeckId: DeckId
    difficulty: Difficulty
}

const initialState: SetupState = {
    playerDeckId: 'fire',
    cpuDeckId: 'ice',
    difficulty: 'smart',
}

export const setupSlice = createSlice({
    name: 'setup',
    initialState,
    reducers: {
        setPlayerDeck(state, action: PayloadAction<DeckId>) {
            state.playerDeckId = action.payload
        },
        setCpuDeck(state, action: PayloadAction<DeckId>) {
            state.cpuDeckId = action.payload
        },
        setDifficulty(state, action: PayloadAction<Difficulty>) {
            state.difficulty = action.payload
        },
    },
})

export const { setPlayerDeck, setCpuDeck, setDifficulty } = setupSlice.actions

export const selectPlayerDeckId = (state: RootState) => state.setup.playerDeckId
export const selectCpuDeckId = (state: RootState) => state.setup.cpuDeckId
export const selectDifficulty = (state: RootState) => state.setup.difficulty

export default setupSlice.reducer
