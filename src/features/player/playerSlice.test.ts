import playerReducer, {
    incrementHealth,
    decrementHealth,
    spendAP,
    addPendingAP,
    applyPendingAP,
    resetPlayers,
} from './playerSlice'
import type { PlayerState } from './playerSlice'

function makeState(overrides: Partial<PlayerState> = {}): PlayerState {
    return {
        player: { health: 10, actionPoints: 2, pendingAP: 0 },
        cpu: { health: 10, actionPoints: 2, pendingAP: 0 },
        ...overrides,
    }
}

describe('playerSlice', () => {
    describe('initial state', () => {
        it('starts both sides at 10 health, 2 AP, 0 pending AP', () => {
            const state = playerReducer(undefined, { type: '@@INIT' })
            expect(state.player).toEqual({
                health: 10,
                actionPoints: 2,
                pendingAP: 0,
            })
            expect(state.cpu).toEqual({
                health: 10,
                actionPoints: 2,
                pendingAP: 0,
            })
        })
    })

    describe('incrementHealth', () => {
        it('increases the target health', () => {
            const state = makeState({
                player: { health: 5, actionPoints: 2, pendingAP: 0 },
            })
            const result = playerReducer(
                state,
                incrementHealth({ amount: 3, player: 'player' })
            )
            expect(result.player.health).toBe(8)
        })

        it('caps health at 10 (max health)', () => {
            const state = makeState({
                player: { health: 9, actionPoints: 2, pendingAP: 0 },
            })
            const result = playerReducer(
                state,
                incrementHealth({ amount: 5, player: 'player' })
            )
            expect(result.player.health).toBe(10)
        })

        it('applies to the cpu when targeted', () => {
            const state = makeState({
                cpu: { health: 4, actionPoints: 2, pendingAP: 0 },
            })
            const result = playerReducer(
                state,
                incrementHealth({ amount: 2, player: 'cpu' })
            )
            expect(result.cpu.health).toBe(6)
            expect(result.player.health).toBe(10)
        })
    })

    describe('decrementHealth', () => {
        it('decreases the target health', () => {
            const result = playerReducer(
                makeState(),
                decrementHealth({ amount: 4, player: 'player' })
            )
            expect(result.player.health).toBe(6)
        })

        it('floors health at 0', () => {
            const state = makeState({
                cpu: { health: 3, actionPoints: 2, pendingAP: 0 },
            })
            const result = playerReducer(
                state,
                decrementHealth({ amount: 10, player: 'cpu' })
            )
            expect(result.cpu.health).toBe(0)
        })
    })

    describe('spendAP', () => {
        it('reduces the target action points', () => {
            const result = playerReducer(
                makeState(),
                spendAP({ amount: 1, player: 'player' })
            )
            expect(result.player.actionPoints).toBe(1)
        })

        it('floors action points at 0', () => {
            const result = playerReducer(
                makeState(),
                spendAP({ amount: 5, player: 'cpu' })
            )
            expect(result.cpu.actionPoints).toBe(0)
        })
    })

    describe('addPendingAP / applyPendingAP', () => {
        it('accumulates pending AP without changing current AP', () => {
            const result = playerReducer(
                makeState(),
                addPendingAP({ amount: 2, player: 'player' })
            )
            expect(result.player.pendingAP).toBe(2)
            expect(result.player.actionPoints).toBe(2)
        })

        it('applies pending AP to current AP and clears pending for both sides', () => {
            let state = makeState()
            state = playerReducer(
                state,
                addPendingAP({ amount: 1, player: 'player' })
            )
            state = playerReducer(
                state,
                addPendingAP({ amount: 3, player: 'cpu' })
            )
            const result = playerReducer(state, applyPendingAP())
            expect(result.player.actionPoints).toBe(3)
            expect(result.player.pendingAP).toBe(0)
            expect(result.cpu.actionPoints).toBe(5)
            expect(result.cpu.pendingAP).toBe(0)
        })

        it('floors AP at 0 when pending is negative (debuff drain)', () => {
            let state = makeState({
                player: { health: 10, actionPoints: 1, pendingAP: 0 },
            })
            state = playerReducer(
                state,
                addPendingAP({ amount: -3, player: 'player' })
            )
            const result = playerReducer(state, applyPendingAP())
            expect(result.player.actionPoints).toBe(0)
            expect(result.player.pendingAP).toBe(0)
        })
    })

    describe('resetPlayers', () => {
        it('restores both sides to the initial state', () => {
            const state = makeState({
                player: { health: 1, actionPoints: 0, pendingAP: 4 },
                cpu: { health: 2, actionPoints: 1, pendingAP: 2 },
            })
            const result = playerReducer(state, resetPlayers())
            expect(result.player).toEqual({
                health: 10,
                actionPoints: 2,
                pendingAP: 0,
            })
            expect(result.cpu).toEqual({
                health: 10,
                actionPoints: 2,
                pendingAP: 0,
            })
        })
    })
})
