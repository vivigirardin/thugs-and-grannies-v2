
/**
 * Main game reducer that combines all sub-reducers
 * Implements immutable state update patterns
 */
import { BoardState, GameAction } from '@/types/game';
import { combineReducers, initialState } from './rootReducer';

export { initialState };

export const gameReducer = (state: BoardState, action: GameAction): BoardState => {
  // Create a new state object for each reduction
  const nextState = combineReducers(state, action);
  
  // Ensure we're not mutating the original state
  return Object.is(nextState, state) ? state : nextState;
};
