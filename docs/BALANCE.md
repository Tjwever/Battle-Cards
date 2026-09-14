# Deck Balance Notes

The balance simulation harness (`npm run sim -- --matrix [--smart]`) is the tool
for tuning deck balance. Run it after any card or deck change.

## Current state (smart AI, per-cell = A-win% / draw%)

```
              Fire            Ice           Lightning
Fire       26.8%/43.8%    36.8%/54.2%      24.2%/37.2%
Ice         6.3%/53.3%    10.2%/76.8%      10.2%/40.2%
Lightning  36.0%/37.8%    46.7%/43.8%      32.3%/34.0%
```

Power ordering under smart AI: **Lightning ≥ Fire ≫ Ice.**

## What was fixed

- **Lightning's runaway dominance** — originally 73–78% vs the field; after
  nerfing its AP snowball (Charge 5→3, Amplify 3→2, +defense) and its
  undercosted attack (Chain Bolt 1→2 AP), it is 32–53%.

## Known limitation — Ice underperforms

Ice loses to Fire and Lightning (~6–10% wins vs ~40–50% losses). This is
**structural**, not a card-count problem — four Ice reworks (pure defense →
control → aggro-control → sustain-midrange) did not close the gap. Three
mechanics interact against reactive/defensive archetypes:

1. **Face-down commit (E1, spec-required):** cards are played blind, so a
   defensive deck cannot "block when threatened" — it commits defense without
   seeing the incoming attack, so blocks frequently whiff.
2. **Tight AP economy:** ~2 AP/round forces a choice between defending, healing,
   and attacking; a control deck can rarely do enough of all three.
3. **Round-cap tiebreaker (harness):** ties resolve to the higher-health side,
   rewarding aggression over attrition.

Truly balancing Ice would require an engine/design change (e.g., an AP cap to
curb snowball, visible commits, or a different resolution rule) that conflicts
with the spec-required face-down mechanic and was out of scope for the themed-
deck epic. It is left as an open, harness-measurable tuning item. Ice is still
fun and coherent (a sustain deck) and viable against a weaker (greedy) opponent;
it is simply not at parity under optimal play.
