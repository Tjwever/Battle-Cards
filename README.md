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
- [x] **Redux store** — configured with player, card, game, and counter slices
- [x] **Player health state** — both player and CPU start at 10, with increment/decrement actions; health capped at 10
- [x] **Deck state** — `playerDeck`, `computerDeck`, `playerHand`, `computerHand`, `playerCardsPlayed`, `computerCardsPlayed`, `playerDiscardPile`, `computerDiscardPile`
- [x] **Deck shuffle** — Fisher-Yates shuffle for both player and CPU decks
- [x] **Game board layout** — Start screen, game board with Deck/Discard spots, health display, round indicator, battle log, game over screen
- [x] **Card component** — renders name, art, description, ATK/DEF/AP stats, and card type
- [x] **PlayerDeck / ComputerDeck** — shuffle on mount and display all cards
- [x] **CI pipeline** — GitHub Actions workflow runs type-check and tests on PRs to master
- [x] **Player Hand** — draw cards from Deck to Hand (max 5), `PlayerHand` component with clickable cards
- [x] **Play cards from hand** — select and play cards from hand using AP; cards move to Cards Played zone
- [x] **Action Points in state** — Redux-managed AP for both player and CPU; AP Buff cards cost 0 AP; pending AP applies next round
- [x] **Turn / round resolution** — simultaneous play and reveal; CPU plays cards when Turn button is pressed
- [x] **Combat resolution** — Attack targets Defense first, overflow hits health; buffs add to attack/defense power
- [x] **Health cap at 10** — `incrementHealth` clamps to max 10
- [x] **Game over condition** — checks for health reaching 0 after each round; declares winner
- [x] **Discard → Deck reshuffle** — when Deck is empty during draw, Discard Pile reshuffles back into Deck
- [x] **CPU AI** — greedy card selection: sorts by cost, plays as many cards as AP allows
- [x] **Start game flow** — shuffles decks, deals 3 cards to each player, sets 2 AP, restricts first-round draws
- [x] **Buff card logic** — attack buffs add to total attack, defense buffs add to total defense, AP buffs grant +1 AP next round
- [x] **Heal card logic** — heals parsed from card description, applied with health cap
- [x] **Game slice** — `gameSlice.ts` manages game phases (idle, starting, playerTurn, resolving, roundEnd, gameOver), round counter, winner, and battle log
- [x] **Battle log** — `RoundLog` component displays combat results after each round

### Not Yet Implemented

- [ ] **Face-down / reveal mechanic** — cards are currently revealed immediately; spec calls for hidden play until Turn button
- [ ] **Player Discard component** — `PlayerDiscard.tsx` exists but is empty; discard pile contents not viewable in UI

### Logic Needed (per spec)

- [x] ~~Shuffle method for randomizing deck~~ (implemented in `cardSlice.ts`)
- [x] ~~Method for randomizing cards in the Deck~~ (implemented in `cardSlice.ts`)
- [x] ~~Method for drawing cards from Deck to Hand~~ (`playerDrawCards` / `cpuDrawCards` in `cardSlice.ts`)
- [x] ~~Method for selecting and playing cards from Hand to Cards Played~~ (`playerPlayCard` / `cpuPlayCard` in `cardSlice.ts`)
- [x] ~~Method to reshuffle Discard Pile back into Deck when Deck is empty~~ (auto-reshuffle in draw actions)
- [x] ~~Turn button logic: compare Player's Cards Played vs CPU's Cards Played, calculate damage~~ (`resolveCombat` in `gameThunks.ts`)

## Future Ideas

- Elemental deck selection: Fire, Lightning, Ice, etc.

## Tech Stack

- [React](https://react.dev/) — UI framework
- [Redux Toolkit](https://redux-toolkit.js.org/) — state management
- [TypeScript](https://www.typescriptlang.org/) — type safety
- [Vite](https://vitejs.dev/) — build tool & dev server
- [Vitest](https://vitest.dev/) — testing framework
- [GitHub Actions](https://docs.github.com/en/actions) — CI pipeline
