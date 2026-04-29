# Battle-Cards

Simple card game built with React, Redux (Redux Toolkit), TypeScript, and Vite. Mainly to learn Redux, but mostly because I've always wanted to create a card game, and I figure this is the perfect opportunity to do so.

## Getting Started

```bash
npm install
npm run dev
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run test` | Run tests (vitest, watch mode) |
| `npm run type-check` | Run TypeScript compiler checks |

## Rules of the Game

### Overview

- **You vs the CPU** — simultaneous play each round (Rock-Paper-Scissors style)
- Each player starts with **10 health** (cannot exceed 10; healing is capped)
- When a player's health reaches **0**, the game is over
- Health is visible to both players

### Decks & Hands

- Each player has **30–50 cards** in their Deck
- Player can hold a **maximum of 5 cards** in hand
- If the player has fewer than 5 cards, they may draw cards (as many as they want up to the 5-card limit)
- Each player has: **Hand**, **Deck**, **Discard Pile**, and **Cards Played** zones
- When a Deck runs out of cards, the Discard Pile reshuffles back into the Deck
- Neither player can see the other's Deck cards

### Card Types

| Type | Description |
|---|---|
| **Attack** | Deals 2–5 damage; targets Defense cards first, then player health if no Defense cards are in play. Attack cards have no health and cannot be attacked by other Attack cards. |
| **Defense** | Blocks 2–5 damage from Attack cards |
| **Buff** | Increases attack power, defense power, adds action points, or heals the player |

### Card Attributes

| Attribute | Type | Description |
|---|---|---|
| ID | int | Unique identifier |
| Name | string | Card name |
| Art | image | Visual for the card |
| Description | string | What the card does |
| Action Type | enum | Attack, Defense, Buff, etc. |
| Attack | int | How much attack the card offers |
| Defense | int | How much defense the card offers |
| Action Points | int | How many action points the card consumes |

### Action Points

- Players start each game with **2 Action Points (AP)**
- AP can be accumulated through Buff cards
- AP can be taken away through the opponent's Debuff cards
- Playing an AP Buff card costs **0 AP**
- When AP is zero, the player can take no more actions
- AP gained from Buff cards won't apply until the **next round**

### Start of Game

- Each player draws **3 cards** (not visible to the other player)
- Each player starts with **2 AP**
- Players **cannot draw** additional cards during the first round

### Each Round

1. Player and CPU play as many cards as they can with available AP
2. Cards are played **face down** — neither player sees the other's played cards
3. Player clicks the **Turn Button** to end the round
4. Played cards are **revealed** simultaneously
5. Damage is calculated:
   - Attack cards target Defense cards first
   - If no Defense cards are in play, Attack cards hit the player's health directly
6. All played cards go to their respective Discard Piles
7. Players may draw cards (up to the 5-card hand limit)

## Implementation Status

### Implemented

- [x] **Card data model** — `Card` interface with all required attributes (id, name, art, description, action_type, attack, defense, action_points)
- [x] **Card types** — `Attack`, `Defense`, `Buff`, `Heal` enum
- [x] **Card database** — 40 cards across all types (Light/Medium/Heavy Attack & Defense, Attack/Defense Buffs, Heals, AP Buffs)
- [x] **Redux store** — configured with player, card, and counter slices
- [x] **Player health state** — both player and CPU start at 10, with increment/decrement actions
- [x] **Deck state** — `playerDeck`, `computerDeck`, `playerCardsPlayed`, `computerCardsPlayed`, `playerDiscardPile`, `computerDiscardPile`
- [x] **Deck shuffle** — Fisher-Yates shuffle for both player and CPU decks
- [x] **Game board layout** — Deck spots, Discard Pile spots, health display, "Play Round!" button
- [x] **Card component** — renders name, art, and description
- [x] **PlayerDeck / ComputerDeck** — shuffle on mount and display all cards
- [x] **CI pipeline** — GitHub Actions workflow runs type-check and tests on PRs to master

### Not Yet Implemented

- [ ] **Player Hand** — draw cards from Deck to Hand (max 5); `PlayerHand.tsx` exists but is empty
- [ ] **Play cards from hand** — select and play cards from hand using AP
- [ ] **Action Points in state** — currently hardcoded to "2" in UI; needs Redux state management
- [ ] **Turn / round resolution** — simultaneous reveal and damage calculation
- [ ] **Combat resolution** — Attack vs Defense priority, overflow damage to health
- [ ] **Health cap at 10** — `incrementHealth` doesn't clamp to max
- [ ] **Game over condition** — no check for health reaching 0
- [ ] **Discard → Deck reshuffle** — when Deck is empty, reshuffle Discard Pile back
- [ ] **CPU AI** — computer card selection logic
- [ ] **Start game flow** — deal 3 cards, set 2 AP, restrict first-round draws
- [ ] **Buff card logic** — applying attack/defense buffs, AP buffs, debuffs
- [ ] **Face-down / reveal mechanic** — cards played hidden until Turn button is pressed
- [ ] **Game slice** — `gameSlice.ts`, `gameActions.ts`, `gameReducer.ts` exist but are empty
- [ ] **Player Discard component** — `PlayerDiscard.tsx` exists but is empty

### Logic Needed (per spec)

- [ ] Shuffle method for randomizing deck
- [x] ~~Method for randomizing cards in the Deck~~ (implemented in `cardSlice.ts`)
- [ ] Method for drawing cards from Deck to Hand
- [ ] Method for selecting and playing cards from Hand to Cards Played
- [ ] Method to reshuffle Discard Pile back into Deck when Deck is empty
- [ ] Turn button logic: compare Player's Cards Played vs CPU's Cards Played, calculate damage

## Future Ideas

- Elemental deck selection: Fire, Lightning, Ice, etc.

## Tech Stack

- [React](https://react.dev/) — UI framework
- [Redux Toolkit](https://redux-toolkit.js.org/) — state management
- [TypeScript](https://www.typescriptlang.org/) — type safety
- [Vite](https://vitejs.dev/) — build tool & dev server
- [Vitest](https://vitest.dev/) — testing framework
- [GitHub Actions](https://docs.github.com/en/actions) — CI pipeline
