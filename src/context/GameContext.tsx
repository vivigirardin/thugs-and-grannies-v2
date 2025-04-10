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
  jailedPlayers: [], // Initialize the jailedPlayers array
  landmarks: {
    city: [], // Will be populated during board generation
    library: [],
    school: [],
    townhall: [],
  },
  currentPlayer: 0,
  activeMeeple: null,
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
  
  // Make sure creeps and politicians are included in teams
  let mergedTeams = [...teams];
  if (!teams.includes("creeps")) {
    mergedTeams.push("creeps");
  }
  if (!teams.includes("politicians")) {
    mergedTeams.push("politicians");
  }
  
  // Add initial police (5 for a larger board) - now with random positions
  const police: Position[] = [];
  const emptyCells: Position[] = [];
  
  // Find all empty cells
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      // Skip cells that would be used for landmarks
      const isLandmark = landmarks.some(landmark => {
        const { size, position } = landmark;
        return row >= position.row && row < position.row + size && 
               col >= position.col && col < position.col + size;
      });
      
      // Skip cells that would be used for exits
      const isExit = state.exits.some(exit => 
        exit.row === row && exit.col === col
      );
      
      if (!isLandmark && !isExit) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  // Randomly select 5 cells for police
  for (let i = 0; i < 5; i++) {
    if (emptyCells.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    police.push(emptyCells[randomIndex]);
    
    // Remove the selected cell so we don't pick it again
    emptyCells.splice(randomIndex, 1);
  }
  
  // Set police on the board
  police.forEach(pos => {
    state.cells[pos.row][pos.col].type = "police";
  });
  state.police = police;
  
  // Add initial grannies (3 for larger board)
  const grannies: Position[] = [
    { row: 3, col: 7 },
    { row: 7, col: 12 },
    { row: 12, col: 3 },
  ];
  
  grannies.forEach(pos => {
    state.cells[pos.row][pos.col].type = "granny";
  });
  state.grannies = grannies;
  
  // Create 5 players for both creeps and politicians teams
  const players = [];
  const creepsPositions = [
    { row: 8, col: 8 },
    { row: 8, col: 9 },
    { row: 8, col: 10 },
    { row: 8, col: 11 },
    { row: 8, col: 12 },
  ];
  
  const politiciansPositions = [
    { row: 12, col: 8 },
    { row: 12, col: 9 },
    { row: 12, col: 10 },
    { row: 12, col: 11 },
    { row: 12, col: 12 },
  ];
  
  // Add 5 creeps players
  for (let i = 0; i < 5; i++) {
    players.push({
      id: `creeps-${i}`,
      team: "creeps" as Team,
      position: creepsPositions[i],
      escaped: false,
      arrested: false,
    });
  }
  
  // Add 5 politicians players
  for (let i = 0; i < 5; i++) {
    players.push({
      id: `politicians-${i}`,
      team: "politicians" as Team,
      position: politiciansPositions[i],
      escaped: false,
      arrested: false,
    });
  }
  
  // Add any other selected teams (except creeps and politicians which we already added)
  let playerIndex = players.length;
  mergedTeams.filter(team => team !== "creeps" && team !== "politicians").forEach((team, index) => {
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
    
    players.push({
      id: `player-${playerIndex++}`,
      team,
      position,
      escaped: false,
      arrested: false,
    });
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
  state.activeMeeple = null;
  
  return state;
};

// Helper function to add new police officers to the board
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
  
  // Add 5 new police officers
  const newPolicePositions: Position[] = [];
  for (let i = 0; i < 5; i++) {
    if (emptyCells.length === 0) break;
    
    // Select a random empty cell
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const newPolicePos = emptyCells[randomIndex];
    
    newPolicePositions.push(newPolicePos);
    
    // Remove this cell from empty cells
    emptyCells.splice(randomIndex, 1);
  }
  
  // Add the new police
  newState.police = [...state.police, ...newPolicePositions];
  
  // Update the cell types
  newState.cells = [...state.cells];
  newPolicePositions.forEach(pos => {
    newState.cells[pos.row] = [...state.cells[pos.row]];
    newState.cells[pos.row][pos.col] = {
      ...state.cells[pos.row][pos.col],
      type: "police"
    };
  });
  
  return newState;
};

// Helper function to add new grannies to the board
const addNewGrannies = (state: BoardState): BoardState => {
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
    return state; // No empty cells to add grannies
  }
  
  // Add 3 new grannies
  const newGrannyPositions: Position[] = [];
  for (let i = 0; i < 3; i++) {
    if (emptyCells.length === 0) break;
    
    // Select a random empty cell
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const newGrannyPos = emptyCells[randomIndex];
    
    newGrannyPositions.push(newGrannyPos);
    
    // Remove this cell from empty cells
    emptyCells.splice(randomIndex, 1);
  }
  
  // Add the new grannies
  newState.grannies = [...state.grannies, ...newGrannyPositions];
  
  // Update the cell types
  newState.cells = [...state.cells];
  newGrannyPositions.forEach(pos => {
    newState.cells[pos.row] = [...state.cells[pos.row]];
    newState.cells[pos.row][pos.col] = {
      ...state.cells[pos.row][pos.col],
      type: "granny"
    };
  });
  
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

// Helper function to check if a player would be arrested by moving to position
const wouldBeArrested = (position: Position, policePositions: Position[]): boolean => {
  return policePositions.some(police => 
    police.row === position.row && police.col === position.col
  );
};

// Game reducer
const gameReducer = (state: BoardState, action: GameAction): BoardState => {
  switch (action.type) {
    case "ROLL_DICE":
      return {
        ...state,
        diceValue: Math.floor(Math.random() * 6) + 1,
      };
    
    case "SELECT_MEEPLE": {
      const selectedPlayer = state.players.find(player => player.id === action.playerId);
      
      // Make sure the player belongs to the current team
      if (!selectedPlayer || 
          selectedPlayer.team !== state.players[state.currentPlayer].team ||
          selectedPlayer.arrested || 
          selectedPlayer.escaped) {
        return state;
      }
      
      return {
        ...state,
        activeMeeple: action.playerId,
      };
    }
      
    case "MOVE_PLAYER": {
      // Now we use the activeMeeple instead of currentPlayer
      if (!state.activeMeeple) {
        return state; // No meeple selected
      }
      
      const selectedPlayerIndex = state.players.findIndex(p => p.id === state.activeMeeple);
      if (selectedPlayerIndex === -1) {
        return state; // Player not found
      }
      
      const selectedPlayer = state.players[selectedPlayerIndex];
      const newPosition = action.position;
      
      // Check if the move is valid
      const dx = Math.abs(newPosition.row - selectedPlayer.position.row);
      const dy = Math.abs(newPosition.col - selectedPlayer.position.col);
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
        newPlayers[selectedPlayerIndex] = {
          ...selectedPlayer,
          arrested: true,
        };
        
        // Clear old cell
        const oldPos = selectedPlayer.position;
        const newCells = [...state.cells];
        newCells[oldPos.row][oldPos.col] = {
          ...newCells[oldPos.row][oldPos.col],
          occupied: false,
          occupiedBy: undefined,
        };
        
        return {
          ...state,
          players: newPlayers,
          cells: newCells,
          activeMeeple: null,
          diceValue: 0,
        };
      }
      
      // Check for exit
      const isExit = state.exits.some(
        pos => pos.row === newPosition.row && pos.col === newPosition.col
      );
      
      // Update player position
      const newPlayers = [...state.players];
      
      // Clear old cell
      const oldPos = selectedPlayer.position;
      const newCells = [...state.cells];
      newCells[oldPos.row][oldPos.col] = {
        ...newCells[oldPos.row][oldPos.col],
        occupied: false,
        occupiedBy: undefined,
      };
      
      // Update player
      newPlayers[selectedPlayerIndex] = {
        ...selectedPlayer,
        position: newPosition,
        escaped: isExit,
      };
      
      // Update new cell (unless it's an exit)
      if (!isExit) {
        newCells[newPosition.row][newPosition.col] = {
          ...newCells[newPosition.row][newPosition.col],
          occupied: true,
          occupiedBy: selectedPlayer.id,
        };
      }
      
      // Check if game is over (all players from a team escaped or arrested)
      const remainingTeams = new Set<Team>();
      for (const player of newPlayers) {
        if (!player.arrested && !player.escaped) {
          remainingTeams.add(player.team);
        }
      }
      
      const allPlayersFinished = remainingTeams.size === 0;
      
      // If game is over, determine the winning team
      let winner: Team | null = null;
      if (allPlayersFinished) {
        const escapedCounts: Record<Team, number> = {
          creeps: 0,
          italian: 0,
          politicians: 0,
          japanese: 0,
        };
        
        for (const player of newPlayers) {
          if (player.escaped) {
            escapedCounts[player.team]++;
          }
        }
        
        let maxEscaped = 0;
        Object.entries(escapedCounts).forEach(([team, count]) => {
          if (count > maxEscaped) {
            maxEscaped = count;
            winner = team as Team;
          }
        });
      }
      
      return {
        ...state,
        cells: newCells,
        players: newPlayers,
        activeMeeple: null,
        diceValue: 0, // Reset dice after move
        gameStatus: allPlayersFinished ? "ended" : "playing",
        winner,
      };
    }
      
    case "NEXT_TURN": {
      let nextPlayer = (state.currentPlayer + 1) % state.players.length;
      const currentTeam = state.players[state.currentPlayer].team;
      
      // Find the first player of a different team
      while (state.players[nextPlayer].team === currentTeam) {
        nextPlayer = (nextPlayer + 1) % state.players.length;
      }
      
      // Check if the team is completely eliminated or escaped
      let teamEliminated = true;
      const nextTeam = state.players[nextPlayer].team;
      for (const player of state.players) {
        if (player.team === nextTeam && !player.arrested && !player.escaped) {
          teamEliminated = false;
          break;
        }
      }
      
      // If team is eliminated, find the next team
      if (teamEliminated) {
        const startingPlayer = nextPlayer;
        do {
          nextPlayer = (nextPlayer + 1) % state.players.length;
          if (nextPlayer === startingPlayer) {
            // All teams are eliminated or escaped, game over
            return {
              ...state,
              gameStatus: "ended",
            };
          }
        } while (state.players.every(p => 
          p.team === state.players[nextPlayer].team && (p.arrested || p.escaped)
        ));
      }
      
      // Increment turn count if we've gone through all players
      const turnCount = nextPlayer <= state.currentPlayer ? state.turnCount + 1 : state.turnCount;
      
      // Add new police officers every turn
      let newState = {
        ...state,
        currentPlayer: nextPlayer,
        activeMeeple: null,
        diceValue: 0, // Reset dice value
        turnCount,
      };
      
      // Add 5 new police officers every turn
      newState = addNewPolice(newState);
      
      // Add 3 new grannies every turn
      newState = addNewGrannies(newState);
      
      // Move existing grannies every 3rd turn
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
