
import { BoardState, GameAction } from '@/types/game';
import { combineReducers, initialState } from './rootReducer';

export { initialState };

export const gameReducer = (state: BoardState, action: GameAction): BoardState => {
  return combineReducers(state, action);
};
