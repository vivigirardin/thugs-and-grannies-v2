
import { BoardState, GameAction, Position, Meeple } from '@/types/game';

export const playerReducer = (state: BoardState, action: GameAction): Partial<BoardState> => {
  switch (action.type) {
    case "SELECT_MEEPLE":
      return {
        activeMeeple: action.playerId,
        previousState: state,
        canUndo: true,
      };
      
    case "DESELECT_MEEPLE":
      return {
        activeMeeple: null,
      };
      
    case "MOVE_PLAYER": {
      if (!state.activeMeeple) return {};
      
      const playerId = state.activeMeeple;
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) return {};
      
      const player = state.players[playerIndex];
      const oldPos = player.position;
      const newPos = action.position;
      
      // Check if the target cell is an exit
      const isExitCell = state.exits.some(exit => 
        exit.row === newPos.row && exit.col === newPos.col
      );
      
      const updatedPlayers = [...state.players];
      const newCells = [...state.cells];
      
      // Clear the old cell
      newCells[oldPos.row][oldPos.col] = {
        ...state.cells[oldPos.row][oldPos.col],
        occupied: false,
        occupiedBy: undefined,
      };
      
      // Handle escape
      if (isExitCell) {
        // Mark player as escaped and remove from board
        updatedPlayers[playerIndex] = {
          ...player,
          position: newPos,
          escaped: true,
        };
      } else {
        // Regular movement
        updatedPlayers[playerIndex] = {
          ...player,
          position: newPos,
        };
        
        newCells[newPos.row][newPos.col] = {
          ...state.cells[newPos.row][newPos.col],
          occupied: true,
          occupiedBy: playerId,
        };
      }
      
      // Check winning condition - team with 3 or more escaped members wins
      let gameStatus = state.gameStatus;
      let winner = state.winner;
      
      const escapedCounts = updatedPlayers.reduce((counts, p) => {
        if (p.escaped) {
          counts[p.team] = (counts[p.team] || 0) + 1;
        }
        return counts;
      }, {} as Record<string, number>);
      
      Object.entries(escapedCounts).forEach(([team, count]) => {
        if (count >= 3) {
          gameStatus = "ended";
          winner = team as any;
        }
      });
      
      return {
        players: updatedPlayers,
        cells: newCells,
        diceValue: 0,
        activeMeeple: null,
        gameStatus,
        winner,
      };
    }
      
    default:
      return {};
  }
};
