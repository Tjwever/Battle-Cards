import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit'
import { RootState } from '../../app/store'

export interface PlayerState {
    player: { health: number }
    cpu: { health: number }
}

const initialState: PlayerState = {
    player: { health: 10 },
    cpu: { health: 10 },
}

export const incrementHealth = createAction<{ amount: number; player: 'player' | 'cpu' }>('player/incrementHealth');
export const decrementHealth = createAction<{ amount: number; player: 'player' | 'cpu' }>('player/decrementHealth');

export const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
          .addCase(incrementHealth, (state, action: PayloadAction<{ amount: number; player: 'player' | 'cpu' }>) => {
            const { amount, player } = action.payload;
            if (player === 'player') {
              state.player.health += amount;
            } else if (player === 'cpu') {
              state.cpu.health += amount;
            }
          })
          .addCase(decrementHealth, (state, action: PayloadAction<{ amount: number; player: 'player' | 'cpu' }>) => {
            const { amount, player } = action.payload;
            if (player === 'player') {
              state.player.health -= amount;
            } else if (player === 'cpu') {
              state.cpu.health -= amount;
            }
          });
      }
})

// export const { incrementHealth, decrementHealth } = playerSlice.actions

export const playerHealth = (state: RootState) => state.player.player.health
export const cpuHealth = (state: RootState) => state.player.cpu.health
export default playerSlice.reducer
