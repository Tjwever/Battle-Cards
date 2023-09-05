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
    playerDeck: Card[]
    computerDeck: Card[]
    playerCardsPlayed: Card[]
    computerCardsPlayed: Card[]
    playerDiscardPile: Card[]
    computerDiscardPile: Card[]
}

const initialState: CardState = {
    playerDeck: cardsData,
    computerDeck: cardsData,
    playerCardsPlayed: [],
    computerCardsPlayed: [],
    playerDiscardPile: [],
    computerDiscardPile: [],
}

export const playerShuffleDeck = createAction('card/playerShuffleDeck')
export const cpuShuffleDeck = createAction('card/cpuShuffleDeck')

export const cardSlice = createSlice({
    name: 'card',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(playerShuffleDeck, (state) => {
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

            state.playerDeck = shuffleArray(state.playerDeck)
        })
        .addCase(cpuShuffleDeck, (state) => {
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

            state.computerDeck = shuffleArray(state.computerDeck)
        })
    },
})

export default cardSlice.reducer
