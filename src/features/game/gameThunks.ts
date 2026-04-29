import { AppThunk } from '../../app/store'
import {
    shufflePlayerDeck,
    shuffleCpuDeck,
    playerDrawCards,
    cpuDrawCards,
    cpuPlayCard,
    discardPlayedCards,
    Card,
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

export const initGame = (): AppThunk => (dispatch) => {
    dispatch(resetGame())
    dispatch(resetPlayers())
    dispatch(shufflePlayerDeck())
    dispatch(shuffleCpuDeck())
    dispatch(startGame())
    dispatch(playerDrawCards(3))
    dispatch(cpuDrawCards(3))
    dispatch(beginPlayerTurn())
}

function cpuSelectCards(
    hand: Card[],
    availableAP: number
): Card[] {
    const sorted = [...hand].sort(
        (a, b) => a.action_points - b.action_points
    )
    const selected: Card[] = []
    let apLeft = availableAP

    for (const card of sorted) {
        const cost = card.action_type === 'Buff' && card.attack === 0 && card.defense === 0
            ? 0
            : card.action_points
        if (cost <= apLeft) {
            selected.push(card)
            apLeft -= cost
        }
    }

    return selected
}

function resolveCombat(
    playerCards: Card[],
    cpuCards: Card[]
): {
    playerDamage: number
    cpuDamage: number
    playerHeal: number
    cpuHeal: number
    playerAPGain: number
    cpuAPGain: number
    log: string[]
} {
    const log: string[] = []

    const playerAttacks = playerCards.filter((c) => c.action_type === 'Attack')
    const playerDefenses = playerCards.filter(
        (c) => c.action_type === 'Defense'
    )
    const playerBuffs = playerCards.filter((c) => c.action_type === 'Buff')
    const playerHeals = playerCards.filter((c) => c.action_type === 'Heal')

    const cpuAttacks = cpuCards.filter((c) => c.action_type === 'Attack')
    const cpuDefenses = cpuCards.filter((c) => c.action_type === 'Defense')
    const cpuBuffs = cpuCards.filter((c) => c.action_type === 'Buff')
    const cpuHeals = cpuCards.filter((c) => c.action_type === 'Heal')

    let playerAttackBuff = 0
    let playerDefenseBuff = 0
    let playerAPGain = 0
    for (const buff of playerBuffs) {
        if (buff.attack > 0) {
            playerAttackBuff += buff.attack
            log.push(`Player buff: +${buff.attack} attack power`)
        }
        if (buff.defense > 0) {
            playerDefenseBuff += buff.defense
            log.push(`Player buff: +${buff.defense} defense power`)
        }
        if (buff.action_points === 0) {
            playerAPGain += 1
            log.push(`Player gains +1 AP for next round`)
        }
    }

    let cpuAttackBuff = 0
    let cpuDefenseBuff = 0
    let cpuAPGain = 0
    for (const buff of cpuBuffs) {
        if (buff.attack > 0) {
            cpuAttackBuff += buff.attack
            log.push(`CPU buff: +${buff.attack} attack power`)
        }
        if (buff.defense > 0) {
            cpuDefenseBuff += buff.defense
            log.push(`CPU buff: +${buff.defense} defense power`)
        }
        if (buff.action_points === 0) {
            cpuAPGain += 1
            log.push(`CPU gains +1 AP for next round`)
        }
    }

    let totalPlayerAttack = playerAttacks.reduce(
        (sum, c) => sum + c.attack,
        0
    )
    totalPlayerAttack += playerAttackBuff

    let totalCpuDefense = cpuDefenses.reduce((sum, c) => sum + c.defense, 0)
    totalCpuDefense += cpuDefenseBuff

    let cpuDamage = 0
    if (totalPlayerAttack > 0) {
        if (totalCpuDefense > 0) {
            const blocked = Math.min(totalPlayerAttack, totalCpuDefense)
            log.push(
                `Player attacks for ${totalPlayerAttack}, CPU blocks ${blocked}`
            )
            cpuDamage = Math.max(totalPlayerAttack - totalCpuDefense, 0)
        } else {
            cpuDamage = totalPlayerAttack
            log.push(
                `Player attacks for ${totalPlayerAttack} — no CPU defense!`
            )
        }
    }

    let totalCpuAttack = cpuAttacks.reduce((sum, c) => sum + c.attack, 0)
    totalCpuAttack += cpuAttackBuff

    let totalPlayerDefense = playerDefenses.reduce(
        (sum, c) => sum + c.defense,
        0
    )
    totalPlayerDefense += playerDefenseBuff

    let playerDamage = 0
    if (totalCpuAttack > 0) {
        if (totalPlayerDefense > 0) {
            const blocked = Math.min(totalCpuAttack, totalPlayerDefense)
            log.push(
                `CPU attacks for ${totalCpuAttack}, Player blocks ${blocked}`
            )
            playerDamage = Math.max(totalCpuAttack - totalPlayerDefense, 0)
        } else {
            playerDamage = totalCpuAttack
            log.push(
                `CPU attacks for ${totalCpuAttack} — no Player defense!`
            )
        }
    }

    if (cpuDamage > 0) log.push(`CPU takes ${cpuDamage} damage`)
    if (playerDamage > 0) log.push(`Player takes ${playerDamage} damage`)

    let playerHeal = playerHeals.reduce((sum, c) => sum + c.defense, 0)
    if (playerHeal === 0) {
        playerHeal = playerHeals.reduce((sum, c) => {
            const healMatch = c.description.match(/Adds (\d+) to Players Health/)
            return sum + (healMatch ? parseInt(healMatch[1], 10) : 0)
        }, 0)
    }
    let cpuHeal = cpuHeals.reduce((sum, c) => sum + c.defense, 0)
    if (cpuHeal === 0) {
        cpuHeal = cpuHeals.reduce((sum, c) => {
            const healMatch = c.description.match(/Adds (\d+) to Players Health/)
            return sum + (healMatch ? parseInt(healMatch[1], 10) : 0)
        }, 0)
    }

    if (playerHeal > 0) log.push(`Player heals ${playerHeal} HP`)
    if (cpuHeal > 0) log.push(`CPU heals ${cpuHeal} HP`)

    if (
        playerAttacks.length === 0 &&
        cpuAttacks.length === 0 &&
        playerHeals.length === 0 &&
        cpuHeals.length === 0 &&
        playerBuffs.length === 0 &&
        cpuBuffs.length === 0
    ) {
        log.push('Neither side played any cards')
    }

    return { playerDamage, cpuDamage, playerHeal, cpuHeal, playerAPGain, cpuAPGain, log }
}

export const playRound = (): AppThunk => (dispatch, getState) => {
    const state = getState()
    const cpuHand = state.card.computerHand
    const cpuAPAvailable = state.player.cpu.actionPoints
    const round = state.game.round

    dispatch(resolveRound())

    const cpuSelected = cpuSelectCards(cpuHand, cpuAPAvailable)
    for (const card of cpuSelected) {
        const cost =
            card.action_type === 'Buff' &&
            card.attack === 0 &&
            card.defense === 0
                ? 0
                : card.action_points
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

    dispatch(discardPlayedCards())
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

    dispatch(applyPendingAP())
    dispatch(playerDrawCards(5 - afterState.card.playerHand.length))
    dispatch(cpuDrawCards(5 - afterState.card.computerHand.length))
    dispatch(nextRound())
}
