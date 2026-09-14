import { createRng, shuffle } from '../features/game/rng'
import { drawCards } from '../features/game/deckOps'
import { simulateGame, runSimulations, greedyAi } from './engine'
import cardsData from '../app/cardsData'
import type { Card } from '../features/cards/cardSlice'

function makeCard(overrides: Partial<Card> = {}): Card {
    return {
        id: 1,
        name: 'Test',
        action_type: 'Attack',
        effect: 'attack',
        amount: 1,
        description: 'test',
        art: 'test.png',
        attack: 1,
        defense: 0,
        action_points: 1,
        ...overrides,
    }
}

describe('rng', () => {
    it('is deterministic: same seed -> same sequence', () => {
        const a = createRng(42)
        const b = createRng(42)
        const seqA = [a(), a(), a(), a()]
        const seqB = [b(), b(), b(), b()]
        expect(seqA).toEqual(seqB)
    })

    it('different seeds -> different sequences', () => {
        const a = createRng(1)
        const b = createRng(2)
        expect(a()).not.toBe(b())
    })

    it('produces values in [0, 1)', () => {
        const r = createRng(7)
        for (let i = 0; i < 100; i++) {
            const v = r()
            expect(v).toBeGreaterThanOrEqual(0)
            expect(v).toBeLessThan(1)
        }
    })

    it('shuffle with a fixed seed is reproducible and preserves elements', () => {
        const input = [1, 2, 3, 4, 5, 6, 7, 8]
        const s1 = shuffle(input, createRng(99))
        const s2 = shuffle(input, createRng(99))
        expect(s1).toEqual(s2)
        expect([...s1].sort((a, b) => a - b)).toEqual(input)
        expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]) // not mutated
    })
})

describe('deckOps.drawCards', () => {
    it('draws up to the hand limit and reshuffles discard when deck empties', () => {
        const deck = [makeCard({ id: 1 })]
        const discard = [makeCard({ id: 2 }), makeCard({ id: 3 }), makeCard({ id: 4 })]
        const res = drawCards({ deck, discard, hand: [] }, 3, createRng(1))
        expect(res.hand).toHaveLength(3)
        expect(res.discard).toHaveLength(0)
        expect(res.deck).toHaveLength(1) // 4 available - 3 drawn
    })

    it('respects the 5-card hand cap', () => {
        const deck = [1, 2, 3, 4, 5, 6].map((id) => makeCard({ id }))
        const hand = [10, 11, 12].map((id) => makeCard({ id }))
        const res = drawCards({ deck, discard: [], hand }, 5)
        expect(res.hand).toHaveLength(5)
    })

    it('does not mutate inputs', () => {
        const deck = [makeCard({ id: 1 }), makeCard({ id: 2 })]
        const before = deck.length
        drawCards({ deck, discard: [], hand: [] }, 1)
        expect(deck).toHaveLength(before)
    })
})

describe('sim engine', () => {
    it('simulateGame is deterministic for a fixed seed', () => {
        const r1 = simulateGame(cardsData, cardsData, greedyAi, greedyAi, createRng(2024))
        const r2 = simulateGame(cardsData, cardsData, greedyAi, greedyAi, createRng(2024))
        expect(r1).toEqual(r2)
    })

    it('produces a valid winner and a bounded round count', () => {
        const res = simulateGame(cardsData, cardsData, greedyAi, greedyAi, createRng(5))
        expect(['A', 'B', 'draw']).toContain(res.winner)
        expect(res.rounds).toBeGreaterThan(0)
        expect(res.rounds).toBeLessThanOrEqual(300)
    })

    it('runSimulations aggregates consistent stats (rates sum to 1)', () => {
        const stats = runSimulations(
            cardsData,
            cardsData,
            200,
            (i) => createRng(1000 + i)
        )
        expect(stats.games).toBe(200)
        expect(stats.aWins + stats.bWins + stats.draws).toBe(200)
        expect(stats.aWinRate + stats.bWinRate + stats.drawRate).toBeCloseTo(1, 5)
        expect(stats.avgRounds).toBeGreaterThan(0)
    })

    it('mirror match (identical decks + AI) is roughly balanced', () => {
        const stats = runSimulations(
            cardsData,
            cardsData,
            400,
            (i) => createRng(50 + i)
        )
        // Neither side should dominate a true mirror; allow generous margin.
        expect(stats.aWinRate).toBeGreaterThan(0.3)
        expect(stats.aWinRate).toBeLessThan(0.7)
    })
})
