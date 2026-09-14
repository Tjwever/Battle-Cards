import cardsData from './cardsData'
import type { Card, CardEffect } from '../features/cards/cardSlice'

const EFFECTS: CardEffect[] = [
    'attack',
    'defense',
    'attackBuff',
    'defenseBuff',
    'apBuff',
    'apDebuff',
    'heal',
]

describe('cardsData — data integrity', () => {
    it('has 43 cards with unique, contiguous ids 1..43', () => {
        expect(cardsData).toHaveLength(43)
        const ids = cardsData.map((c) => c.id).sort((a, b) => a - b)
        expect(ids).toEqual(Array.from({ length: 43 }, (_, i) => i + 1))
    })

    it('every card has a known effect, a positive amount, and non-negative AP', () => {
        for (const card of cardsData) {
            expect(EFFECTS).toContain(card.effect)
            expect(card.amount).toBeGreaterThan(0)
            expect(card.action_points).toBeGreaterThanOrEqual(0)
        }
    })

    const byEffect = (effect: CardEffect): Card[] =>
        cardsData.filter((c) => c.effect === effect)

    it('attack cards: Attack type, amount === attack, no defense', () => {
        for (const c of byEffect('attack')) {
            expect(c.action_type).toBe('Attack')
            expect(c.attack).toBeGreaterThan(0)
            expect(c.defense).toBe(0)
            expect(c.amount).toBe(c.attack)
            expect(c.action_points).toBeGreaterThan(0)
        }
    })

    it('defense cards: Defense type, amount === defense, no attack', () => {
        for (const c of byEffect('defense')) {
            expect(c.action_type).toBe('Defense')
            expect(c.defense).toBeGreaterThan(0)
            expect(c.attack).toBe(0)
            expect(c.amount).toBe(c.defense)
            expect(c.action_points).toBeGreaterThan(0)
        }
    })

    it('attack buffs: Buff type, amount === attack, no defense', () => {
        for (const c of byEffect('attackBuff')) {
            expect(c.action_type).toBe('Buff')
            expect(c.attack).toBeGreaterThan(0)
            expect(c.defense).toBe(0)
            expect(c.amount).toBe(c.attack)
        }
    })

    it('defense buffs: Buff type, amount === defense, no attack', () => {
        for (const c of byEffect('defenseBuff')) {
            expect(c.action_type).toBe('Buff')
            expect(c.defense).toBeGreaterThan(0)
            expect(c.attack).toBe(0)
            expect(c.amount).toBe(c.defense)
        }
    })

    it('ap buffs: Buff type, cost 0 AP, no attack/defense, grants 1', () => {
        for (const c of byEffect('apBuff')) {
            expect(c.action_type).toBe('Buff')
            expect(c.attack).toBe(0)
            expect(c.defense).toBe(0)
            expect(c.action_points).toBe(0)
            expect(c.amount).toBe(1)
        }
    })

    it('ap debuffs: Debuff type, positive amount, cost AP, no attack/defense', () => {
        const debuffs = byEffect('apDebuff')
        expect(debuffs.length).toBeGreaterThan(0)
        for (const c of debuffs) {
            expect(c.action_type).toBe('Debuff')
            expect(c.attack).toBe(0)
            expect(c.defense).toBe(0)
            expect(c.amount).toBeGreaterThan(0)
            expect(c.action_points).toBeGreaterThan(0)
        }
    })

    it('heals: Heal type, no attack/defense, amount matches description text', () => {
        for (const c of byEffect('heal')) {
            expect(c.action_type).toBe('Heal')
            expect(c.attack).toBe(0)
            expect(c.defense).toBe(0)
            const match = c.description.match(/Adds (\d+) to Players Health/)
            expect(match).not.toBeNull()
            expect(parseInt(match![1], 10)).toBe(c.amount)
        }
    })

    it('card id 29 blocks 2 (regression guard for the id-29 data fix)', () => {
        const card = cardsData.find((c) => c.id === 29)!
        expect(card.effect).toBe('defenseBuff')
        expect(card.defense).toBe(2)
        expect(card.amount).toBe(2)
        expect(card.description).toContain('Adds 2 block')
    })
})
