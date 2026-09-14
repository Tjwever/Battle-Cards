import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, afterEach } from 'vitest'
import { useHealthHit } from './useHealthHit'

afterEach(() => {
    vi.useRealTimers()
})

describe('useHealthHit', () => {
    it('flags a hit when health decreases, then clears after the timeout', () => {
        vi.useFakeTimers()
        const { result, rerender } = renderHook(
            ({ h }) => useHealthHit(h, 500),
            { initialProps: { h: 10 } }
        )
        expect(result.current).toBe(false)

        rerender({ h: 7 })
        expect(result.current).toBe(true)

        act(() => {
            vi.advanceTimersByTime(500)
        })
        expect(result.current).toBe(false)
    })

    it('does not flag on a heal (health increase)', () => {
        vi.useFakeTimers()
        const { result, rerender } = renderHook(
            ({ h }) => useHealthHit(h, 500),
            { initialProps: { h: 5 } }
        )
        rerender({ h: 8 })
        expect(result.current).toBe(false)
    })
})
