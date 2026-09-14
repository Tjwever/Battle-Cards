import { render, screen, fireEvent, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import playerReducer from './features/player/playerSlice'
import cardReducer from './features/cards/cardSlice'
import gameReducer from './features/game/gameSlice'
import setupReducer from './features/game/setupSlice'
import App from './App'

// Fresh store per test for isolation (App uses the singleton store in prod).
function makeStore() {
    return configureStore({
        reducer: {
            player: playerReducer,
            card: cardReducer,
            game: gameReducer,
            setup: setupReducer,
        },
    })
}

function renderApp() {
    const store = makeStore()
    render(
        <Provider store={store}>
            <App />
        </Provider>
    )
    return store
}

describe('App integration — full game flow (render path)', () => {
    it('shows the start screen before the game begins', () => {
        renderApp()
        expect(
            screen.getByRole('heading', { name: /battle cards/i })
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /start game/i })
        ).toBeInTheDocument()
    })

    it('lets the player choose a deck, which seeds the game', () => {
        const store = renderApp()
        // pick Lightning
        fireEvent.click(screen.getByRole('button', { name: /lightning/i }))
        expect(store.getState().setup.playerDeckId).toBe('lightning')

        fireEvent.click(screen.getByRole('button', { name: /start game/i }))
        // the player's deck was seeded from the Lightning pool (ids 300+)
        const s = store.getState()
        const playerCards = [
            ...s.card.playerDeck,
            ...s.card.playerHand,
            ...s.card.playerCardsPlayed,
        ]
        expect(playerCards).toHaveLength(30)
        expect(playerCards.every((c) => c.id >= 300 && c.id < 400)).toBe(true)
    })

    it('starts a game: deals a hand, shows round 1 and starting AP', () => {
        const store = renderApp()
        fireEvent.click(screen.getByRole('button', { name: /start game/i }))

        expect(screen.getByText(/round 1/i)).toBeInTheDocument()
        // 3 cards dealt to the player hand, 2 starting AP
        expect(store.getState().card.playerHand).toHaveLength(3)
        expect(store.getState().player.player.actionPoints).toBe(2)
        expect(screen.getAllByText('AP: 2').length).toBeGreaterThanOrEqual(1)
    })

    it('commits CPU cards face-down at the start of the turn', () => {
        const store = renderApp()
        fireEvent.click(screen.getByRole('button', { name: /start game/i }))

        const s = store.getState()
        // CPU drew 3 and committed some face-down; hand + committed accounts for the draw
        expect(
            s.card.computerHand.length + s.card.computerCardsPlayed.length
        ).toBe(3)
        expect(s.game.phase).toBe('playerTurn')
        // the reveal action is available (not yet revealed)
        expect(
            screen.getByRole('button', { name: /^reveal$/i })
        ).toBeInTheDocument()
        // if the CPU committed anything, it renders as face-down backs
        if (s.card.computerCardsPlayed.length > 0) {
            expect(
                screen.getAllByLabelText(/cpu committed card/i).length
            ).toBe(s.card.computerCardsPlayed.length)
        }
    })

    it('reveals a round: resolves combat and shows the battle log + continue', () => {
        renderApp()
        fireEvent.click(screen.getByRole('button', { name: /start game/i }))
        fireEvent.click(screen.getByRole('button', { name: /^reveal$/i }))

        // After revealing, the round ends: battle log is shown and a Continue
        // button lets the player advance.
        expect(screen.getByText(/battle log/i)).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /continue/i })
        ).toBeInTheDocument()
    })

    it('lets the player play an affordable card from hand, spending AP', () => {
        const store = renderApp()
        fireEvent.click(screen.getByRole('button', { name: /start game/i }))

        const apBefore = store.getState().player.player.actionPoints
        const hand = store.getState().card.playerHand
        // find a card that is affordable at current AP and not a free AP buff
        const target = hand.find(
            (c) => c.effect !== 'apBuff' && c.action_points <= apBefore
        )
        if (!target) {
            // all cards free or unaffordable — nothing to assert here
            return
        }
        const buttons = screen.getAllByRole('button')
        const cardBtn = buttons.find((b) =>
            within(b).queryByText(target.name)
        )
        expect(cardBtn).toBeDefined()
        fireEvent.click(cardBtn!)

        expect(store.getState().card.playerCardsPlayed).toHaveLength(1)
        expect(store.getState().player.player.actionPoints).toBe(
            apBefore - target.action_points
        )
    })
})
