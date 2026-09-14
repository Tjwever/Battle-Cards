import { DECKS, DECK_LIST, DECK_IDS, getDeck } from './decks'
import type { Card } from '../features/cards/cardSlice'

function assertConsistent(card: Card) {
    expect(card.amount).toBeGreaterThan(0)
    expect(card.action_points).toBeGreaterThanOrEqual(0)
    switch (card.effect) {
        case 'attack':
            expect(card.action_type).toBe('Attack')
            expect(card.amount).toBe(card.attack)
            expect(card.defense).toBe(0)
            break
        case 'defense':
            expect(card.action_type).toBe('Defense')
            expect(card.amount).toBe(card.defense)
            expect(card.attack).toBe(0)
            break
        case 'attackBuff':
            expect(card.action_type).toBe('Buff')
            expect(card.amount).toBe(card.attack)
            break
        case 'defenseBuff':
            expect(card.action_type).toBe('Buff')
            expect(card.amount).toBe(card.defense)
            break
        case 'apBuff':
            expect(card.action_type).toBe('Buff')
            expect(card.action_points).toBe(0)
            expect(card.amount).toBe(1)
            break
        case 'apDebuff':
            expect(card.action_type).toBe('Debuff')
            expect(card.action_points).toBeGreaterThan(0)
            break
        case 'heal':
            expect(card.action_type).toBe('Heal')
            expect(card.attack).toBe(0)
            expect(card.defense).toBe(0)
            break
    }
}

describe('themed decks', () => {
    it('exposes three decks: fire, ice, lightning', () => {
        expect(DECK_IDS).toEqual(['fire', 'ice', 'lightning'])
        expect(DECK_LIST).toHaveLength(3)
    })

    it('every deck has 30 cards with locally-unique ids', () => {
        for (const deck of DECK_LIST) {
            expect(deck.cards).toHaveLength(30)
            const ids = deck.cards.map((c) => c.id)
            expect(new Set(ids).size).toBe(30)
        }
    })

    it('ids are globally unique across all decks', () => {
        const all = DECK_LIST.flatMap((d) => d.cards.map((c) => c.id))
        expect(new Set(all).size).toBe(all.length)
    })

    it('every card in every deck has self-consistent metadata', () => {
        for (const deck of DECK_LIST) {
            for (const card of deck.cards) assertConsistent(card)
        }
    })

    it('getDeck returns a fresh copy (no shared references)', () => {
        const a = getDeck('fire')
        const b = getDeck('fire')
        expect(a).not.toBe(b)
        expect(a[0]).not.toBe(b[0])
        expect(a).toEqual(b)
    })

    it('decks have distinct playstyles', () => {
        const count = (id: keyof typeof DECKS, effect: string) =>
            DECKS[id].cards.filter((c) => c.effect === effect).length
        // Fire is the most attack-heavy
        expect(count('fire', 'attack')).toBeGreaterThan(count('ice', 'attack'))
        // Ice is the most defensive
        expect(count('ice', 'defense')).toBeGreaterThan(count('fire', 'defense'))
        // Lightning owns AP manipulation (debuffs)
        expect(count('lightning', 'apDebuff')).toBeGreaterThan(0)
        expect(count('fire', 'apDebuff')).toBe(0)
    })
})
