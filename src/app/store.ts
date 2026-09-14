import type { ThunkAction, Action } from "@reduxjs/toolkit";
import { configureStore, combineReducers } from "@reduxjs/toolkit"
import playerReducer from "../features/player/playerSlice"
import cardReducer from "../features/cards/cardSlice"
import gameReducer from "../features/game/gameSlice"
import setupReducer from "../features/game/setupSlice"
import statsReducer from "../features/game/statsSlice"
import { loadState, saveState, throttle } from "./persistence"

const rootReducer = combineReducers({
  player: playerReducer,
  card: cardReducer,
  game: gameReducer,
  setup: setupReducer,
  stats: statsReducer,
})

// Derived from the root reducer (not the store instance) so it does not depend
// on preloadedState — that would create a type cycle with loadState().
export type RootState = ReturnType<typeof rootReducer>

export const store = configureStore({
  reducer: rootReducer,
  preloadedState: loadState(),
})

// Persist a throttled snapshot of state on every change so the win-loss record,
// deck preference, and an in-progress game survive a reload.
store.subscribe(
  throttle(() => saveState(store.getState()), 500)
)

export type AppDispatch = typeof store.dispatch
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
