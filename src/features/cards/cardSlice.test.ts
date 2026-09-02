import cardReducer, {
    playerDrawCards,
    cpuDrawCards,
    shufflePlayerDeck,
    shuffleCpuDeck,
    resetCards,
} from './cardSlice'
import type { CardState, Card } from './cardSlice'
import cardsData from '../../app/cardsData'

function makeCard(overrides: Partial<Card> = {}): Card {
    return {
        id: 99,
        name: 'Test Card',
        action_type: 'Attack',
        description: 'test',
        art: 'test.png',
        attack: 1,
        defense: 0,
        action_points: 1,
        ...overrides,
    }
}

function makeState(overrides: Partial<CardState> = {}): CardState {
    return {
        playerDeck: [],
        computerDeck: [],
        playerHand: [],
        computerHand: [],
        playerCardsPlayed: [],
        computerCardsPlayed: [],
        playerDiscardPile: [],
        computerDiscardPile: [],
        ...overrides,
    }
}

describe('cardSlice — Hand Management (Milestone 1)', () => {
    describe('playerDrawCards', () => {
        it('draws the specified number of cards from deck to hand', () => {
            const deck = [
                makeCard({ id: 1 }),
                makeCard({ id: 2 }),
                makeCard({ id: 3 }),
                makeCard({ id: 4 }),
                makeCard({ id: 5 }),
            ]
            const state = makeState({ playerDeck: deck })

            const result = cardReducer(state, playerDrawCards(3))

            expect(result.playerHand).toHaveLength(3)
            expect(result.playerDeck).toHaveLength(2)
            expect(result.playerHand.map((c) => c.id)).toEqual([1, 2, 3])
        })

        it('enforces the 5-card hand limit', () => {
            const deck = [
                makeCard({ id: 1 }),
                makeCard({ id: 2 }),
                makeCard({ id: 3 }),
                makeCard({ id: 4 }),
                makeCard({ id: 5 }),
            ]
            const hand = [
                makeCard({ id: 10 }),
                makeCard({ id: 11 }),
                makeCard({ id: 12 }),
            ]
            const state = makeState({ playerDeck: deck, playerHand: hand })

            // Try to draw 5 but only 2 slots available
            const result = cardReducer(state, playerDrawCards(5))

            expect(result.playerHand).toHaveLength(5)
            expect(result.playerDeck).toHaveLength(3)
        })

        it('does not draw beyond hand limit of 5', () => {
            const hand = [
                makeCard({ id: 1 }),
                makeCard({ id: 2 }),
                makeCard({ id: 3 }),
                makeCard({ id: 4 }),
                makeCard({ id: 5 }),
            ]
            const deck = [makeCard({ id: 10 })]
            const state = makeState({ playerDeck: deck, playerHand: hand })

            const result = cardReducer(state, playerDrawCards(1))

            expect(result.playerHand).toHaveLength(5)
            expect(result.playerDeck).toHaveLength(1)
        })

        it('reshuffles discard pile into deck when deck is empty', () => {
            const discardPile = [
                makeCard({ id: 1 }),
                makeCard({ id: 2 }),
                makeCard({ id: 3 }),
            ]
            const state = makeState({
                playerDeck: [],
                playerDiscardPile: discardPile,
            })

            const result = cardReducer(state, playerDrawCards(2))

            expect(result.playerHand).toHaveLength(2)
            expect(result.playerDiscardPile).toHaveLength(0)
            // Remaining cards are in the deck (reshuffled)
            expect(result.playerDeck).toHaveLength(1)
        })

        it('reshuffles mid-draw if deck runs out partway', () => {
            const deck = [makeCard({ id: 1 })]
            const discardPile = [
                makeCard({ id: 2 }),
                makeCard({ id: 3 }),
                makeCard({ id: 4 }),
            ]
            const state = makeState({
                playerDeck: deck,
                playerDiscardPile: discardPile,
            })

            const result = cardReducer(state, playerDrawCards(3))

            expect(result.playerHand).toHaveLength(3)
            expect(result.playerDiscardPile).toHaveLength(0)
            // 1 from deck + 3 from discard = 4 total available, drew 3
            expect(result.playerDeck).toHaveLength(1)
        })

        it('stops drawing when both deck and discard are empty', () => {
            const state = makeState({
                playerDeck: [],
                playerDiscardPile: [],
            })

            const result = cardReducer(state, playerDrawCards(3))

            expect(result.playerHand).toHaveLength(0)
            expect(result.playerDeck).toHaveLength(0)
        })
    })

    describe('cpuDrawCards', () => {
        it('draws cards from CPU deck to CPU hand', () => {
            const deck = [
                makeCard({ id: 1 }),
                makeCard({ id: 2 }),
                makeCard({ id: 3 }),
            ]
            const state = makeState({ computerDeck: deck })

            const result = cardReducer(state, cpuDrawCards(2))

            expect(result.computerHand).toHaveLength(2)
            expect(result.computerDeck).toHaveLength(1)
        })

        it('enforces the 5-card hand limit for CPU', () => {
            const deck = [makeCard({ id: 1 }), makeCard({ id: 2 })]
            const hand = [
                makeCard({ id: 10 }),
                makeCard({ id: 11 }),
                makeCard({ id: 12 }),
                makeCard({ id: 13 }),
            ]
            const state = makeState({
                computerDeck: deck,
                computerHand: hand,
            })

            const result = cardReducer(state, cpuDrawCards(2))

            expect(result.computerHand).toHaveLength(5)
            expect(result.computerDeck).toHaveLength(1)
        })

        it('reshuffles CPU discard pile when deck is empty', () => {
            const discardPile = [
                makeCard({ id: 1 }),
                makeCard({ id: 2 }),
            ]
            const state = makeState({
                computerDeck: [],
                computerDiscardPile: discardPile,
            })

            const result = cardReducer(state, cpuDrawCards(1))

            expect(result.computerHand).toHaveLength(1)
            expect(result.computerDiscardPile).toHaveLength(0)
            expect(result.computerDeck).toHaveLength(1)
        })
    })

    describe('shufflePlayerDeck', () => {
        it('shuffles the player deck without changing card count', () => {
            const deck = cardsData.slice(0, 10)
            const state = makeState({ playerDeck: deck })

            const result = cardReducer(state, shufflePlayerDeck())

            expect(result.playerDeck).toHaveLength(10)
            // All original cards still present (by id)
            const originalIds = deck.map((c) => c.id).sort()
            const shuffledIds = result.playerDeck.map((c) => c.id).sort()
            expect(shuffledIds).toEqual(originalIds)
        })
    })

    describe('shuffleCpuDeck', () => {
        it('shuffles the CPU deck without changing card count', () => {
            const deck = cardsData.slice(0, 10)
            const state = makeState({ computerDeck: deck })

            const result = cardReducer(state, shuffleCpuDeck())

            expect(result.computerDeck).toHaveLength(10)
            const originalIds = deck.map((c) => c.id).sort()
            const shuffledIds = result.computerDeck.map((c) => c.id).sort()
            expect(shuffledIds).toEqual(originalIds)
        })
    })

    describe('resetCards', () => {
        it('resets all card state to initial values', () => {
            const state = makeState({
                playerDeck: [makeCard({ id: 1 })],
                playerHand: [makeCard({ id: 2 })],
                playerDiscardPile: [makeCard({ id: 3 })],
                computerHand: [makeCard({ id: 4 })],
            })

            const result = cardReducer(state, resetCards())

            expect(result.playerDeck).toEqual(cardsData)
            expect(result.computerDeck).toEqual(cardsData)
            expect(result.playerHand).toHaveLength(0)
            expect(result.computerHand).toHaveLength(0)
            expect(result.playerDiscardPile).toHaveLength(0)
            expect(result.computerDiscardPile).toHaveLength(0)
        })

        it('gives each player an independent deck copy', () => {
            const state = cardReducer(undefined, resetCards())
            expect(state.playerDeck).not.toBe(state.computerDeck)
            expect(state.playerDeck).toEqual(state.computerDeck)
        })
    })

    describe('initGame integration (draw 3 at start)', () => {
        it('both players start with 3 cards after game initialization', () => {
            // Simulate what initGame does: reset, shuffle, draw 3
            let state = cardReducer(undefined, resetCards())
            state = cardReducer(state, shufflePlayerDeck())
            state = cardReducer(state, shuffleCpuDeck())
            state = cardReducer(state, playerDrawCards(3))
            state = cardReducer(state, cpuDrawCards(3))

            expect(state.playerHand).toHaveLength(3)
            expect(state.computerHand).toHaveLength(3)
            expect(state.playerDeck).toHaveLength(cardsData.length - 3)
            expect(state.computerDeck).toHaveLength(cardsData.length - 3)
        })
    })
})
