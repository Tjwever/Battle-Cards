import type { Card } from '../features/cards/cardSlice'
import { resolveCombat, apCostOf, cpuSelectCards } from '../features/game/combat'
import { drawCards } from '../features/game/deckOps'
import { shuffle, type Rng } from '../features/game/rng'
import {
    MAX_HEALTH,
    STARTING_AP,
    INITIAL_DRAW_COUNT,
    MAX_HAND_SIZE,
} from '../app/gameConfig'

/**
 * A CPU/AI strategy: given the current hand and available AP, choose which
 * cards to commit this round. Must only return an affordable subset.
 */
export type AiStrategy = (hand: Card[], ap: number) => Card[]

/** Baseline greedy strategy (cheapest-first) — reuses the game's cpuSelectCards. */
export const greedyAi: AiStrategy = (hand, ap) => cpuSelectCards(hand, ap)

interface SimPlayer {
    health: number
    ap: number
    pendingAP: number
    deck: Card[]
    discard: Card[]
    hand: Card[]
}

export type SimWinner = 'A' | 'B' | 'draw'

export interface SimResult {
    winner: SimWinner
    rounds: number
    /** Count of each card (by name) played across the whole game, both sides. */
    cardsPlayed: Record<string, number>
}

function initPlayer(deck: Card[], rng: Rng): SimPlayer {
    const shuffled = shuffle(deck, rng)
    const drawn = drawCards(
        { deck: shuffled, discard: [], hand: [] },
        INITIAL_DRAW_COUNT,
        rng
    )
    return { health: MAX_HEALTH, ap: STARTING_AP, pendingAP: 0, ...drawn }
}

/** Remove the AI's chosen cards from hand, spend AP, and return what was played. */
function commit(player: SimPlayer, selected: Card[]): Card[] {
    const played: Card[] = []
    for (const card of selected) {
        const idx = player.hand.findIndex((c) => c.id === card.id)
        if (idx === -1) continue
        player.hand.splice(idx, 1)
        player.ap = Math.max(0, player.ap - apCostOf(card))
        played.push(card)
    }
    return played
}

function upkeep(player: SimPlayer, played: Card[], rng: Rng): void {
    player.discard.push(...played)
    player.ap = Math.max(0, player.ap + player.pendingAP)
    player.pendingAP = 0
    const drawn = drawCards(
        { deck: player.deck, discard: player.discard, hand: player.hand },
        MAX_HAND_SIZE - player.hand.length,
        rng
    )
    player.deck = drawn.deck
    player.discard = drawn.discard
    player.hand = drawn.hand
}

/**
 * Simulate one full headless game between two decks/strategies. Deterministic
 * for a given `rng`. Mirrors the live rules: damage floored at 0 then heal
 * capped at MAX_HEALTH (a heal can save a lethal hit in the same round),
 * pending AP applied next round, and the double-KO tiebreaker awards B (matching
 * the live "both eliminated -> CPU wins").
 */
export function simulateGame(
    deckA: Card[],
    deckB: Card[],
    aiA: AiStrategy = greedyAi,
    aiB: AiStrategy = greedyAi,
    rng: Rng = Math.random,
    maxRounds = 300
): SimResult {
    const A = initPlayer(deckA, rng)
    const B = initPlayer(deckB, rng)
    const cardsPlayed: Record<string, number> = {}
    const tally = (cards: Card[]) => {
        for (const c of cards) cardsPlayed[c.name] = (cardsPlayed[c.name] ?? 0) + 1
    }

    let round = 0
    while (round < maxRounds) {
        round++

        const playedA = commit(A, aiA(A.hand, A.ap))
        const playedB = commit(B, aiB(B.hand, B.ap))
        tally(playedA)
        tally(playedB)

        const r = resolveCombat(playedA, playedB)
        // resolveCombat: cpuDamage/cpuHeal -> side B; playerDamage/playerHeal -> side A
        B.health = Math.max(0, B.health - r.cpuDamage)
        B.health = Math.min(MAX_HEALTH, B.health + r.cpuHeal)
        A.health = Math.max(0, A.health - r.playerDamage)
        A.health = Math.min(MAX_HEALTH, A.health + r.playerHeal)
        A.pendingAP += r.playerAPGain - r.playerAPLoss
        B.pendingAP += r.cpuAPGain - r.cpuAPLoss

        if (A.health <= 0 || B.health <= 0) {
            if (A.health <= 0 && B.health <= 0)
                return { winner: 'B', rounds: round, cardsPlayed }
            return {
                winner: A.health <= 0 ? 'B' : 'A',
                rounds: round,
                cardsPlayed,
            }
        }

        upkeep(A, playedA, rng)
        upkeep(B, playedB, rng)
    }

    if (A.health === B.health) return { winner: 'draw', rounds: round, cardsPlayed }
    return { winner: A.health > B.health ? 'A' : 'B', rounds: round, cardsPlayed }
}

export interface SimStats {
    games: number
    aWins: number
    bWins: number
    draws: number
    aWinRate: number
    bWinRate: number
    drawRate: number
    avgRounds: number
    cardsPlayed: Record<string, number>
}

/**
 * Run many games (seed varied per game for independence) and aggregate stats.
 */
export function runSimulations(
    deckA: Card[],
    deckB: Card[],
    games: number,
    makeRng: (gameIndex: number) => Rng,
    aiA: AiStrategy = greedyAi,
    aiB: AiStrategy = greedyAi
): SimStats {
    let aWins = 0
    let bWins = 0
    let draws = 0
    let totalRounds = 0
    const cardsPlayed: Record<string, number> = {}

    for (let i = 0; i < games; i++) {
        const res = simulateGame(deckA, deckB, aiA, aiB, makeRng(i))
        if (res.winner === 'A') aWins++
        else if (res.winner === 'B') bWins++
        else draws++
        totalRounds += res.rounds
        for (const [name, n] of Object.entries(res.cardsPlayed)) {
            cardsPlayed[name] = (cardsPlayed[name] ?? 0) + n
        }
    }

    return {
        games,
        aWins,
        bWins,
        draws,
        aWinRate: aWins / games,
        bWinRate: bWins / games,
        drawRate: draws / games,
        avgRounds: totalRounds / games,
        cardsPlayed,
    }
}
