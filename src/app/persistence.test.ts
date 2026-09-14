import { beforeEach, describe, it, expect } from 'vitest'
import { loadState, saveState, clearState, SCHEMA_VERSION } from './persistence'
import type { RootState } from './store'

describe('persistence', () => {
    beforeEach(() => {
        localStorage.clear()
    })

    it('round-trips saved state', () => {
        const state = {
            stats: { wins: 3, losses: 2 },
            setup: { playerDeckId: 'lightning', cpuDeckId: 'fire', difficulty: 'smart' },
        } as unknown as RootState
        saveState(state)
        const loaded = loadState()
        expect(loaded?.stats).toEqual({ wins: 3, losses: 2 })
        expect(loaded?.setup?.playerDeckId).toBe('lightning')
    })

    it('returns undefined when nothing is stored', () => {
        expect(loadState()).toBeUndefined()
    })

    it('ignores a stale schema version', () => {
        localStorage.setItem(
            'battle-cards-state',
            JSON.stringify({ version: SCHEMA_VERSION + 1, state: { stats: { wins: 9, losses: 9 } } })
        )
        expect(loadState()).toBeUndefined()
    })

    it('ignores corrupt JSON', () => {
        localStorage.setItem('battle-cards-state', '{not valid json')
        expect(loadState()).toBeUndefined()
    })

    it('clearState removes persisted data', () => {
        saveState({ stats: { wins: 1, losses: 0 } } as unknown as RootState)
        clearState()
        expect(loadState()).toBeUndefined()
    })
})
