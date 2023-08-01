import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'
import cardsData from '../../app/cardsData'

export interface Card {
    id: number
    name: string
    action_type: 'Attack' | 'Defense' | 'Buff' | 'Heal'
    description: string
    art: string
    attack: number
    defense: number
    action_points: number
}

export interface CardState {
    deck: Card[]
    cardsPlayed: Card[]
    discardPile: Card[]
}

const initialState: CardState = {
    deck: cardsData,
    cardsPlayed: [],
    discardPile: [],
}

export const cardSlice = createSlice({
    name: 'card',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase
    },
})

export default cardSlice.reducer
