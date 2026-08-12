import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export type GamePhase =
    | 'idle'
    | 'starting'
    | 'playerTurn'
    | 'resolving'
    | 'roundEnd'
    | 'gameOver'

export interface GameState {
    phase: GamePhase
    round: number
    winner: 'player' | 'cpu' | null
    roundLog: string[]
}

const initialState: GameState = {
    phase: 'idle',
    round: 0,
    winner: null,
    roundLog: [],
}

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        startGame(state) {
            state.phase = 'starting'
            state.round = 1
            state.winner = null
            state.roundLog = []
        },
        beginPlayerTurn(state) {
            state.phase = 'playerTurn'
        },
        resolveRound(state) {
            state.phase = 'resolving'
        },
        endRound(state) {
            state.phase = 'roundEnd'
        },
        nextRound(state) {
            state.round += 1
            state.phase = 'playerTurn'
            state.roundLog = []
        },
        setGameOver(state, action: PayloadAction<'player' | 'cpu'>) {
            state.phase = 'gameOver'
            state.winner = action.payload
        },
        addRoundLog(state, action: PayloadAction<string>) {
            state.roundLog.push(action.payload)
        },
        resetGame() {
            return initialState
        },
    },
})

export const {
    startGame,
    beginPlayerTurn,
    resolveRound,
    endRound,
    nextRound,
    setGameOver,
    addRoundLog,
    resetGame,
} = gameSlice.actions

export const selectGamePhase = (state: RootState) => state.game.phase
export const selectRound = (state: RootState) => state.game.round
export const selectWinner = (state: RootState) => state.game.winner
export const selectRoundLog = (state: RootState) => state.game.roundLog

export default gameSlice.reducer
