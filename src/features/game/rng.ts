/**
 * Deterministic, seedable RNG utilities. Used by the balance-simulation harness
 * so runs are reproducible, and available to shuffle/draw so tests can pin
 * outcomes. The live game passes `Math.random` (the default) for real randomness.
 */

export type Rng = () => number

/**
 * mulberry32 — a small, fast, well-distributed 32-bit PRNG. Same seed always
 * yields the same sequence.
 */
export function createRng(seed: number): Rng {
    let a = seed >>> 0
    return function () {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

/**
 * Pure Fisher-Yates shuffle. Returns a new array; does not mutate the input.
 * Defaults to Math.random so callers that don't care about determinism can omit
 * the rng.
 */
export function shuffle<T>(array: readonly T[], rng: Rng = Math.random): T[] {
    const result = array.slice()
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}
