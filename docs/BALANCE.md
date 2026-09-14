# Deck Balance Notes

The balance simulation harness (`npm run sim -- --matrix [--smart]`) is the tool
for tuning deck balance. Run it after any card, deck, AI, or rules change.

## AP economy (important context)

AP is a **per-round budget that resets each round** to a base of 2 (`STARTING_AP`),
plus that round's net AP-buff (+) / debuff (−) deltas. It does **not** carry
over (use-it-or-lose-it). This fixed the "AP never resets → locked out after a
few rounds" bug, and as a side effect removed the old AP-snowball that had made
games stalemate to the 300-round cap.

## Current state (smart-vs-smart, per cell = A-win% / draw%)

```
              Fire            Ice            Lightning
Fire       36.4%/1.0%     2.6%/1.4%       28.0%/0.0%
Ice        94.0%/1.4%    31.4%/36.6%      93.2%/0.4%
Lightning  53.2%/0.2%     3.8%/0.2%       43.2%/0.0%
```

Draw rates are now near zero (except the Ice mirror) — games resolve instead of
stalling, which is a clear improvement over the pre-fix behaviour.

## Open balance item — Ice is now too strong

Under the corrected fixed-AP economy, **Ice dominates** (~93–94% vs Fire and
Lightning). With only ~2 AP/round and no snowball, aggressive decks can't burst
through Ice's block + heal sustain, so Ice out-lasts them. This is the inverse
of the pre-fix state (where the AP snowball favoured aggression and Ice was
weak). It is a tuning item, not a correctness bug — the game is fully playable.

Likely levers (measure each with the harness):
- Reduce Ice's healing volume/size, or raise heal AP cost.
- Give aggressive decks cheaper burst or armor-piercing.
- Consider a per-round heal cap or diminishing returns.

## Seat asymmetry

The double-KO tiebreaker awards the win to the CPU (side B), so in aggressive
mirrors the CPU is slightly favoured (e.g. Fire mirror ~36% player / ~63% CPU).
This is a deliberate rule; revisit if player-side fairness becomes a concern.
