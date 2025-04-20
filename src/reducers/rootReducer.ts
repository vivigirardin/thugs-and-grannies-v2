
import { BoardState, GameAction } from '@/types/game';
import { playerReducer } from './playerReducer';
import { cardReducer } from './cardReducer';
import { gameStateReducer } from './gameStateReducer';

export const combineReducers = (state: BoardState, action: GameAction): BoardState => {
  // Get partial state updates from each reducer
  const playerUpdates = playerReducer(state, action);
  const cardUpdates = cardReducer(state, action);
  const gameStateUpdates = gameStateReducer(state, action);

  // Combine all updates into a new state
  return {
    ...state,
    ...playerUpdates,
    ...cardUpdates,
    ...gameStateUpdates,
  };
};

export const initialState: BoardState = {
  cells: Array(20).fill(null).map((_, rowIndex) => 
    Array(20).fill(null).map((_, colIndex) => ({
      type: "path",
      position: { row: rowIndex, col: colIndex },
      occupied: false,
    }))
  ),
  players: [],
  police: [],
  grannies: [],
  exits: [
    { row: 8, col: 0 },
    { row: 12, col: 0 },
    { row: 8, col: 19 },
    { row: 12, col: 19 },
  ],
  jailedPlayers: [],
  landmarks: {
    city: [],
    library: [],
    school: [],
    townhall: [],
  },
  buildingEntrances: {},
  currentPlayer: 0,
  activeMeeple: null,
  diceValue: 0,
  gameStatus: "setup",
  winner: null,
  turnCount: 0,
  policeChains: [],
  immobilizedPlayers: [],
  previousState: null,
  canUndo: false,
  cards: {
    deck: [],
    playerHands: {
      gang: [],
      mafia: [],
      politicians: [],
      cartel: [],
    },
    activeEffects: {
      policeIgnore: [],
      grannyIgnore: [],
      policeImmobilized: false,
      policeExpansionDelay: false,
      moveDiagonally: null,
      policeMoveLimited: false,
      skippedPlayers: [],
    },
    justDrawn: null,
    tradingOffer: {
      from: null,
      to: null,
      card: null,
    },
  },
};
