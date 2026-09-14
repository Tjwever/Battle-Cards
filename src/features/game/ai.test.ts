import { smartStrategy, greedyStrategy, type AiContext } from './ai'
import { runSimulations } from '../../sim/engine'
import { createRng } from './rng'
import { getDeck } from '../../app/decks'
import cardsData from '../../app/cardsData'
import type { Card } from '../cards/cardSlice'

function card(o: Partial<Card>): Card {
    return {
        id: Math.floor(Math.random() * 1e9),
        name: 'x',
        action_type: 'Attack',
        effect: 'attack',
        amount: 1,
        description: '',
        art: 'a.png',
        attack: 1,
        defense: 0,
        action_points: 1,
        ...o,
    }
}

const attack = (amt: number, ap = amt) =>
    card({ action_type: 'Attack', effect: 'attack', amount: amt, attack: amt, action_points: ap })
const defense = (amt: number, ap = amt) =>
    card({ action_type: 'Defense', effect: 'defense', amount: amt, defense: amt, attack: 0, action_points: ap })
const heal = (amt: number, ap = 2) =>
    card({ action_type: 'Heal', effect: 'heal', amount: amt, attack: 0, defense: 0, action_points: ap })
const apBuff = () =>
    card({ action_type: 'Buff', effect: 'apBuff', amount: 1, attack: 0, defense: 0, action_points: 0 })

const ctx = (hand: Card[], ap: number, selfHealth: number): AiContext => ({
    hand,
    ap,
    selfHealth,
    opponentHealth: 10,
    maxHealth: 10,
})

describe('smartStrategy', () => {
    it('always plays free AP buffs (cost 0)', () => {
        const buff = apBuff()
        const chosen = smartStrategy(ctx([buff, attack(3, 3)], 2, 10))
        expect(chosen).toContain(buff)
    })

    it('heals when health is low and a heal is available', () => {
        const h = heal(5)
        const chosen = smartStrategy(ctx([h, attack(2, 2)], 2, 3))
        expect(chosen).toContain(h)
    })

    it('does not heal at full health (no overheal)', () => {
        const h = heal(5)
        const chosen = smartStrategy(ctx([h, attack(2, 2)], 2, 10))
        expect(chosen).not.toContain(h)
    })

    it('prefers defense when threatened (low health)', () => {
        const d = defense(3, 2)
        const a = attack(2, 2)
        const chosen = smartStrategy(ctx([d, a], 2, 3))
        expect(chosen).toContain(d)
    })

    it('never returns an unaffordable selection', () => {
        const chosen = smartStrategy(ctx([attack(3, 3), attack(2, 2)], 2, 10))
        const cost = chosen.reduce(
            (s, c) => s + (c.effect === 'apBuff' ? 0 : c.action_points),
            0
        )
        expect(cost).toBeLessThanOrEqual(2)
    })

    it('does not pick a lone attack buff (which would do nothing)', () => {
        const ab = card({
            action_type: 'Buff',
            effect: 'attackBuff',
            amount: 2,
            attack: 2,
            defense: 0,
            action_points: 2,
        })
        const chosen = smartStrategy(ctx([ab], 2, 10))
        expect(chosen).not.toContain(ab)
    })
})

describe('smart vs greedy (harness)', () => {
    it('smart beats greedy on the mixed deck (>55%)', () => {
        const stats = runSimulations(
            cardsData,
            cardsData,
            600,
            (i) => createRng(4000 + i),
            smartStrategy,
            greedyStrategy
        )
        // Among decisive games, smart should clearly win the majority.
        const decisive = stats.aWins + stats.bWins
        expect(stats.aWins / decisive).toBeGreaterThan(0.55)
    })

    it('smart makes the defensive Ice deck competitive vs greedy Ice', () => {
        const stats = runSimulations(
            getDeck('ice'),
            getDeck('ice'),
            400,
            (i) => createRng(9000 + i),
            smartStrategy,
            greedyStrategy
        )
        const decisive = stats.aWins + stats.bWins
        expect(stats.aWins / decisive).toBeGreaterThan(0.55)
    })
})
