# Battle-Cards Feature Development — Full QA Report

- Date: 2026-09-14
- Scope: full (all 8 epics)
- Branch: feat/feature-dev (off chore/audit-hardening)
- Node: 20.20.2

## Environment limitation (stated)

No browser-automation MCP is configured, so the QA protocol's real-browser
render gate cannot literally run. Strongest available equivalents used: a jsdom
**integration suite** that renders the real `<App/>` and drives the full flow, plus
a **production served-asset** check (build + preview + curl). Visual/pixel
verification was not performed. Non-UI epics (E2 harness) are verified by their
own tests per the QA steering carve-out.

## Gates (all green, Node 20.20.2)

| Gate | Result |
|---|---|
| `npm run lint` | 0 errors, 0 warnings |
| `npm run type-check` | clean |
| `npm test -- --run` | 126 passed / 126 (15 files) |
| `npm run build` | success |
| `npm run preview` + curl | index 200; card art 200 `image/png` |
| `npm run sim` | runs; prints balance stats + `--matrix` deck grid |

## Per-epic verdicts (WORKS + MATCHES INTENT)

| Epic | Intent | Observed | WORKS | MATCHES INTENT |
|---|---|---|---|---|
| E1 face-down/reveal | Cards committed hidden; reveal simultaneously on Turn | CPU commits face-down (CardBack) at turn start; Reveal flips + resolves; gameThunks + integration tests | yes | yes |
| E2 sim harness | Seedable RNG + pure engine + `npm run sim` | rng deterministic; simulateGame/runSimulations reuse combat; sim prints win%/rounds/usage; 11 engine tests | yes | yes |
| E3 debuffs | AP-steal reduces opponent AP next round | apDebuff effect + AP Drain cards; combat AP loss; net pending, floored at 0; harness shows no domination | yes | yes |
| E4 themed decks | Fire/Ice/Lightning, selectable, seeded, matrix | 3× 30-card integrity-checked decks; deck-select screen; initGame seeds; `--matrix` report; tuned | yes | yes |
| E5 smart AI | Pluggable; smart beats greedy >55% | AiStrategy + greedy/smart; harness proves smart>greedy on mixed deck and Ice; wired via difficulty (default smart) + toggle | yes | yes |
| E6 discard viewer | Inspect discard piles | DiscardViewer modal (cards/empty/close); clickable accessible CardSpot; component + integration tests | yes | yes |
| E7 persistence | localStorage resume + win-loss + deck pref | versioned save/load + throttle; store hydrates via preloadedState; stats slice; record shown; 8 tests | yes | yes |
| E8 animations | Draw/placement, reveal flip, damage shake | CSS keyframes (entrance, flip, shake+flash) + reduced-motion; useHealthHit hook; both health displays shake | yes | yes |

## Integration render-path (jsdom) — 8 tests, all pass

Start screen (record + difficulty toggle), deck selection seeds the game
(Lightning ids 300+), CPU commits face-down, reveal → battle log + Continue,
play a card spends AP, open the CPU discard viewer after a round.

## Balance notes (from the harness)

- Post-tune deck matrix under greedy AI: Lightning no longer dominates
  (was 73–78% vs 38–57%). Ice underperforms **under greedy AI** because greedy
  cannot time blocks/heals; under smart AI (E5) smart-Ice beats greedy-Ice
  >55%, confirming the deck is viable when played correctly. This is an
  AI-evaluation property, not a deck-design dominance.

## Over/under-delivery check

No scope drift. Difficulty toggle (E5) and mid-game resume (E7) were delivered
though the plan marked them optional/implicit. One deck-description tweak from
the prior mission remained reverted (out of scope). No plan item descoped.

## Result

Full functional QA PASS within environment constraints. Visual browser render
not executed (no MCP); compensated by the jsdom integration suite and the
production served-asset check.
