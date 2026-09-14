import { configureStore } from '@reduxjs/toolkit'
import playerReducer from '../player/playerSlice'
import cardReducer from '../cards/cardSlice'
import gameReducer from './gameSlice'
import setupReducer from './setupSlice'
import statsReducer from './statsSlice'
import { initGame, revealAndResolve, advanceToNextRound, returnToMenu } from './gameThunks'
import { spendAP } from '../player/playerSlice'
import { recordWin } from './statsSlice'

function makeStore() {
    return configureStore({
        reducer: {
            player: playerReducer,
            card: cardReducer,
            game: gameReducer,
            setup: setupReducer,
            stats: statsReducer,
        },
    })
}

describe('gameThunks — commit / reveal flow', () => {
    it('initGame deals 3 to each side, enters playerTurn, and commits CPU cards face-down', () => {
        const store = makeStore()
        store.dispatch(initGame())
        const s = store.getState()

        expect(s.game.phase).toBe('playerTurn')
        expect(s.game.round).toBe(1)
        expect(s.card.playerHand).toHaveLength(3)
        // CPU drew 3; some were committed face-down, the rest remain in hand
        expect(
            s.card.computerHand.length + s.card.computerCardsPlayed.length
        ).toBe(3)
        // player has NOT been forced to commit anything
        expect(s.card.playerCardsPlayed).toHaveLength(0)
    })

    it('CPU commit never spends more AP than available', () => {
        const store = makeStore()
        store.dispatch(initGame())
        expect(store.getState().player.cpu.actionPoints).toBeGreaterThanOrEqual(
            0
        )
    })

    it('revealAndResolve moves playerTurn -> roundEnd and logs the round header', () => {
        const store = makeStore()
        store.dispatch(initGame())
        store.dispatch(revealAndResolve())
        const s = store.getState()

        expect(s.game.phase).toBe('roundEnd')
        expect(s.game.roundLog).toContain('--- Round 1 ---')
    })

    it('is a no-op if revealAndResolve is called outside playerTurn', () => {
        const store = makeStore()
        store.dispatch(initGame())
        store.dispatch(revealAndResolve()) // -> roundEnd
        const logLen = store.getState().game.roundLog.length
        store.dispatch(revealAndResolve()) // should do nothing now
        expect(store.getState().game.roundLog.length).toBe(logLen)
        expect(store.getState().game.phase).toBe('roundEnd')
    })

    it('advanceToNextRound increments the round and re-commits CPU cards', () => {
        const store = makeStore()
        store.dispatch(initGame())
        store.dispatch(revealAndResolve())
        store.dispatch(advanceToNextRound())
        const s = store.getState()

        expect(s.game.round).toBe(2)
        expect(s.game.phase).toBe('playerTurn')
        // both hands refilled toward 5; CPU committed again for round 2
        expect(
            s.card.computerHand.length + s.card.computerCardsPlayed.length
        ).toBeGreaterThan(0)
    })

    it('returnToMenu resets to the start screen (idle) and clears the board, preserving stats', () => {
        const store = makeStore()
        store.dispatch(recordWin()) // existing record to preserve
        store.dispatch(initGame())
        expect(store.getState().game.phase).toBe('playerTurn')

        store.dispatch(returnToMenu())
        const s = store.getState()
        expect(s.game.phase).toBe('idle')
        expect(s.card.playerHand).toHaveLength(0)
        expect(s.card.playerDeck).toHaveLength(0)
        expect(s.card.computerCardsPlayed).toHaveLength(0)
        // win-loss record survives a restart
        expect(s.stats.wins).toBe(1)
    })

    it('refills player AP every round so the player is never locked out (AP-reset bug regression)', () => {
        const store = makeStore()
        store.dispatch(initGame())

        for (let round = 0; round < 5; round++) {
            // Spend all of the player's AP this round.
            const ap = store.getState().player.player.actionPoints
            if (ap > 0) store.dispatch(spendAP({ amount: ap, player: 'player' }))
            expect(store.getState().player.player.actionPoints).toBe(0)

            store.dispatch(revealAndResolve())
            if (store.getState().game.phase === 'gameOver') break
            store.dispatch(advanceToNextRound())

            // Next round the player must have AP again (base refill), never
            // stuck at 0 as in the original bug.
            expect(
                store.getState().player.player.actionPoints
            ).toBeGreaterThan(0)
        }
    })
})
