
import React, { createContext, useContext, useReducer } from "react";
import { BoardState, GameAction, Position, Team } from "@/types/game";

// Initial board size
const BOARD_SIZE = 8;

// Initial game state
const initialState: BoardState = {
  cells: Array(BOARD_SIZE).fill(null).map((_, rowIndex) => 
    Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({
      type: "path",
      position: { row: rowIndex, col: colIndex },
      occupied: false,
    }))
  ),
  players: [],
  police: [],
  grannies: [],
  exits: [
    { row: 0, col: 0 },
    { row: 0, col: BOARD_SIZE - 1 },
    { row: BOARD_SIZE - 1, col: 0 },
    { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 },
  ],
  currentPlayer: 0,
  diceValue: 1,
  gameStatus: "setup",
  winner: null,
};

// Generate initial board with exits, police, and grannies
const generateInitialBoard = (teams: Team[]): BoardState => {
  const state = { ...initialState };
  
  // Set exit cells
  state.exits.forEach(exit => {
    state.cells[exit.row][exit.col].type = "exit";
  });
  
  // Add police (2 for now)
  const police: Position[] = [
    { row: Math.floor(BOARD_SIZE / 2) - 1, col: Math.floor(BOARD_SIZE / 2) - 1 },
    { row: Math.floor(BOARD_SIZE / 2), col: Math.floor(BOARD_SIZE / 2) },
  ];
  
  police.forEach(pos => {
    state.cells[pos.row][pos.col].type = "police";
  });
  state.police = police;
  
  // Add grannies (3 for now)
  const grannies: Position[] = [
    { row: 1, col: 3 },
    { row: 3, col: 6 },
    { row: 6, col: 2 },
  ];
  
  grannies.forEach(pos => {
    state.cells[pos.row][pos.col].type = "granny";
  });
  state.grannies = grannies;
  
  // Add players based on selected teams
  const players = teams.map((team, index) => {
    // Position players in different starting corners
    let position: Position;
    switch (index % 4) {
      case 0:
        position = { row: 1, col: 1 };
        break;
      case 1:
        position = { row: 1, col: BOARD_SIZE - 2 };
        break;
      case 2:
        position = { row: BOARD_SIZE - 2, col: 1 };
        break;
      case 3:
        position = { row: BOARD_SIZE - 2, col: BOARD_SIZE - 2 };
        break;
      default:
        position = { row: 1, col: 1 };
    }
    
    return {
      id: `player-${index}`,
      team,
      position,
      escaped: false,
      arrested: false,
    };
  });
  
  // Mark cells as occupied
  players.forEach(player => {
    const { row, col } = player.position;
    state.cells[row][col].occupied = true;
    state.cells[row][col].occupiedBy = player.id;
  });
  
  state.players = players;
  state.gameStatus = "playing";
  
  return state;
};

// Game reducer
const gameReducer = (state: BoardState, action: GameAction): BoardState => {
  switch (action.type) {
    case "ROLL_DICE":
      return {
        ...state,
        diceValue: Math.floor(Math.random() * 6) + 1,
      };
      
    case "MOVE_PLAYER": {
      const currentPlayer = state.players[state.currentPlayer];
      const newPosition = action.position;
      
      // Check if the move is valid
      const dx = Math.abs(newPosition.row - currentPlayer.position.row);
      const dy = Math.abs(newPosition.col - currentPlayer.position.col);
      const distance = dx + dy;
      
      if (distance > state.diceValue) {
        // Invalid move - too far
        return state;
      }
      
      // Check if cell is occupied
      if (state.cells[newPosition.row][newPosition.col].occupied) {
        // Can't move to an occupied cell
        return state;
      }
      
      // Check for police
      const isPolice = state.police.some(
        pos => pos.row === newPosition.row && pos.col === newPosition.col
      );
      
      if (isPolice) {
        // Player got arrested
        const newPlayers = [...state.players];
        newPlayers[state.currentPlayer] = {
          ...currentPlayer,
          arrested: true,
        };
        
        return {
          ...state,
          players: newPlayers,
        };
      }
      
      // Check for exit
      const isExit = state.exits.some(
        pos => pos.row === newPosition.row && pos.col === newPosition.col
      );
      
      // Update player position
      const newPlayers = [...state.players];
      
      // Clear old cell
      const oldPos = currentPlayer.position;
      const newCells = [...state.cells];
      newCells[oldPos.row][oldPos.col] = {
        ...newCells[oldPos.row][oldPos.col],
        occupied: false,
        occupiedBy: undefined,
      };
      
      // Update player
      newPlayers[state.currentPlayer] = {
        ...currentPlayer,
        position: newPosition,
        escaped: isExit,
      };
      
      // Update new cell (unless it's an exit)
      if (!isExit) {
        newCells[newPosition.row][newPosition.col] = {
          ...newCells[newPosition.row][newPosition.col],
          occupied: true,
          occupiedBy: currentPlayer.id,
        };
      }
      
      // Check if game is over (all players escaped or arrested)
      const allPlayersFinished = newPlayers.every(
        player => player.escaped || player.arrested
      );
      
      // If game is over, determine the winning team
      let winner: Team | null = null;
      if (allPlayersFinished) {
        const escapedPlayers = newPlayers.filter(player => player.escaped);
        if (escapedPlayers.length > 0) {
          // The team with the most escaped players wins
          const teamCounts: Record<Team, number> = {
            creeps: 0,
            italian: 0,
            politicians: 0,
            japanese: 0,
          };
          
          escapedPlayers.forEach(player => {
            teamCounts[player.team] += 1;
          });
          
          let maxEscaped = 0;
          Object.entries(teamCounts).forEach(([team, count]) => {
            if (count > maxEscaped) {
              maxEscaped = count;
              winner = team as Team;
            }
          });
        }
      }
      
      return {
        ...state,
        cells: newCells,
        players: newPlayers,
        gameStatus: allPlayersFinished ? "ended" : "playing",
        winner,
      };
    }
      
    case "NEXT_TURN": {
      let nextPlayer = (state.currentPlayer + 1) % state.players.length;
      
      // Skip arrested or escaped players
      while (
        (state.players[nextPlayer].arrested || state.players[nextPlayer].escaped) &&
        state.players.some(p => !p.arrested && !p.escaped)
      ) {
        nextPlayer = (nextPlayer + 1) % state.players.length;
      }
      
      return {
        ...state,
        currentPlayer: nextPlayer,
        diceValue: 0, // Reset dice value
      };
    }
      
    case "START_GAME":
      return generateInitialBoard(action.teams);
      
    case "RESET_GAME":
      return {
        ...initialState,
        cells: Array(BOARD_SIZE).fill(null).map((_, rowIndex) => 
          Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({
            type: "path",
            position: { row: rowIndex, col: colIndex },
            occupied: false,
          }))
        ),
      };
      
    default:
      return state;
  }
};

// Create context
interface GameContextType {
  state: BoardState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
