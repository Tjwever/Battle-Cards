import { render, screen, fireEvent, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import playerReducer from './features/player/playerSlice'
import cardReducer from './features/cards/cardSlice'
import gameReducer from './features/game/gameSlice'
import App from './App'

// Fresh store per test for isolation (App uses the singleton store in prod).
function makeStore() {
    return configureStore({
        reducer: {
            player: playerReducer,
            card: cardReducer,
            game: gameReducer,
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

    it('starts a game: deals a hand, shows round 1 and starting AP', () => {
        const store = renderApp()
        fireEvent.click(screen.getByRole('button', { name: /start game/i }))

        expect(screen.getByText(/round 1/i)).toBeInTheDocument()
        // 3 cards dealt to the player hand, 2 starting AP
        expect(store.getState().card.playerHand).toHaveLength(3)
        expect(store.getState().player.player.actionPoints).toBe(2)
        expect(screen.getAllByText('AP: 2').length).toBeGreaterThanOrEqual(1)
    })

    it('plays a round: resolves combat and shows the battle log + continue', () => {
        renderApp()
        fireEvent.click(screen.getByRole('button', { name: /start game/i }))
        fireEvent.click(screen.getByRole('button', { name: /play round/i }))

        // After resolving, the round ends: battle log is shown and a Continue
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
