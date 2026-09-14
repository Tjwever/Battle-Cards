import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import DiscardViewer from './DiscardViewer'
import type { Card } from '../../features/cards/cardSlice'

function card(id: number, name: string): Card {
    return {
        id,
        name,
        action_type: 'Attack',
        effect: 'attack',
        amount: 1,
        description: 'test',
        art: 'a.png',
        attack: 1,
        defense: 0,
        action_points: 1,
    }
}

describe('DiscardViewer', () => {
    it('renders the title and the cards in the pile', () => {
        render(
            <DiscardViewer
                title="Your Discard Pile"
                cards={[card(1, 'Ember'), card(2, 'Spark')]}
                onClose={() => {}}
            />
        )
        expect(
            screen.getByRole('dialog', { name: /your discard pile/i })
        ).toBeInTheDocument()
        expect(screen.getByText('Ember')).toBeInTheDocument()
        expect(screen.getByText('Spark')).toBeInTheDocument()
    })

    it('shows the empty state when the pile has no cards', () => {
        render(
            <DiscardViewer title="CPU Discard Pile" cards={[]} onClose={() => {}} />
        )
        expect(screen.getByText(/no cards discarded yet/i)).toBeInTheDocument()
    })

    it('calls onClose when the close button is clicked', () => {
        const onClose = vi.fn()
        render(
            <DiscardViewer title="Your Discard Pile" cards={[]} onClose={onClose} />
        )
        fireEvent.click(
            screen.getByRole('button', { name: /close discard viewer/i })
        )
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onClose when the overlay is clicked', () => {
        const onClose = vi.fn()
        render(
            <DiscardViewer
                title="Your Discard Pile"
                cards={[card(1, 'Ember')]}
                onClose={onClose}
            />
        )
        fireEvent.click(screen.getByRole('dialog'))
        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
