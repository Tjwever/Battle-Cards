import type { Card } from '../cards/cardSlice'
import { apCostOf, cpuSelectCards } from './combat'

/**
 * Context a strategy sees when choosing cards. Cards are committed face-down,
 * so a strategy cannot see the opponent's played cards — only public state
 * (health totals) and its own hand/AP.
 */
export interface AiContext {
    hand: Card[]
    ap: number
    selfHealth: number
    opponentHealth: number
    maxHealth: number
}

export type AiStrategy = (ctx: AiContext) => Card[]

export type Difficulty = 'greedy' | 'smart'

/** Baseline: cheapest-first, play as much as AP allows. */
export const greedyStrategy: AiStrategy = ({ hand, ap }) =>
    cpuSelectCards(hand, ap)

const sumAmount = (cards: Card[], effect: Card['effect']): number =>
    cards.filter((c) => c.effect === effect).reduce((s, c) => s + c.amount, 0)

/**
 * Score a candidate selection from the acting side's perspective, weighting by
 * how much health it has left. Mirrors the combat rules: attack/defense buffs
 * only count when a matching card is present; heals are capped at missing
 * health (no credit for overheal), so a heal at full health scores 0.
 */
function scoreSelection(sel: Card[], ctx: AiContext): number {
    // Cards are committed face-down, so defense is a blind gamble (it whiffs
    // when the opponent doesn't attack) while attack is guaranteed value.
    // The economy is a fixed per-round AP budget, so tempo matters: prefer to
    // spend AP on damage, keep some defense/heal only when health is low.
    const critical = ctx.selfHealth <= 4
    const wAtk = 1.3
    const wDef = 0.9
    const wHeal = critical ? 1.6 : ctx.selfHealth <= 7 ? 0.5 : 0
    const wApBuff = 0.5
    const wApDebuff = 0.7

    const attacks = sel.filter((c) => c.effect === 'attack')
    const defenses = sel.filter((c) => c.effect === 'defense')
    const atk =
        sumAmount(attacks, 'attack') +
        (attacks.length > 0 ? sumAmount(sel, 'attackBuff') : 0)
    const def =
        sumAmount(defenses, 'defense') +
        (defenses.length > 0 ? sumAmount(sel, 'defenseBuff') : 0)
    const heal = Math.min(
        sumAmount(sel, 'heal'),
        ctx.maxHealth - ctx.selfHealth
    )
    const apBuffCount = sel.filter((c) => c.effect === 'apBuff').length
    const apDebuff = sumAmount(sel, 'apDebuff')

    return (
        atk * wAtk +
        def * wDef +
        heal * wHeal +
        apBuffCount * wApBuff +
        apDebuff * wApDebuff
    )
}

/**
 * Smart strategy: always take free AP buffs, then brute-force the best
 * affordable subset of the remaining (payable) cards by the health-weighted
 * value function. Hands are <= 5 cards, so the subset search is tiny.
 */
export const smartStrategy: AiStrategy = (ctx) => {
    const free = ctx.hand.filter((c) => apCostOf(c) === 0)
    const payable = ctx.hand.filter((c) => apCostOf(c) > 0)

    let best: Card[] = []
    let bestScore = -Infinity

    const n = payable.length
    for (let mask = 0; mask < 1 << n; mask++) {
        const subset: Card[] = []
        let cost = 0
        for (let i = 0; i < n; i++) {
            if (mask & (1 << i)) {
                subset.push(payable[i])
                cost += apCostOf(payable[i])
            }
        }
        if (cost > ctx.ap) continue
        const score = scoreSelection([...free, ...subset], ctx)
        if (score > bestScore) {
            bestScore = score
            best = subset
        }
    }

    return [...free, ...best]
}

export const STRATEGIES: Record<Difficulty, AiStrategy> = {
    greedy: greedyStrategy,
    smart: smartStrategy,
}
