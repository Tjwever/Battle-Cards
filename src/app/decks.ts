import type { Card } from '../features/cards/cardSlice'

/**
 * Themed preset decks. Each deck is a distinct 30-card pool with its own
 * playstyle. Cards are built through factories that keep effect/amount/stat
 * metadata self-consistent (the same invariants the data-integrity test
 * enforces), and every card gets a globally-unique id via a per-deck offset.
 */

export type DeckId = 'fire' | 'ice' | 'lightning'

export interface DeckDef {
    id: DeckId
    name: string
    description: string
    cards: Card[]
}

type CardSpec = Omit<Card, 'id'>

const rep = <T,>(n: number, make: () => T): T[] =>
    Array.from({ length: n }, () => make())

// --- card-spec factories (metadata kept self-consistent) ---
const A = (amount: number, ap: number, name: string): CardSpec => ({
    name,
    action_type: 'Attack',
    effect: 'attack',
    amount,
    attack: amount,
    defense: 0,
    action_points: ap,
    art: 'icons8-fist-100.png',
    description: `Deal ${amount} damage`,
})
const D = (amount: number, ap: number, name: string): CardSpec => ({
    name,
    action_type: 'Defense',
    effect: 'defense',
    amount,
    attack: 0,
    defense: amount,
    action_points: ap,
    art: 'icons8-shield-90.png',
    description: `Block ${amount} damage`,
})
const AB = (amount: number, ap: number, name: string): CardSpec => ({
    name,
    action_type: 'Buff',
    effect: 'attackBuff',
    amount,
    attack: amount,
    defense: 0,
    action_points: ap,
    art: 'icons8-fist-100.png',
    description: `+${amount} attack to a played Attack card`,
})
const AP = (name: string): CardSpec => ({
    name,
    action_type: 'Buff',
    effect: 'apBuff',
    amount: 1,
    attack: 0,
    defense: 0,
    action_points: 0,
    art: 'icons8-lightning-64.png',
    description: '+1 Action Point next round',
})
const H = (amount: number, ap: number, name: string): CardSpec => ({
    name,
    action_type: 'Heal',
    effect: 'heal',
    amount,
    attack: 0,
    defense: 0,
    action_points: ap,
    art: 'icons8-medical-bag-96.png',
    description: `Heal ${amount} health`,
})
const DR = (amount: number, ap: number, name: string): CardSpec => ({
    name,
    action_type: 'Debuff',
    effect: 'apDebuff',
    amount,
    attack: 0,
    defense: 0,
    action_points: ap,
    art: 'icons8-lightning-64.png',
    description: `Drain ${amount} of the opponent's AP next round`,
})

function buildDeck(
    id: DeckId,
    name: string,
    description: string,
    idOffset: number,
    specs: CardSpec[]
): DeckDef {
    const cards = specs.map((spec, i) => ({ id: idOffset + i, ...spec }))
    return { id, name, description, cards }
}

// Fire — aggressive: lots of attacks and attack buffs, little defense.
const fire = buildDeck('fire', 'Fire', 'Aggressive — overwhelm with attacks.', 100, [
    ...rep(8, () => A(1, 1, 'Ember')),
    ...rep(6, () => A(2, 2, 'Flame Strike')),
    ...rep(3, () => A(3, 3, 'Inferno')),
    ...rep(4, () => AB(1, 2, 'Kindle')),
    ...rep(2, () => AB(2, 1, 'Blaze')),
    ...rep(3, () => D(1, 1, 'Ash Guard')),
    ...rep(2, () => H(2, 2, 'Warmth')),
    ...rep(2, () => AP('Fire Surge')),
])

// Ice — sustain midrange: unconditional healing (strong under face-down play,
// where blind blocking is weak) plus reliable damage to close.
const ice = buildDeck('ice', 'Ice', 'Sustain — outlast with heals, then close.', 200, [
    ...rep(6, () => H(2, 2, 'Chill Mend')),
    ...rep(3, () => H(5, 2, 'Frozen Renewal')),
    ...rep(9, () => A(2, 2, 'Frostbite')),
    ...rep(2, () => A(3, 3, 'Avalanche')),
    ...rep(4, () => D(2, 2, 'Ice Wall')),
    ...rep(4, () => D(1, 1, 'Frost Guard')),
    ...rep(2, () => AP('Cold Focus')),
])

// Lightning — tempo: AP acceleration and AP denial, cheap fast attacks.
const lightning = buildDeck(
    'lightning',
    'Lightning',
    'Tempo — accelerate your AP and starve theirs.',
    300,
    [
        ...rep(3, () => AP('Charge')),
        ...rep(4, () => DR(1, 2, 'Short Circuit')),
        ...rep(2, () => DR(2, 3, 'Overload')),
        ...rep(8, () => A(1, 1, 'Spark')),
        ...rep(4, () => A(2, 2, 'Chain Bolt')),
        ...rep(4, () => D(1, 1, 'Static Field')),
        ...rep(2, () => AB(2, 1, 'Amplify')),
        ...rep(3, () => H(2, 2, 'Recharge')),
    ]
)

export const DECKS: Record<DeckId, DeckDef> = { fire, ice, lightning }
export const DECK_LIST: DeckDef[] = [fire, ice, lightning]
export const DECK_IDS: DeckId[] = ['fire', 'ice', 'lightning']

/** A fresh copy of a deck's cards (never share references into the store). */
export function getDeck(id: DeckId): Card[] {
    return DECKS[id].cards.map((c) => ({ ...c }))
}
