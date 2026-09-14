import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import type { DeckId } from '../../app/decks'

export interface SetupState {
    playerDeckId: DeckId
    cpuDeckId: DeckId
}

const initialState: SetupState = {
    playerDeckId: 'fire',
    cpuDeckId: 'ice',
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
    },
})

export const { setPlayerDeck, setCpuDeck } = setupSlice.actions

export const selectPlayerDeckId = (state: RootState) => state.setup.playerDeckId
export const selectCpuDeckId = (state: RootState) => state.setup.cpuDeckId

export default setupSlice.reducer
