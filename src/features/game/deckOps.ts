import type { Card } from '../cards/cardSlice'
import { shuffle, type Rng } from './rng'
import { MAX_HAND_SIZE } from '../../app/gameConfig'

export interface DrawZone {
    deck: Card[]
    discard: Card[]
    hand: Card[]
}

/**
 * Pure draw: move up to `count` cards from deck to hand, respecting the hand
 * limit and reshuffling the discard pile into the deck when the deck empties.
 * Returns new arrays; does not mutate the input. Single source of truth for the
 * draw/reshuffle rule, shared by the card slice (live game) and the simulation
 * harness (headless).
 */
export function drawCards(
    zone: DrawZone,
    count: number,
    rng: Rng = Math.random,
    maxHand: number = MAX_HAND_SIZE
): DrawZone {
    let deck = zone.deck.slice()
    let discard = zone.discard.slice()
    const hand = zone.hand.slice()

    const capacity = maxHand - hand.length
    const toDraw = Math.max(0, Math.min(count, capacity))

    for (let i = 0; i < toDraw; i++) {
        if (deck.length === 0) {
            if (discard.length === 0) break
            deck = shuffle(discard, rng)
            discard = []
        }
        const card = deck.shift()
        if (card) hand.push(card)
    }

    return { deck, discard, hand }
}
