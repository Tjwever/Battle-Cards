import type { AppThunk } from '../../app/store'
import {
    shufflePlayerDeck,
    shuffleCpuDeck,
    playerDrawCards,
    cpuDrawCards,
    cpuPlayCard,
    discardPlayedCards,
    resetCards
} from '../cards/cardSlice'
import {
    resetPlayers,
    decrementHealth,
    incrementHealth,
    spendAP,
    addPendingAP,
    applyPendingAP,
} from '../player/playerSlice'
import {
    startGame,
    beginPlayerTurn,
    resolveRound,
    endRound,
    nextRound,
    setGameOver,
    addRoundLog,
    resetGame,
} from './gameSlice'
import { cpuSelectCards, resolveCombat, apCostOf } from './combat'

export const initGame = (): AppThunk => (dispatch) => {
    dispatch(resetGame())
    dispatch(resetPlayers())
    dispatch(resetCards())
    dispatch(shufflePlayerDeck())
    dispatch(shuffleCpuDeck())
    dispatch(startGame())
    dispatch(playerDrawCards(3))
    dispatch(cpuDrawCards(3))
    dispatch(beginPlayerTurn())
}

export const playRound = (): AppThunk => (dispatch, getState) => {
    const state = getState()
    const cpuHand = state.card.computerHand
    const cpuAPAvailable = state.player.cpu.actionPoints
    const round = state.game.round

    dispatch(resolveRound())

    const cpuSelected = cpuSelectCards(cpuHand, cpuAPAvailable)
    for (const card of cpuSelected) {
        const cost = apCostOf(card)
        dispatch(cpuPlayCard(card.id))
        if (cost > 0) {
            dispatch(spendAP({ amount: cost, player: 'cpu' }))
        }
    }

    const postState = getState()
    const playerCardsPlayed = postState.card.playerCardsPlayed
    const cpuCardsPlayed = postState.card.computerCardsPlayed

    dispatch(addRoundLog(`--- Round ${round} ---`))

    if (playerCardsPlayed.length > 0) {
        dispatch(
            addRoundLog(
                `Player played: ${playerCardsPlayed.map((c) => c.name).join(', ')}`
            )
        )
    }
    if (cpuCardsPlayed.length > 0) {
        dispatch(
            addRoundLog(
                `CPU played: ${cpuCardsPlayed.map((c) => c.name).join(', ')}`
            )
        )
    }

    const { playerDamage, cpuDamage, playerHeal, cpuHeal, playerAPGain, cpuAPGain, log } =
        resolveCombat(playerCardsPlayed, cpuCardsPlayed)

    for (const entry of log) {
        dispatch(addRoundLog(entry))
    }

    if (cpuDamage > 0) {
        dispatch(decrementHealth({ amount: cpuDamage, player: 'cpu' }))
    }
    if (playerDamage > 0) {
        dispatch(decrementHealth({ amount: playerDamage, player: 'player' }))
    }
    if (playerHeal > 0) {
        dispatch(incrementHealth({ amount: playerHeal, player: 'player' }))
    }
    if (cpuHeal > 0) {
        dispatch(incrementHealth({ amount: cpuHeal, player: 'cpu' }))
    }
    if (playerAPGain > 0) {
        dispatch(addPendingAP({ amount: playerAPGain, player: 'player' }))
    }
    if (cpuAPGain > 0) {
        dispatch(addPendingAP({ amount: cpuAPGain, player: 'cpu' }))
    }

    dispatch(endRound())

    const afterState = getState()
    const pHealth = afterState.player.player.health
    const cHealth = afterState.player.cpu.health

    if (cHealth <= 0 && pHealth <= 0) {
        dispatch(addRoundLog('Both players eliminated — CPU wins by tiebreaker!'))
        dispatch(setGameOver('cpu'))
        return
    }
    if (cHealth <= 0) {
        dispatch(addRoundLog('CPU has been defeated!'))
        dispatch(setGameOver('player'))
        return
    }
    if (pHealth <= 0) {
        dispatch(addRoundLog('Player has been defeated!'))
        dispatch(setGameOver('cpu'))
        return
    }
}

export const advanceToNextRound = (): AppThunk => (dispatch, getState) => {
    dispatch(discardPlayedCards())
    dispatch(applyPendingAP())

    const state = getState()
    dispatch(playerDrawCards(5 - state.card.playerHand.length))
    dispatch(cpuDrawCards(5 - state.card.computerHand.length))
    dispatch(nextRound())
}
