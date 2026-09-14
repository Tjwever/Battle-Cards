import type { AppThunk } from '../../app/store'
import {
    shufflePlayerDeck,
    shuffleCpuDeck,
    playerDrawCards,
    cpuDrawCards,
    cpuPlayCard,
    discardPlayedCards,
    loadDecks,
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
    beginReveal,
    endRound,
    nextRound,
    setGameOver,
    addRoundLog,
    resetGame,
} from './gameSlice'
import { resolveCombat, apCostOf } from './combat'
import { STRATEGIES } from './ai'
import { getDeck } from '../../app/decks'
import { MAX_HEALTH } from '../../app/gameConfig'

/**
 * The CPU commits its cards for the round face-down at the start of the
 * player's turn — simultaneous, hidden play. Cards move to computerCardsPlayed
 * (rendered as face-down backs) and are only revealed when the player reveals.
 */
export const cpuCommitCards = (): AppThunk => (dispatch, getState) => {
    const state = getState()
    const strategy = STRATEGIES[state.setup.difficulty]
    const selected = strategy({
        hand: state.card.computerHand,
        ap: state.player.cpu.actionPoints,
        selfHealth: state.player.cpu.health,
        opponentHealth: state.player.player.health,
        maxHealth: MAX_HEALTH,
    })
    for (const card of selected) {
        const cost = apCostOf(card)
        dispatch(cpuPlayCard(card.id))
        if (cost > 0) {
            dispatch(spendAP({ amount: cost, player: 'cpu' }))
        }
    }
}

export const initGame = (): AppThunk => (dispatch, getState) => {
    const { playerDeckId, cpuDeckId } = getState().setup
    dispatch(resetGame())
    dispatch(resetPlayers())
    dispatch(
        loadDecks({ player: getDeck(playerDeckId), computer: getDeck(cpuDeckId) })
    )
    dispatch(shufflePlayerDeck())
    dispatch(shuffleCpuDeck())
    dispatch(startGame())
    dispatch(playerDrawCards(3))
    dispatch(cpuDrawCards(3))
    dispatch(beginPlayerTurn())
    dispatch(cpuCommitCards())
}

/**
 * The player reveals: the CPU's face-down cards flip, both sides resolve
 * simultaneously. CPU cards were already committed at the start of the turn.
 */
export const revealAndResolve = (): AppThunk => (dispatch, getState) => {
    const preState = getState()
    if (preState.game.phase !== 'playerTurn') return
    const round = preState.game.round

    dispatch(beginReveal())

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

    const { playerDamage, cpuDamage, playerHeal, cpuHeal, playerAPGain, cpuAPGain, playerAPLoss, cpuAPLoss, log } =
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
    const playerNetAP = playerAPGain - playerAPLoss
    const cpuNetAP = cpuAPGain - cpuAPLoss
    if (playerNetAP !== 0) {
        dispatch(addPendingAP({ amount: playerNetAP, player: 'player' }))
    }
    if (cpuNetAP !== 0) {
        dispatch(addPendingAP({ amount: cpuNetAP, player: 'cpu' }))
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
    dispatch(cpuCommitCards())
}
