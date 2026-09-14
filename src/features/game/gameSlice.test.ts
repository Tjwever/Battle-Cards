import gameReducer, {
    startGame,
    beginPlayerTurn,
    resolveRound,
    endRound,
    nextRound,
    setGameOver,
    addRoundLog,
    resetGame,
} from './gameSlice'
import type { GameState } from './gameSlice'

function makeState(overrides: Partial<GameState> = {}): GameState {
    return {
        phase: 'idle',
        round: 0,
        winner: null,
        roundLog: [],
        ...overrides,
    }
}

describe('gameSlice', () => {
    describe('initial state', () => {
        it('starts idle at round 0 with no winner and an empty log', () => {
            const state = gameReducer(undefined, { type: '@@INIT' })
            expect(state).toEqual({
                phase: 'idle',
                round: 0,
                winner: null,
                roundLog: [],
            })
        })
    })

    describe('phase transitions', () => {
        it('startGame -> starting, round 1, cleared winner and log', () => {
            const state = makeState({
                phase: 'gameOver',
                round: 7,
                winner: 'cpu',
                roundLog: ['old'],
            })
            const result = gameReducer(state, startGame())
            expect(result.phase).toBe('starting')
            expect(result.round).toBe(1)
            expect(result.winner).toBeNull()
            expect(result.roundLog).toEqual([])
        })

        it('beginPlayerTurn -> playerTurn', () => {
            const result = gameReducer(
                makeState({ phase: 'starting' }),
                beginPlayerTurn()
            )
            expect(result.phase).toBe('playerTurn')
        })

        it('resolveRound -> resolving', () => {
            const result = gameReducer(
                makeState({ phase: 'playerTurn' }),
                resolveRound()
            )
            expect(result.phase).toBe('resolving')
        })

        it('endRound -> roundEnd', () => {
            const result = gameReducer(
                makeState({ phase: 'resolving' }),
                endRound()
            )
            expect(result.phase).toBe('roundEnd')
        })

        it('walks the full idle -> gameOver lifecycle in order', () => {
            let state = gameReducer(undefined, { type: '@@INIT' })
            expect(state.phase).toBe('idle')
            state = gameReducer(state, startGame())
            expect(state.phase).toBe('starting')
            state = gameReducer(state, beginPlayerTurn())
            expect(state.phase).toBe('playerTurn')
            state = gameReducer(state, resolveRound())
            expect(state.phase).toBe('resolving')
            state = gameReducer(state, endRound())
            expect(state.phase).toBe('roundEnd')
            state = gameReducer(state, setGameOver('player'))
            expect(state.phase).toBe('gameOver')
        })
    })

    describe('nextRound', () => {
        it('increments the round, returns to playerTurn, and clears the log', () => {
            const state = makeState({
                phase: 'roundEnd',
                round: 2,
                roundLog: ['a', 'b'],
            })
            const result = gameReducer(state, nextRound())
            expect(result.round).toBe(3)
            expect(result.phase).toBe('playerTurn')
            expect(result.roundLog).toEqual([])
        })
    })

    describe('setGameOver', () => {
        it('sets phase gameOver and records the winner', () => {
            const result = gameReducer(
                makeState({ phase: 'roundEnd' }),
                setGameOver('cpu')
            )
            expect(result.phase).toBe('gameOver')
            expect(result.winner).toBe('cpu')
        })
    })

    describe('addRoundLog', () => {
        it('appends entries to the round log in order', () => {
            let state = makeState()
            state = gameReducer(state, addRoundLog('first'))
            state = gameReducer(state, addRoundLog('second'))
            expect(state.roundLog).toEqual(['first', 'second'])
        })
    })

    describe('resetGame', () => {
        it('restores the initial state', () => {
            const state = makeState({
                phase: 'gameOver',
                round: 9,
                winner: 'player',
                roundLog: ['x'],
            })
            const result = gameReducer(state, resetGame())
            expect(result).toEqual({
                phase: 'idle',
                round: 0,
                winner: null,
                roundLog: [],
            })
        })
    })
})
