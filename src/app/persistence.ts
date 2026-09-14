import type { RootState } from './store'

const STORAGE_KEY = 'battle-cards-state'

/**
 * Bump this when the persisted state shape changes incompatibly. On load, a
 * mismatch is treated as "no saved state" so stale data can never crash a new
 * build.
 */
export const SCHEMA_VERSION = 1

interface Persisted {
    version: number
    state: Partial<RootState>
}

/** Load persisted state, or undefined if absent, corrupt, or a stale version. */
export function loadState(): Partial<RootState> | undefined {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return undefined
        const parsed = JSON.parse(raw) as Persisted
        if (!parsed || parsed.version !== SCHEMA_VERSION) return undefined
        return parsed.state
    } catch {
        // corrupt JSON, unavailable storage, etc. — start fresh
        return undefined
    }
}

/** Persist the given state under the current schema version. */
export function saveState(state: Partial<RootState>): void {
    try {
        const payload: Persisted = { version: SCHEMA_VERSION, state }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
        // storage full / unavailable — non-fatal, skip persisting
    }
}

/** Remove persisted state. */
export function clearState(): void {
    try {
        localStorage.removeItem(STORAGE_KEY)
    } catch {
        // ignore
    }
}

/** Trailing throttle: run at most once per `wait` ms. */
export function throttle(fn: () => void, wait: number): () => void {
    let last = 0
    let timer: ReturnType<typeof setTimeout> | null = null
    return () => {
        const now = Date.now()
        const remaining = wait - (now - last)
        if (remaining <= 0) {
            if (timer) {
                clearTimeout(timer)
                timer = null
            }
            last = now
            fn()
        } else if (!timer) {
            timer = setTimeout(() => {
                last = Date.now()
                timer = null
                fn()
            }, remaining)
        }
    }
}
