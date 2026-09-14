import type { Card, CardEffect } from '../cards/cardSlice'

export interface CombatResult {
    playerDamage: number
    cpuDamage: number
    playerHeal: number
    cpuHeal: number
    playerAPGain: number
    cpuAPGain: number
    log: string[]
}

/**
 * True when a card's effect is an action-point buff (grants AP rather than
 * modifying attack or defense). Classified by explicit metadata, never by stats.
 */
export function isApBuff(card: Card): boolean {
    return card.effect === 'apBuff'
}

/**
 * The AP cost to play a card. AP-buff cards are free (cost 0); everything else
 * costs its action_points. Single source of truth for the "AP buffs cost 0"
 * rule — reused by the player hand, the CPU AI, and round resolution.
 */
export function apCostOf(card: Card): number {
    return isApBuff(card) ? 0 : card.action_points
}

/**
 * Greedy CPU card selection: play as many cards as available AP allows,
 * cheapest first. AP-buff cards cost 0 AP.
 */
export function cpuSelectCards(hand: Card[], availableAP: number): Card[] {
    const sorted = [...hand].sort(
        (a, b) => a.action_points - b.action_points
    )
    const selected: Card[] = []
    let apLeft = availableAP

    for (const card of sorted) {
        const cost = apCostOf(card)
        if (cost <= apLeft) {
            selected.push(card)
            apLeft -= cost
        }
    }

    return selected
}

/**
 * Pure combat resolution for a single round. Given the cards each side played,
 * returns the damage, healing, AP gains and a human-readable battle log. Does
 * not mutate state — callers dispatch the results.
 */
export function resolveCombat(
    playerCards: Card[],
    cpuCards: Card[]
): CombatResult {
    const log: string[] = []

    const playerAttacks = playerCards.filter((c) => c.action_type === 'Attack')
    const playerDefenses = playerCards.filter(
        (c) => c.action_type === 'Defense'
    )
    const playerBuffs = playerCards.filter((c) => c.action_type === 'Buff')
    const playerHeals = playerCards.filter((c) => c.action_type === 'Heal')

    const cpuAttacks = cpuCards.filter((c) => c.action_type === 'Attack')
    const cpuDefenses = cpuCards.filter((c) => c.action_type === 'Defense')
    const cpuBuffs = cpuCards.filter((c) => c.action_type === 'Buff')
    const cpuHeals = cpuCards.filter((c) => c.action_type === 'Heal')

    // Buffs modify a matching played card. A lone buff — an attack or defense
    // buff with no matching Attack / Defense card played that round — has no
    // combat effect, per the game rules. AP buffs always grant AP.
    const sumByEffect = (cards: Card[], effect: CardEffect): number =>
        cards
            .filter((c) => c.effect === effect)
            .reduce((sum, c) => sum + c.amount, 0)

    const countByEffect = (cards: Card[], effect: CardEffect): number =>
        cards.filter((c) => c.effect === effect).length

    const playerAttackBuff =
        playerAttacks.length > 0 ? sumByEffect(playerBuffs, 'attackBuff') : 0
    const playerDefenseBuff =
        playerDefenses.length > 0 ? sumByEffect(playerBuffs, 'defenseBuff') : 0
    const playerAPGain = countByEffect(playerBuffs, 'apBuff')

    if (playerAttackBuff > 0) {
        log.push(`Player buff: +${playerAttackBuff} attack power`)
    }
    if (playerDefenseBuff > 0) {
        log.push(`Player buff: +${playerDefenseBuff} defense power`)
    }
    for (let i = 0; i < playerAPGain; i++) {
        log.push(`Player gains +1 AP for next round`)
    }

    const cpuAttackBuff =
        cpuAttacks.length > 0 ? sumByEffect(cpuBuffs, 'attackBuff') : 0
    const cpuDefenseBuff =
        cpuDefenses.length > 0 ? sumByEffect(cpuBuffs, 'defenseBuff') : 0
    const cpuAPGain = countByEffect(cpuBuffs, 'apBuff')

    if (cpuAttackBuff > 0) {
        log.push(`CPU buff: +${cpuAttackBuff} attack power`)
    }
    if (cpuDefenseBuff > 0) {
        log.push(`CPU buff: +${cpuDefenseBuff} defense power`)
    }
    for (let i = 0; i < cpuAPGain; i++) {
        log.push(`CPU gains +1 AP for next round`)
    }

    let totalPlayerAttack = playerAttacks.reduce((sum, c) => sum + c.attack, 0)
    totalPlayerAttack += playerAttackBuff

    let totalCpuDefense = cpuDefenses.reduce((sum, c) => sum + c.defense, 0)
    totalCpuDefense += cpuDefenseBuff

    let cpuDamage = 0
    if (totalPlayerAttack > 0) {
        if (totalCpuDefense > 0) {
            const blocked = Math.min(totalPlayerAttack, totalCpuDefense)
            log.push(
                `Player attacks for ${totalPlayerAttack}, CPU blocks ${blocked}`
            )
            cpuDamage = Math.max(totalPlayerAttack - totalCpuDefense, 0)
        } else {
            cpuDamage = totalPlayerAttack
            log.push(`Player attacks for ${totalPlayerAttack} — no CPU defense!`)
        }
    }

    let totalCpuAttack = cpuAttacks.reduce((sum, c) => sum + c.attack, 0)
    totalCpuAttack += cpuAttackBuff

    let totalPlayerDefense = playerDefenses.reduce(
        (sum, c) => sum + c.defense,
        0
    )
    totalPlayerDefense += playerDefenseBuff

    let playerDamage = 0
    if (totalCpuAttack > 0) {
        if (totalPlayerDefense > 0) {
            const blocked = Math.min(totalCpuAttack, totalPlayerDefense)
            log.push(
                `CPU attacks for ${totalCpuAttack}, Player blocks ${blocked}`
            )
            playerDamage = Math.max(totalCpuAttack - totalPlayerDefense, 0)
        } else {
            playerDamage = totalCpuAttack
            log.push(`CPU attacks for ${totalCpuAttack} — no Player defense!`)
        }
    }

    if (cpuDamage > 0) log.push(`CPU takes ${cpuDamage} damage`)
    if (playerDamage > 0) log.push(`Player takes ${playerDamage} damage`)

    // Heal amount comes straight from explicit card metadata. The health cap
    // is enforced by the player slice when the heal is applied.
    const playerHeal = playerHeals.reduce((sum, c) => sum + c.amount, 0)
    const cpuHeal = cpuHeals.reduce((sum, c) => sum + c.amount, 0)

    if (playerHeal > 0) log.push(`Player heals ${playerHeal} HP`)
    if (cpuHeal > 0) log.push(`CPU heals ${cpuHeal} HP`)

    if (
        playerAttacks.length === 0 &&
        cpuAttacks.length === 0 &&
        playerHeals.length === 0 &&
        cpuHeals.length === 0 &&
        playerBuffs.length === 0 &&
        cpuBuffs.length === 0 &&
        playerDefenses.length === 0 &&
        cpuDefenses.length === 0
    ) {
        log.push('Neither side played any cards')
    }

    return {
        playerDamage,
        cpuDamage,
        playerHeal,
        cpuHeal,
        playerAPGain,
        cpuAPGain,
        log,
    }
}
