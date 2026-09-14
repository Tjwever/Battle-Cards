import type { ThunkAction, Action } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit"
import playerReducer from "../features/player/playerSlice"
import cardReducer from "../features/cards/cardSlice"
import gameReducer from "../features/game/gameSlice"
import setupReducer from "../features/game/setupSlice"

export const store = configureStore({
  reducer: {
    player: playerReducer,
    card: cardReducer,
    game: gameReducer,
    setup: setupReducer,
  },
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
