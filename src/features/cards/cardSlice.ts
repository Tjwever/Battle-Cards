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

export const shuffleDeck = createAction('card/shuffleDeck')

export const cardSlice = createSlice({
    name: 'card',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(shuffleDeck, (state) => {
            function shuffleArray(array: Card[]) {
                const shuffledArray = [...array]
                for (let i = shuffledArray.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1))
                    ;[shuffledArray[i], shuffledArray[j]] = [
                        shuffledArray[j],
                        shuffledArray[i],
                    ]
                }
                return shuffledArray
            }

            state.deck = shuffleArray(state.deck)
        })
    },
})

export default cardSlice.reducer
