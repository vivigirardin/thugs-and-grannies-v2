
import { BoardState, GameAction, Team } from '@/types/game';
import { generateInitialBoard } from '@/utils/boardUtils';
import { drawCard, keepCard, offerTrade, acceptTrade, declineTrade } from '@/utils/cardUtils';
import { useCard } from '@/utils/cardEffects';

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

export const gameReducer = (state: BoardState, action: GameAction): BoardState => {
  switch (action.type) {
    case "START_GAME":
      return generateInitialBoard(action.teams);
      
    case "ROLL_DICE":
      return {
        ...state,
        diceValue: Math.floor(Math.random() * 6) + 1,
        activeMeeple: null,
      };
      
    case "SELECT_MEEPLE":
      return {
        ...state,
        activeMeeple: action.playerId,
        previousState: state,
        canUndo: true,
      };
      
    case "DESELECT_MEEPLE":
      return {
        ...state,
        activeMeeple: null,
      };
      
    case "MOVE_PLAYER": {
      if (!state.activeMeeple) return state;
      
      const playerId = state.activeMeeple;
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) return state;
      
      const player = state.players[playerIndex];
      const oldPos = player.position;
      const newPos = action.position;
      
      const targetCell = state.cells[newPos.row][newPos.col];
      let nextPos = newPos;
      
      if (targetCell.type === "entrance" && targetCell.connectedTo) {
        nextPos = targetCell.connectedTo;
      }
      
      const updatedPlayers = [...state.players];
      updatedPlayers[playerIndex] = {
        ...player,
        position: nextPos,
      };
      
      const newCells = [...state.cells];
      
      newCells[oldPos.row][oldPos.col] = {
        ...state.cells[oldPos.row][oldPos.col],
        occupied: false,
        occupiedBy: undefined,
      };
      
      let escaped = false;
      if (state.cells[nextPos.row][nextPos.col].type === "exit") {
        updatedPlayers[playerIndex].escaped = true;
        escaped = true;
      } else {
        newCells[nextPos.row][nextPos.col] = {
          ...state.cells[nextPos.row][nextPos.col],
          occupied: true,
          occupiedBy: playerId,
        };
      }
      
      let gameStatus = state.gameStatus;
      let winner = state.winner;
      
      if (escaped) {
        const escapedCounts: Record<Team, number> = {
          gang: 0,
          mafia: 0,
          politicians: 0,
          cartel: 0,
        };
        
        updatedPlayers.forEach(p => {
          if (p.escaped) {
            escapedCounts[p.team]++;
          }
        });
        
        Object.entries(escapedCounts).forEach(([team, count]) => {
          if (count >= 3) {
            gameStatus = "ended";
            winner = team as Team;
          }
        });
      }
      
      return {
        ...state,
        players: updatedPlayers,
        cells: newCells,
        diceValue: 0,
        activeMeeple: null,
        gameStatus,
        winner,
      };
    }
      
    case "NEXT_TURN": {
      console.log("NEXT_TURN action dispatched");
      
      let newState = { 
        ...state,
        activeMeeple: null,
        diceValue: 0,
        turnCount: state.turnCount + 1,
        canUndo: false,
      };
    
      const resetActiveEffects = {
        policeIgnore: [],
        grannyIgnore: [],
        policeImmobilized: false,
        policeExpansionDelay: false,
        moveDiagonally: null,
        policeMoveLimited: false,
        skippedPlayers: [...state.cards.activeEffects.skippedPlayers],
      };
    
      let nextPlayerIndex = (state.currentPlayer + 1) % state.players.length;
      let loopCount = 0;
      const maxLoops = state.players.length;
    
      while (loopCount < maxLoops) {
        const nextPlayer = state.players[nextPlayerIndex];
        const isSkipped = resetActiveEffects.skippedPlayers.includes(nextPlayer.id);
    
        if (!nextPlayer.arrested && !nextPlayer.escaped && !isSkipped) {
          break; // Valid next player found
        }
    
        if (isSkipped) {
          // Remove skipped player from list (used once)
          resetActiveEffects.skippedPlayers = resetActiveEffects.skippedPlayers.filter(
            id => id !== nextPlayer.id
          );
        }
    
        nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
        loopCount++;
      }
    
      if (loopCount >= maxLoops) {
        const validPlayerIndex = state.players.findIndex(p => !p.arrested && !p.escaped);
        if (validPlayerIndex !== -1) {
          nextPlayerIndex = validPlayerIndex;
        }
      }

      console.log("Current player:", state.currentPlayer, "Next player:", nextPlayerIndex);
    
      return {
        ...newState,
        currentPlayer: nextPlayerIndex,
        cards: {
          ...newState.cards,
          activeEffects: resetActiveEffects,
          justDrawn: null,
        },
      };
    }
      
    case "UNDO_MOVE":
      if (state.previousState) {
        return {
          ...state.previousState,
          canUndo: false,
        };
      }
      return state;
      
    case "DRAW_CARD":
      if (state.cards.justDrawn || state.cards.deck.length === 0) {
        return state;
      }
      return drawCard(state);
      
    case "KEEP_CARD":
      return keepCard(state);
      
    case "USE_CARD":
      console.log("USE_CARD action dispatched", action.cardId);
      return useCard(state, action.cardId, action.targetId, action.position);
      
    case "OFFER_TRADE":
      return offerTrade(state, action.fromTeam, action.toTeam, action.cardId);
      
    case "ACCEPT_TRADE":
      return acceptTrade(state);
      
    case "DECLINE_TRADE":
      return declineTrade(state);
      
    default:
      return state;
  }
};
