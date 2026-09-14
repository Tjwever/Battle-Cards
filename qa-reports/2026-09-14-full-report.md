# Battle-Cards Audit & Hardening — Full QA Report

- Date: 2026-09-14
- Scope: full (all 8 phases of the audit-hardening mission)
- Branch: chore/audit-hardening (off master)
- Node: 20.20.2 · install: `npm ci --legacy-peer-deps` (or bare `npm install` via `.npmrc`)

## Environment limitation (stated, not hidden)

No browser-automation MCP server is configured in this environment, so the QA
protocol's real-browser render gate cannot be literally executed. This is a
code-only / logic hardening mission (refactor, unit tests, dead-code removal,
data/logic fixes, build-path fix); per the QA steering carve-out, code-only work
is verified by its own tests rather than a product render registry. The one
genuinely rendered-surface change (card asset path) was verified against the
**production build** by serving the built assets and confirming HTTP 200 +
`image/png`. The full app render path is exercised at the DOM level via a jsdom
**integration test** that starts a game and plays a round. Visual/pixel
verification was not possible; everything else was verified functionally.

## Commands (all green on Node 20.20.2)

| Gate | Result |
|---|---|
| `npm run lint` | 0 errors, 0 warnings |
| `npm run type-check` (`tsc`) | clean |
| `npm test -- --run` | 73 passed / 73 (7 files) |
| `npm run build` (`tsc && vite build`) | success; 6 art pngs copied to `build/` |
| `npm run preview` + curl | index 200; each art 200 `image/png` |
| bare `npm install` (no flag) | success (via `.npmrc`) |

## Per-change verdicts (WORKS + MATCHES INTENT)

| # | Intent (what was asked) | Observed | WORKS | MATCHES INTENT |
|---|---|---|---|---|
| T1 | Lock current player/game behavior with tests | playerSlice.test (11) + gameSlice.test (10) pass; cap/floor/AP/phase-machine covered | yes | yes |
| T2 | Extract combat to a pure, tested module, no behavior change | `combat.ts` holds resolveCombat+cpuSelectCards; gameThunks imports it; 15 characterization tests; suite stayed green | yes | yes |
| T3 | Delete ALL dead code | counter feature, PlayerDeck, ComputerDeck, 6 empty stubs, PlayerDiscard, resetAP, unused import removed; lint dropped 3→0 warnings; build OK | yes | yes |
| T4 | Explicit effect/amount metadata + gameConfig + id-29 fix + single AP helper | Card gains effect+amount; gameConfig.ts; all 40 cards migrated; id-29 defense 1→2 (test-guarded); apCostOf used at 3 sites; old heuristic gone (grep) | yes | yes |
| T5 | Buffs match README: lone buff = no effect | attack/defense buff gated on a matching played card; behavior flip proven (lone attack buff 2→0 damage); AP buffs still grant AP | yes | yes |
| T6 | Heal from explicit amount, no regex | heal = Σ amount; regex/defense-fallback removed (grep); Heal=2/Heal+=5; description-independent; 10-cap via playerSlice | yes | yes |
| T7 | Fix production asset path | assets moved to `public/`; `Card.tsx` → `/${art}`; junk removed; build copies pngs; preview serves each 200 image/png | yes | yes |
| T8 | Clean install + lint + README + full gate | `.npmrc` makes bare install work; README status updated; full gate green | yes | yes |

## Integration (render-path) verdict

`src/App.integration.test.tsx` (jsdom) renders the real `<App/>` and verifies:
start screen shows "Battle Cards" + Start button; starting deals a 3-card hand,
shows Round 1 and 2 AP; playing a round resolves combat and shows the Battle Log
+ Continue button; playing an affordable card moves it to Cards Played and spends
AP. All 4 pass. WORKS: yes. MATCHES INTENT: yes.

## Over/under-delivery check

No scope drift. One out-of-scope edit (Defense card description wording) was
caught and reverted during T4 to keep the data change limited to the specified
id-29 fix. No requested item was descoped or deferred.

## Result

Full functional QA PASS within environment constraints. Visual browser render
not executed (no MCP); compensated by production served-asset checks and a jsdom
integration test of the full game flow.
