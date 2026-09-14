import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
import cardsData from '../../app/cardsData'
import { MAX_HAND_SIZE, INITIAL_DRAW_COUNT } from '../../app/gameConfig'
import { shuffle } from '../game/rng'
import { drawCards } from '../game/deckOps'

/**
 * Explicit semantic effect of a card. This is the single source of truth for
 * how combat treats a card — never inferred from stats or parsed from text.
 */
export type CardEffect =
    | 'attack'
    | 'defense'
    | 'attackBuff'
    | 'defenseBuff'
    | 'apBuff'
    | 'apDebuff'
    | 'heal'

export interface Card {
    id: number
    name: string
    action_type: 'Attack' | 'Defense' | 'Buff' | 'Heal' | 'Debuff'
    /** Explicit effect category used by combat resolution. */
    effect: CardEffect
    /** Canonical magnitude of the card's effect (damage, block, buff bonus, heal HP, or AP granted). */
    amount: number
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

export { MAX_HAND_SIZE, INITIAL_DRAW_COUNT }

function shuffleArray(array: Card[]): Card[] {
    return shuffle(array)
}

const initialState: CardState = {
    playerDeck: [...cardsData],
    computerDeck: [...cardsData],
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
            const { deck, discard, hand } = drawCards(
                {
                    deck: state.playerDeck,
                    discard: state.playerDiscardPile,
                    hand: state.playerHand,
                },
                action.payload
            )
            state.playerDeck = deck
            state.playerDiscardPile = discard
            state.playerHand = hand
        },
        cpuDrawCards(state, action: PayloadAction<number>) {
            const { deck, discard, hand } = drawCards(
                {
                    deck: state.computerDeck,
                    discard: state.computerDiscardPile,
                    hand: state.computerHand,
                },
                action.payload
            )
            state.computerDeck = deck
            state.computerDiscardPile = discard
            state.computerHand = hand
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
        loadDecks(
            state,
            action: PayloadAction<{ player: Card[]; computer: Card[] }>
        ) {
            state.playerDeck = action.payload.player
            state.computerDeck = action.payload.computer
            state.playerHand = []
            state.computerHand = []
            state.playerCardsPlayed = []
            state.computerCardsPlayed = []
            state.playerDiscardPile = []
            state.computerDiscardPile = []
        },
        resetCards() {
            return {
                ...initialState,
                playerDeck: [...cardsData],
                computerDeck: [...cardsData],
            }
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
    loadDecks,
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
