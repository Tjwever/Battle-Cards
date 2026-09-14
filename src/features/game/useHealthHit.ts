import { useEffect, useRef, useState } from 'react'

/**
 * Returns true briefly whenever `health` decreases, for triggering a damage
 * shake/flash animation. Ignores increases (heals) and the initial value.
 */
export function useHealthHit(health: number, ms = 500): boolean {
    const prev = useRef(health)
    const [hit, setHit] = useState(false)

    useEffect(() => {
        if (health < prev.current) {
            setHit(true)
            const timer = setTimeout(() => setHit(false), ms)
            prev.current = health
            return () => clearTimeout(timer)
        }
        prev.current = health
    }, [health, ms])

    return hit
}
