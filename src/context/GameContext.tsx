import React, { createContext, useContext, useReducer } from "react";
import { BoardState, GameAction, Position, Team } from "@/types/game";

// Initial board size
const BOARD_SIZE = 20;

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
    { row: 0, col: 5 },
    { row: 5, col: 0 },
    { row: BOARD_SIZE - 1, col: 15 },
    { row: 15, col: BOARD_SIZE - 1 },
  ],
  landmarks: {
    city: [], // Will be populated during board generation
    library: [],
    school: [],
    townhall: [],
  },
  currentPlayer: 0,
  diceValue: 1,
  gameStatus: "setup",
  winner: null,
  turnCount: 0,
};

// Define landmark properties
const landmarks = [
  { type: "city", size: 4, position: { row: 0, col: 2 } }, // 4x4 city at top-left near exit
  { type: "library", size: 3, position: { row: 2, col: BOARD_SIZE - 4 } }, // 3x3 library at top-right
  { type: "school", size: 5, position: { row: BOARD_SIZE - 6, col: 2 } }, // 5x5 school at bottom-left
  { type: "townhall", size: 3, position: { row: BOARD_SIZE - 4, col: BOARD_SIZE - 4 } }, // 3x3 townhall at bottom-right
];

// Generate initial board with exits, police, grannies, and landmarks
const generateInitialBoard = (teams: Team[]): BoardState => {
  const state = { ...initialState };
  state.cells = Array(BOARD_SIZE).fill(null).map((_, rowIndex) => 
    Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({
      type: "path",
      position: { row: rowIndex, col: colIndex },
      occupied: false,
    }))
  );
  
  // Set landmarks and keep track of their positions
  const landmarkPositions: Record<string, Position[]> = {
    city: [],
    library: [],
    school: [],
    townhall: [],
  };
  
  landmarks.forEach(landmark => {
    const { type, size, position } = landmark;
    const positions: Position[] = [];
    
    // Place the landmark on the board
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const row = position.row + r;
        const col = position.col + c;
        
        // Make sure we don't go out of bounds
        if (row < BOARD_SIZE && col < BOARD_SIZE) {
          state.cells[row][col].type = type as any;
          positions.push({ row, col });
        }
      }
    }
    
    // Store the positions for this landmark type
    landmarkPositions[type] = positions;
  });
  
  state.landmarks = landmarkPositions as any;
  
  // Set exit cells (they should be around landmarks but accessible)
  state.exits.forEach(exit => {
    state.cells[exit.row][exit.col].type = "exit";
  });
  
  // Add police (4 for a larger board)
  const police: Position[] = [
    { row: Math.floor(BOARD_SIZE / 2) - 3, col: Math.floor(BOARD_SIZE / 2) - 3 },
    { row: Math.floor(BOARD_SIZE / 2) + 2, col: Math.floor(BOARD_SIZE / 2) + 2 },
    { row: Math.floor(BOARD_SIZE / 2) - 3, col: Math.floor(BOARD_SIZE / 2) + 2 },
    { row: Math.floor(BOARD_SIZE / 2) + 2, col: Math.floor(BOARD_SIZE / 2) - 3 },
  ];
  
  police.forEach(pos => {
    state.cells[pos.row][pos.col].type = "police";
  });
  state.police = police;
  
  // Add grannies (6 for larger board)
  const grannies: Position[] = [
    { row: 3, col: 7 },
    { row: 7, col: 12 },
    { row: 12, col: 3 },
    { row: 16, col: 7 },
    { row: 7, col: 16 },
    { row: 12, col: 12 },
  ];
  
  grannies.forEach(pos => {
    state.cells[pos.row][pos.col].type = "granny";
  });
  state.grannies = grannies;
  
  // Add players based on selected teams
  const players = teams.map((team, index) => {
    // Position players in different starting positions away from landmarks
    let position: Position;
    switch (index % 4) {
      case 0:
        position = { row: 10, col: 10 };
        break;
      case 1:
        position = { row: 10, col: BOARD_SIZE - 10 };
        break;
      case 2:
        position = { row: BOARD_SIZE - 10, col: 10 };
        break;
      case 3:
        position = { row: BOARD_SIZE - 10, col: BOARD_SIZE - 10 };
        break;
      default:
        position = { row: 10, col: 10 };
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
  state.turnCount = 0;
  
  return state;
};

// Helper function to add a new police officer to the board
const addNewPolice = (state: BoardState): BoardState => {
  const newState = { ...state };
  
  // Find a random empty cell that's not an exit or already occupied
  const emptyCells: Position[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = state.cells[row][col];
      if (cell.type === "path" && !cell.occupied) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  if (emptyCells.length === 0) {
    return state; // No empty cells to add police
  }
  
  // Select a random empty cell
  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const newPolicePos = emptyCells[randomIndex];
  
  // Add the new police
  newState.police = [...state.police, newPolicePos];
  
  // Update the cell type
  newState.cells = [...state.cells];
  newState.cells[newPolicePos.row] = [...state.cells[newPolicePos.row]];
  newState.cells[newPolicePos.row][newPolicePos.col] = {
    ...state.cells[newPolicePos.row][newPolicePos.col],
    type: "police"
  };
  
  return newState;
};

// Helper function to move grannies
const moveGrannies = (state: BoardState): BoardState => {
  const newState = { ...state };
  const newCells = JSON.parse(JSON.stringify(state.cells)); // Deep copy
  const newGrannies: Position[] = [];
  
  // For each granny, try to move in a random direction
  state.grannies.forEach(granny => {
    // Get possible moves (up, down, left, right)
    const possibleMoves: Position[] = [
      { row: granny.row - 1, col: granny.col }, // up
      { row: granny.row + 1, col: granny.col }, // down
      { row: granny.row, col: granny.col - 1 }, // left
      { row: granny.row, col: granny.col + 1 }, // right
    ].filter(pos => 
      pos.row >= 0 && pos.row < BOARD_SIZE && 
      pos.col >= 0 && pos.col < BOARD_SIZE &&
      newCells[pos.row][pos.col].type === "path" &&
      !newCells[pos.row][pos.col].occupied
    );
    
    // If there are possible moves, select one randomly
    let newPos: Position;
    if (possibleMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      newPos = possibleMoves[randomIndex];
      
      // Update the old cell
      newCells[granny.row][granny.col] = {
        ...newCells[granny.row][granny.col],
        type: "path"
      };
      
      // Update the new cell
      newCells[newPos.row][newPos.col] = {
        ...newCells[newPos.row][newPos.col],
        type: "granny"
      };
    } else {
      // Granny can't move, keep the same position
      newPos = { ...granny };
    }
    
    newGrannies.push(newPos);
  });
  
  newState.grannies = newGrannies;
  newState.cells = newCells;
  
  return newState;
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
      
      // Increment turn count if we've gone through all players
      const turnCount = nextPlayer <= state.currentPlayer ? state.turnCount + 1 : state.turnCount;
      
      // Add new police officer every turn
      let newState = {
        ...state,
        currentPlayer: nextPlayer,
        diceValue: 0, // Reset dice value
        turnCount,
      };
      
      // Add a new police officer every turn
      newState = addNewPolice(newState);
      
      // Move grannies every 3rd turn
      if (turnCount % 3 === 0 && turnCount > 0) {
        newState = moveGrannies(newState);
      }
      
      return newState;
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
