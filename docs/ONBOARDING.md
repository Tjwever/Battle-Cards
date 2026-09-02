# Developer Onboarding Guide

Welcome to Battle-Cards — a player-vs-CPU card battle game built with React, Redux Toolkit, TypeScript, and Vite.

## Prerequisites

- **Node.js 20+** — [nodejs.org](https://nodejs.org)
- **Git** — configured with your GitHub credentials

## Initial Setup

```bash
# Clone the repository
git clone git@github.com:Tjwever/Battle-Cards.git
cd Battle-Cards

# Install dependencies
npm install --legacy-peer-deps

# Start the dev server
npm run dev
```

## About the Project

Battle-Cards is a simultaneous-play card game (Rock-Paper-Scissors style) where you play against a CPU opponent. Both players start with 10 HP, draw from a 40-card deck, and play cards each round face-down before revealing simultaneously.

### Card Types

| Type | What it does |
|------|-------------|
| **Attack** | Deals damage — targets Defense cards first, then HP |
| **Defense** | Blocks damage from Attack cards |
| **Buff** | Increases attack/defense power or adds Action Points |
| **Heal** | Restores player health (capped at 10) |

### Tech Stack

- **React 18** — functional components, hooks
- **Redux Toolkit** — state management with typed hooks
- **TypeScript** — strict mode
- **Vite** — build tool and dev server
- **Vitest** — testing framework
- **ESLint** — code quality (TypeScript + React rules)
- **CSS Modules** — component-scoped styling (dark fantasy theme)
- **GitHub Actions** — CI pipeline

## Project Structure

```
src/
├── app/           # Store config, types, hooks, card data
├── components/    # React UI components (by domain)
│   ├── Cards/     # Card, CardSpot
│   ├── Computer/  # ComputerDeck
│   ├── Game/      # GameBoard, RoundLog
│   └── Player/    # PlayerHand, PlayerStats, PlayerDeck
├── css/           # CSS Modules (dark fantasy theme)
├── features/      # Redux slices, actions, thunks
│   ├── cards/     # Card state (decks, hands, discard)
│   ├── game/      # Game flow state (phases, rounds)
│   └── player/    # Health, AP state
└── public/        # Static assets (card icons)
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run test` | Vitest (watch mode) |
| `npm run test -- --run` | Run tests once |
| `npm run type-check` | TypeScript compiler check |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |

## Code Standards

Our coding standards are documented in `.kiro/steering/review-standards.md`. Key points:

- **TypeScript strict** — no `any`, no `@ts-ignore` without justification
- **Naming** — PascalCase components, camelCase actions, snake_case card data fields
- **Redux** — typed hooks only (`useAppSelector`/`useAppDispatch`), thunks in separate files
- **Components** — functional only, CSS modules for styling
- **Testing** — new features need tests, bug fixes need regression tests

## Troubleshooting

### "peer dependency" errors on `npm install`
Use `npm install --legacy-peer-deps`. This is expected due to ESLint plugin version ranges.

### CI fails but local passes
Make sure you're using Node 20. Run `npm ci --legacy-peer-deps` locally to match CI's fresh install behavior.
