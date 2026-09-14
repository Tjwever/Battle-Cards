import statsReducer, { recordWin, recordLoss, resetStats } from './statsSlice'

describe('statsSlice', () => {
    it('starts at 0 wins / 0 losses', () => {
        const state = statsReducer(undefined, { type: '@@INIT' })
        expect(state).toEqual({ wins: 0, losses: 0 })
    })

    it('records wins and losses', () => {
        let state = statsReducer(undefined, { type: '@@INIT' })
        state = statsReducer(state, recordWin())
        state = statsReducer(state, recordWin())
        state = statsReducer(state, recordLoss())
        expect(state).toEqual({ wins: 2, losses: 1 })
    })

    it('resets the record', () => {
        let state = { wins: 5, losses: 3 }
        state = statsReducer(state, resetStats())
        expect(state).toEqual({ wins: 0, losses: 0 })
    })
})
