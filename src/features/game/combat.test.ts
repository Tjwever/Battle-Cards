import { resolveCombat, cpuSelectCards } from './combat'
import type { Card } from '../cards/cardSlice'

function makeCard(overrides: Partial<Card> = {}): Card {
    return {
        id: 1,
        name: 'Test',
        action_type: 'Attack',
        effect: 'attack',
        amount: 0,
        description: 'test',
        art: 'test.png',
        attack: 0,
        defense: 0,
        action_points: 1,
        ...overrides,
    }
}

const attack = (atk: number, ap = atk) =>
    makeCard({
        action_type: 'Attack',
        effect: 'attack',
        amount: atk,
        attack: atk,
        action_points: ap,
    })
const defense = (def: number, ap = def) =>
    makeCard({
        action_type: 'Defense',
        effect: 'defense',
        amount: def,
        defense: def,
        action_points: ap,
    })
const attackBuff = (amt: number) =>
    makeCard({
        action_type: 'Buff',
        effect: 'attackBuff',
        amount: amt,
        attack: amt,
        action_points: 2,
    })
const defenseBuff = (amt: number) =>
    makeCard({
        action_type: 'Buff',
        effect: 'defenseBuff',
        amount: amt,
        defense: amt,
        action_points: 2,
    })
const apBuff = () =>
    makeCard({
        action_type: 'Buff',
        effect: 'apBuff',
        amount: 1,
        attack: 0,
        defense: 0,
        action_points: 0,
    })
const apDebuff = (amt: number) =>
    makeCard({
        action_type: 'Debuff',
        effect: 'apDebuff',
        amount: amt,
        attack: 0,
        defense: 0,
        action_points: 2,
    })
const heal = (amt: number) =>
    makeCard({
        action_type: 'Heal',
        effect: 'heal',
        amount: amt,
        attack: 0,
        defense: 0,
        action_points: 2,
        description: `Adds ${amt} to Players Health`,
    })

describe('combat — resolveCombat (characterization: current behavior)', () => {
    it('deals full attack damage when the opponent has no defense', () => {
        const result = resolveCombat([attack(3)], [])
        expect(result.cpuDamage).toBe(3)
        expect(result.playerDamage).toBe(0)
    })

    it('blocks attack up to total defense, overflow hits health', () => {
        const result = resolveCombat([attack(5)], [defense(2)])
        expect(result.cpuDamage).toBe(3)
    })

    it('fully blocks when defense >= attack', () => {
        const result = resolveCombat([attack(2)], [defense(5)])
        expect(result.cpuDamage).toBe(0)
    })

    it('resolves both directions in one round', () => {
        const result = resolveCombat([attack(4)], [attack(3)])
        expect(result.cpuDamage).toBe(4)
        expect(result.playerDamage).toBe(3)
    })

    it('sums multiple attack and defense cards', () => {
        const result = resolveCombat(
            [attack(2), attack(3)],
            [defense(1), defense(1)]
        )
        expect(result.cpuDamage).toBe(3) // 5 attack - 2 defense
    })

    // README rule: a buff modifies a matching played card. A lone buff has no
    // combat effect.
    it('a lone attack buff deals no damage without an attack card', () => {
        const result = resolveCombat([attackBuff(2)], [])
        expect(result.cpuDamage).toBe(0)
    })

    it('a lone defense buff blocks nothing without a defense card', () => {
        const vsBuffOnlyDefense = resolveCombat([attack(3)], [defenseBuff(2)])
        expect(vsBuffOnlyDefense.cpuDamage).toBe(3) // buff-only defense blocks nothing
        const loneCpuBuff = resolveCombat([], [defenseBuff(2)])
        expect(loneCpuBuff.cpuDamage).toBe(0) // player played nothing
    })

    it('an attack buff adds to attack only when an attack card is played', () => {
        const result = resolveCombat([attack(2), attackBuff(2)], [])
        expect(result.cpuDamage).toBe(4) // 2 attack + 2 buff
    })

    it('a defense buff adds to block only when a defense card is played', () => {
        const result = resolveCombat([attack(5)], [defense(1), defenseBuff(2)])
        expect(result.cpuDamage).toBe(2) // 5 attack - (1 defense + 2 buff)
    })

    it('multiple attack buffs stack on top of a played attack card', () => {
        const result = resolveCombat(
            [attack(1), attackBuff(1), attackBuff(2)],
            []
        )
        expect(result.cpuDamage).toBe(4) // 1 + 1 + 2
    })

    it('AP buff grants +1 AP for next round and deals no damage', () => {
        const result = resolveCombat([apBuff()], [])
        expect(result.playerAPGain).toBe(1)
        expect(result.cpuDamage).toBe(0)
    })

    it('heal amount comes from explicit metadata (Heal=2, Heal+=5)', () => {
        const result = resolveCombat([heal(2)], [heal(5)])
        expect(result.playerHeal).toBe(2)
        expect(result.cpuHeal).toBe(5)
    })

    it('heal ignores description text and reads the amount field', () => {
        const misleading = makeCard({
            action_type: 'Heal',
            effect: 'heal',
            amount: 3,
            description: 'totally unrelated text',
        })
        const result = resolveCombat([misleading], [])
        expect(result.playerHeal).toBe(3)
    })

    it('sums multiple heal cards', () => {
        const result = resolveCombat([heal(2), heal(5)], [])
        expect(result.playerHeal).toBe(7)
    })

    it('logs "Neither side played any cards" when both are empty', () => {
        const result = resolveCombat([], [])
        expect(result.log).toContain('Neither side played any cards')
    })

    it("a player debuff drains the CPU's AP next round (standalone)", () => {
        const result = resolveCombat([apDebuff(2)], [])
        expect(result.cpuAPLoss).toBe(2)
        expect(result.playerAPLoss).toBe(0)
    })

    it("a CPU debuff drains the player's AP next round", () => {
        const result = resolveCombat([], [apDebuff(1)])
        expect(result.playerAPLoss).toBe(1)
        expect(result.cpuAPLoss).toBe(0)
    })

    it('debuffs stack and are independent of other cards played', () => {
        const result = resolveCombat([attack(2), apDebuff(1), apDebuff(2)], [])
        expect(result.cpuAPLoss).toBe(3)
        expect(result.cpuDamage).toBe(2)
    })
})

describe('combat — cpuSelectCards', () => {
    it('plays cheapest cards first within the AP budget', () => {
        const hand = [attack(3, 3), attack(1, 1), attack(2, 2)]
        const selected = cpuSelectCards(hand, 3)
        // cheapest-first: cost 1 then cost 2 = 3 AP used
        expect(selected.map((c) => c.action_points)).toEqual([1, 2])
    })

    it('treats AP buffs (0/0 Buff) as free to play', () => {
        const hand = [apBuff(), attack(2, 2)]
        const selected = cpuSelectCards(hand, 2)
        expect(selected).toHaveLength(2)
    })

    it('selects nothing when nothing is affordable', () => {
        const hand = [attack(3, 3)]
        const selected = cpuSelectCards(hand, 2)
        expect(selected).toHaveLength(0)
    })

    it('does not mutate the input hand', () => {
        const hand = [attack(3, 3), attack(1, 1)]
        const before = hand.map((c) => c.action_points)
        cpuSelectCards(hand, 5)
        expect(hand.map((c) => c.action_points)).toEqual(before)
    })
})
