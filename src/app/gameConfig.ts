/**
 * Central game-balance constants. Single source of truth for the numbers that
 * define the rules, so they are not duplicated across slices.
 */

/** Maximum health a player can have; healing is clamped to this. */
export const MAX_HEALTH = 10

/** Maximum number of cards a player may hold in hand. */
export const MAX_HAND_SIZE = 5

/** Cards each player draws at the start of the game. */
export const INITIAL_DRAW_COUNT = 3

/** Action points each player starts each game with. */
export const STARTING_AP = 2
