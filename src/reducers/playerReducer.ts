
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
      }
      
      // Reset dice value to 0 and deselect meeple after move
      return {
        players: updatedPlayers,
        cells: newCells,
        diceValue: 0, // Important: Reset dice value after movement
        activeMeeple: null, // Important: Deselect meeple after movement
        gameStatus,
        winner,
      };
    }
      
    default:
      return {};
  }
};
