import { createSlice, PayloadAction } from '@reduxjs/toolkit'
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
    playerHand: Card[]
    computerHand: Card[]
    playerCardsPlayed: Card[]
    computerCardsPlayed: Card[]
    playerDiscardPile: Card[]
    computerDiscardPile: Card[]
}

function shuffleArray(array: Card[]): Card[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

const initialState: CardState = {
    playerDeck: cardsData,
    computerDeck: cardsData,
    playerHand: [],
    computerHand: [],
    playerCardsPlayed: [],
    computerCardsPlayed: [],
    playerDiscardPile: [],
    computerDiscardPile: [],
}

export const cardSlice = createSlice({
    name: 'card',
    initialState,
    reducers: {
        shufflePlayerDeck(state) {
            state.playerDeck = shuffleArray(state.playerDeck)
        },
        shuffleCpuDeck(state) {
            state.computerDeck = shuffleArray(state.computerDeck)
        },
        playerDrawCards(state, action: PayloadAction<number>) {
            const count = action.payload
            const maxDraw = 5 - state.playerHand.length
            const toDraw = Math.min(count, maxDraw)

            for (let i = 0; i < toDraw; i++) {
                if (state.playerDeck.length === 0) {
                    if (state.playerDiscardPile.length === 0) break
                    state.playerDeck = shuffleArray(state.playerDiscardPile)
                    state.playerDiscardPile = []
                }
                const card = state.playerDeck.shift()
                if (card) state.playerHand.push(card)
            }
        },
        cpuDrawCards(state, action: PayloadAction<number>) {
            const count = action.payload
            const maxDraw = 5 - state.computerHand.length
            const toDraw = Math.min(count, maxDraw)

            for (let i = 0; i < toDraw; i++) {
                if (state.computerDeck.length === 0) {
                    if (state.computerDiscardPile.length === 0) break
                    state.computerDeck = shuffleArray(
                        state.computerDiscardPile
                    )
                    state.computerDiscardPile = []
                }
                const card = state.computerDeck.shift()
                if (card) state.computerHand.push(card)
            }
        },
        playerPlayCard(state, action: PayloadAction<number>) {
            const cardIndex = state.playerHand.findIndex(
                (c) => c.id === action.payload
            )
            if (cardIndex !== -1) {
                const [card] = state.playerHand.splice(cardIndex, 1)
                state.playerCardsPlayed.push(card)
            }
        },
        cpuPlayCard(state, action: PayloadAction<number>) {
            const cardIndex = state.computerHand.findIndex(
                (c) => c.id === action.payload
            )
            if (cardIndex !== -1) {
                const [card] = state.computerHand.splice(cardIndex, 1)
                state.computerCardsPlayed.push(card)
            }
        },
        discardPlayedCards(state) {
            state.playerDiscardPile.push(...state.playerCardsPlayed)
            state.computerDiscardPile.push(...state.computerCardsPlayed)
            state.playerCardsPlayed = []
            state.computerCardsPlayed = []
        },
        resetCards() {
            return initialState
        },
    },
})

export const {
    shufflePlayerDeck,
    shuffleCpuDeck,
    playerDrawCards,
    cpuDrawCards,
    playerPlayCard,
    cpuPlayCard,
    discardPlayedCards,
    resetCards,
} = cardSlice.actions

export const selectPlayerDeck = (state: RootState) => state.card.playerDeck
export const selectComputerDeck = (state: RootState) => state.card.computerDeck
export const selectPlayerHand = (state: RootState) => state.card.playerHand
export const selectComputerHand = (state: RootState) => state.card.computerHand
export const selectPlayerCardsPlayed = (state: RootState) =>
    state.card.playerCardsPlayed
export const selectComputerCardsPlayed = (state: RootState) =>
    state.card.computerCardsPlayed
export const selectPlayerDiscardPile = (state: RootState) =>
    state.card.playerDiscardPile
export const selectComputerDiscardPile = (state: RootState) =>
    state.card.computerDiscardPile

export default cardSlice.reducer
