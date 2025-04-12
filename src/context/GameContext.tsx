import React, { createContext, useContext, useReducer } from "react";
import { BoardState, GameAction, Position, Team, Square, Meeple } from "@/types/game";
import { toast } from "@/hooks/use-toast";

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
  puppies: [],
  exits: [
    { row: 8, col: 0 },
    { row: 12, col: 0 },
    { row: 8, col: BOARD_SIZE - 1 },
    { row: 12, col: BOARD_SIZE - 1 },
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
};

// Define landmark properties
const landmarks = [
  { type: "city", size: 4, position: { row: 0, col: 2 } },
  { type: "library", size: 3, position: { row: 2, col: BOARD_SIZE - 4 } },
  { type: "school", size: 5, position: { row: BOARD_SIZE - 6, col: 2 } },
  { type: "townhall", size: 3, position: { row: BOARD_SIZE - 4, col: BOARD_SIZE - 4 } },
];

// Function to find suitable locations for building entrances
const findEntranceLocations = (buildingType: string, buildingPositions: Position[], cells: Square[][]): Position[] => {
  const potentialEntrances: Position[] = [];
  
  buildingPositions.forEach(pos => {
    const { row, col } = pos;
    
    const adjacentPositions = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];
    
    adjacentPositions.forEach(adjPos => {
      if (
        adjPos.row >= 0 && adjPos.row < BOARD_SIZE && 
        adjPos.col >= 0 && adjPos.col < BOARD_SIZE &&
        cells[adjPos.row][adjPos.col].type === "path" &&
        !cells[adjPos.row][adjPos.col].occupied
      ) {
        potentialEntrances.push(pos);
      }
    });
  });
  
  const shuffled = [...potentialEntrances].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(2, shuffled.length));
};

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
  
  const landmarkPositions: Record<string, Position[]> = {
    city: [],
    library: [],
    school: [],
    townhall: [],
  };
  
  landmarks.forEach(landmark => {
    const { type, size, position } = landmark;
    const positions: Position[] = [];
    
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const row = position.row + r;
        const col = position.col + c;
        
        if (row < BOARD_SIZE && col < BOARD_SIZE) {
          state.cells[row][col].type = type as any;
          positions.push({ row, col });
        }
      }
    }
    
    landmarkPositions[type] = positions;
  });
  
  state.landmarks = landmarkPositions as any;
  
  state.exits = [
    { row: 8, col: 0 },
    { row: 12, col: 0 },
    { row: 8, col: BOARD_SIZE - 1 },
    { row: 12, col: BOARD_SIZE - 1 },
  ];
  
  state.exits.forEach(exit => {
    state.cells[exit.row][exit.col].type = "exit";
  });
  
  const players = [];
  
  const getPositionsInsideBuilding = (building: string, count: number): Position[] => {
    const buildingCells = state.landmarks[building as keyof typeof state.landmarks];
    if (!buildingCells || buildingCells.length === 0) return [];
    
    const shuffled = [...buildingCells].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };
  
  const buildings = ['city', 'library', 'school', 'townhall'];
  
  teams.forEach((team, index) => {
    const buildingType = buildings[index % buildings.length];
    const positions = getPositionsInsideBuilding(buildingType, 5);
    
    positions.forEach((pos, playerIndex) => {
      if (playerIndex < 5) {
        players.push({
          id: `${team}-${playerIndex}`,
          team,
          position: pos,
          escaped: false,
          arrested: false,
        });
        
        state.cells[pos.row][pos.col].occupied = true;
        state.cells[pos.row][pos.col].occupiedBy = `${team}-${playerIndex}`;
      }
    });
  });
  
  state.players = players;
  
  const buildingEntrances: { [key: string]: Position[] } = {};
  
  Object.entries(state.landmarks).forEach(([type, positions]) => {
    const entrances = findEntranceLocations(type, positions, state.cells);
    
    if (entrances.length >= 2) {
      state.cells[entrances[0].row][entrances[0].col].type = "entrance";
      state.cells[entrances[0].row][entrances[0].col].connectedTo = entrances[1];
      
      state.cells[entrances[1].row][entrances[1].col].type = "entrance";
      state.cells[entrances[1].row][entrances[1].col].connectedTo = entrances[0];
      
      buildingEntrances[type] = entrances;
    }
  });
  
  state.buildingEntrances = buildingEntrances;
  
  const policeChains: Position[][] = [];
  const emptyCells: Position[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = state.cells[row][col];
      if (
        cell.type === "path" && 
        !cell.occupied &&
        !state.exits.some(exit => exit.row === row && exit.col === col)
      ) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  const centerRow = Math.floor(BOARD_SIZE / 2);
  const centerCol = Math.floor(BOARD_SIZE / 2);
  
  for (let chainIndex = 0; chainIndex < 2; chainIndex++) {
    const startPos = { 
      row: centerRow + (chainIndex === 0 ? -1 : 1), 
      col: centerCol + (chainIndex === 0 ? -1 : 1)
    };
    
    if (startPos.row >= 0 && startPos.row < BOARD_SIZE && 
        startPos.col >= 0 && startPos.col < BOARD_SIZE &&
        state.cells[startPos.row][startPos.col].type === "path" &&
        !state.cells[startPos.row][startPos.col].occupied) {
      
      const chain: Position[] = [startPos];
      
      for (let i = 0; i < 2; i++) {
        const lastPos = chain[chain.length - 1];
        const adjacentPositions = [
          { row: lastPos.row - 1, col: lastPos.col },
          { row: lastPos.row + 1, col: lastPos.col },
          { row: lastPos.row, col: lastPos.col - 1 },
          { row: lastPos.row, col: lastPos.col + 1 },
        ].filter(pos => 
          pos.row >= 0 && pos.row < BOARD_SIZE && 
          pos.col >= 0 && pos.col < BOARD_SIZE &&
          state.cells[pos.row][pos.col].type === "path" &&
          !state.cells[pos.row][pos.col].occupied
        );
        
        if (adjacentPositions.length > 0) {
          const nextPos = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
          chain.push(nextPos);
          
          const indexToRemove = emptyCells.findIndex(p => p.row === nextPos.row && p.col === nextPos.col);
          if (indexToRemove >= 0) {
            emptyCells.splice(indexToRemove, 1);
          }
        }
      }
      
      policeChains.push(chain);
    }
  }
  
  const police: Position[] = [];
  policeChains.forEach(chain => {
    chain.forEach(pos => {
      police.push(pos);
      state.cells[pos.row][pos.col].type = "police";
    });
  });
  
  state.police = police;
  state.policeChains = policeChains;
  
  const grannies: Position[] = [];
  for (let i = 0; i < 3; i++) {
    if (emptyCells.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    grannies.push(emptyCells[randomIndex]);
    
    emptyCells.splice(randomIndex, 1);
  }
  
  grannies.forEach(pos => {
    state.cells[pos.row][pos.col].type = "granny";
  });
  state.grannies = grannies;
  
  const puppies: Position[] = [];
  for (let i = 0; i < 2; i++) {
    if (emptyCells.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    puppies.push(emptyCells[randomIndex]);
    
    emptyCells.splice(randomIndex, 1);
  }
  
  puppies.forEach(pos => {
    state.cells[pos.row][pos.col].type = "puppy";
  });
  
  state.puppies = puppies;
  
  state.gameStatus = "playing";
  state.turnCount = 0;
  state.activeMeeple = null;
  state.diceValue = 0;
  
  return state;
};

const checkForPlayerCapture = (state: BoardState, newPolicePositions: Position[]): BoardState => {
  const newState = { ...state };
  let playerCaptured = false;
  
  newState.players = state.players.map(player => {
    if (player.arrested || player.escaped) return player;
    
    const isOnPolice = newPolicePositions.some(
      pos => pos.row === player.position.row && pos.col === player.position.col
    );
    
    if (isOnPolice) {
      playerCaptured = true;
      toast({
        title: "Player Caught!",
        description: `A ${player.team} player was caught by the police!`,
        variant: "destructive"
      });
      return { ...player, arrested: true };
    }
    return player;
  });
  
  if (playerCaptured) {
    newState.jailedPlayers = newState.players.filter(p => p.arrested);
    
    newState.players.forEach(player => {
      if (player.arrested && !state.players.find(p => p.id === player.id)?.arrested) {
        const { row, col } = player.position;
        newState.cells[row][col] = {
          ...newState.cells[row][col],
          occupied: false,
          occupiedBy: undefined
        };
      }
    });
  }
  
  return newState;
};

const addNewPolice = (state: BoardState): BoardState => {
  const newState = { ...state };
  
  const updatedChains = [...state.policeChains];
  const newPolicePositions: Position[] = [];
  
  updatedChains.forEach((chain, chainIndex) => {
    if (chain.length === 0) return;
    
    const lastOfficer = chain[chain.length - 1];
    
    const adjacentCells: Position[] = [];
    const potentialAdjacent = [
      { row: lastOfficer.row - 1, col: lastOfficer.col },
      { row: lastOfficer.row + 1, col: lastOfficer.col },
      { row: lastOfficer.row, col: lastOfficer.col - 1 },
      { row: lastOfficer.row, col: lastOfficer.col + 1 },
    ];
    
    potentialAdjacent.forEach(pos => {
      if (pos.row >= 0 && pos.row < BOARD_SIZE && 
          pos.col >= 0 && pos.col < BOARD_SIZE &&
          state.cells[pos.row][pos.col].type === "path" &&
          !state.cells[pos.row][pos.col].occupied) {
        adjacentCells.push(pos);
      }
    });
    
    if (adjacentCells.length === 0) {
      const nearbyPositions = [];
      for (let r = Math.max(0, lastOfficer.row - 2); r <= Math.min(BOARD_SIZE - 1, lastOfficer.row + 2); r++) {
        for (let c = Math.max(0, lastOfficer.col - 2); c <= Math.min(BOARD_SIZE - 1, lastOfficer.col + 2); c++) {
          if (r !== lastOfficer.row || c !== lastOfficer.col) {
            if (state.cells[r][c].type === "path" && !state.cells[r][c].occupied) {
              nearbyPositions.push({ row: r, col: c });
            }
          }
        }
      }
      
      for (let i = 0; i < 3 && nearbyPositions.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * nearbyPositions.length);
        const newPos = nearbyPositions[randomIndex];
        nearbyPositions.splice(randomIndex, 1);
        
        newPolicePositions.push(newPos);
        updatedChains[chainIndex] = [...updatedChains[chainIndex], newPos];
      }
    } else {
      for (let i = 0; i < 3 && adjacentCells.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * adjacentCells.length);
        const newPos = adjacentCells[randomIndex];
        adjacentCells.splice(randomIndex, 1);
        
        newPolicePositions.push(newPos);
        updatedChains[chainIndex] = [...updatedChains[chainIndex], newPos];
      }
    }
  });
  
  newState.cells = [...state.cells];
  newPolicePositions.forEach(pos => {
    newState.cells[pos.row] = [...state.cells[pos.row]];
    newState.cells[pos.row][pos.col] = {
      ...state.cells[pos.row][pos.col],
      type: "police"
    };
  });
  
  newState.policeChains = updatedChains;
  newState.police = [...state.police, ...newPolicePositions];
  
  return checkForPlayerCapture(newState, newPolicePositions);
};

const addNewGrannies = (state: BoardState): BoardState => {
  const newState = { ...state };
  
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
    return state;
  }
  
  const newGrannyPositions: Position[] = [];
  for (let i = 0; i < 3; i++) {
    if (emptyCells.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    newGrannyPositions.push(emptyCells[randomIndex]);
    
    emptyCells.splice(randomIndex, 1);
  }
  
  newState.grannies = [...state.grannies, ...newGrannyPositions];
  
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

const moveGrannies = (state: BoardState): BoardState => {
  const newState = { ...state };
  const newCells = JSON.parse(JSON.stringify(state.cells));
  const newGrannies: Position[] = [];
  
  state.grannies.forEach(granny => {
    const possibleMoves: Position[] = [
      { row: granny.row - 1, col: granny.col },
      { row: granny.row + 1, col: granny.col },
      { row: granny.row, col: granny.col - 1 },
      { row: granny.row, col: granny.col + 1 },
    ].filter(pos => 
      pos.row >= 0 && pos.row < BOARD_SIZE && 
      pos.col >= 0 && pos.col < BOARD_SIZE &&
      newCells[pos.row][pos.col].type === "path" &&
      !newCells[pos.row][pos.col].occupied
    );
    
    let newPos: Position;
    if (possibleMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      newPos = possibleMoves[randomIndex];
      
      newCells[granny.row][granny.col] = {
        ...newCells[granny.row][granny.col],
        type: "path"
      };
      
      newCells[newPos.row][newPos.col] = {
        ...newCells[newPos.row][newPos.col],
        type: "granny"
      };
    } else {
      newPos = { ...granny };
    }
    
    newGrannies.push(newPos);
  });
  
  newState.grannies = newGrannies;
  newState.cells = newCells;
  
  return newState;
};

const movePolice = (state: BoardState): BoardState => {
  const newState = { ...state };
  const newCells = JSON.parse(JSON.stringify(state.cells));
  const newPolicePositions: Position[] = [];
  const playersCaught: Meeple[] = [];
  
  state.police.forEach(police => {
    let closestPlayer: Meeple | null = null;
    let minDistance = Infinity;
    
    state.players.forEach(player => {
      if (!player.arrested && !player.escaped) {
        const distance = Math.abs(player.position.row - police.row) + 
                         Math.abs(player.position.col - police.col);
        if (distance < minDistance) {
          minDistance = distance;
          closestPlayer = player;
        }
      }
    });
    
    let newPos = { ...police };
    
    if (closestPlayer) {
      const possibleMoves: Position[] = [];
      
      if (closestPlayer.position.row < police.row) {
        possibleMoves.push({ row: police.row - 1, col: police.col });
      } else if (closestPlayer.position.row > police.row) {
        possibleMoves.push({ row: police.row + 1, col: police.col });
      }
      
      if (closestPlayer.position.col < police.col) {
        possibleMoves.push({ row: police.row, col: police.col - 1 });
      } else if (closestPlayer.position.col > police.col) {
        possibleMoves.push({ row: police.row, col: police.col + 1 });
      }
      
      const validMoves = possibleMoves.filter(pos => 
        pos.row >= 0 && pos.row < BOARD_SIZE && 
        pos.col >= 0 && pos.col < BOARD_SIZE &&
        newCells[pos.row][pos.col].type !== "entrance" &&
        !newState.police.some(p => p.row === pos.row && p.col === pos.col) &&
        !newPolicePositions.some(p => p.row === pos.row && p.col === pos.col)
      );
      
      if (validMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        newPos = validMoves[randomIndex];
      }
    }
    
    const targetCell = newCells[newPos.row][newPos.col];
    if (targetCell.occupied) {
      const player = state.players.find(p => p.id === targetCell.occupiedBy);
      if (player && !player.arrested && !player.escaped) {
        playersCaught.push(player);
      }
    }
    
    newCells[police.row][police.col] = {
      ...newCells[police.row][police.col],
      type: "path"
    };
    
    newCells[newPos.row][newPos.col] = {
      ...newCells[newPos.row][newPos.col],
      type: "police"
    };
    
    newPolicePositions.push(newPos);
  });
  
  newState.players = state.players.map(player => {
    if (playersCaught.some(p => p.id === player.id)) {
      toast({
        title: "Player Caught!",
        description: `A ${player.team} player was caught by the police!`,
        variant: "destructive"
      });
      return { ...player, arrested: true };
    }
    return player;
  });
  
  newState.jailedPlayers = newState.players.filter(p => p.arrested);
  
  playersCaught.forEach(player => {
    const { row, col } = player.position;
    newCells[row][col] = {
      ...newCells[row][col],
      occupied: false,
      occupiedBy: undefined
    };
  });
  
  newState.police = newPolicePositions;
  newState.cells = newCells;
  
  return newState;
};

const movePuppies = (state: BoardState): BoardState => {
  const newState = { ...state };
  const newCells = JSON.parse(JSON.stringify(state.cells));
  const newPuppies: Position[] = [];
  
  state.puppies.forEach(puppy => {
    const possibleMoves: Position[] = [
      { row: puppy.row - 1, col: puppy.col },
      { row: puppy.row + 1, col: puppy.col },
      { row: puppy.row, col: puppy.col - 1 },
      { row: puppy.row, col: puppy.col + 1 },
    ].filter(pos => 
      pos.row >= 0 && pos.row < BOARD_SIZE && 
      pos.col >= 0 && pos.col < BOARD_SIZE &&
      newCells[pos.row][pos.col].type === "path" &&
      !newCells[pos.row][pos.col].occupied
    );
    
    let newPos: Position;
    if (possibleMoves.length > 0) {
      const randomIndex = Math.floor(Math.random() * possibleMoves.length);
      newPos = possibleMoves[randomIndex];
      
      newCells[puppy.row][puppy.col] = {
        ...newCells[puppy.row][puppy.col],
        type: "path"
      };
      
      newCells[newPos.row][newPos.col] = {
        ...newCells[newPos.row][newPos.col],
        type: "puppy"
      };
    } else {
      newPos = { ...puppy };
    }
    
    newPuppies.push(newPos);
  });
  
  newState.puppies = newPuppies;
  newState.cells = newCells;
  
  return newState;
};

const updateImmobilizedPlayers = (state: BoardState): BoardState => {
  const newState = { ...state };
  const immobilizedPlayers: string[] = [];
  
  state.puppies.forEach(puppy => {
    const adjacentPositions = [
      { row: puppy.row - 1, col: puppy.col },
      { row: puppy.row + 1, col: puppy.col },
      { row: puppy.row, col: puppy.col - 1 },
      { row: puppy.row, col: puppy.col + 1 },
      { row: puppy.row - 1, col: puppy.col - 1 },
      { row: puppy.row - 1, col: puppy.col + 1 },
      { row: puppy.row + 1, col: puppy.col - 1 },
      { row: puppy.row + 1, col: puppy.col + 1 },
    ];
    
    adjacentPositions.forEach(pos => {
      if (pos.row >= 0 && pos.row < BOARD_SIZE && 
          pos.col >= 0 && pos.col < BOARD_SIZE) {
        
        const cell = state.cells[pos.row][pos.col];
        if (cell.occupiedBy) {
          immobilizedPlayers.push(cell.occupiedBy);
        }
      }
    });
  });
  
  newState.immobilizedPlayers = immobilizedPlayers;
  
  return newState;
};

const gameReducer = (state: BoardState, action: GameAction): BoardState => {
  switch (action.type) {
    case "ROLL_DICE":
      return {
        ...state,
        diceValue: Math.floor(Math.random() * 6) + 1,
      };
    
    case "SELECT_MEEPLE": {
      const selectedPlayer = state.players.find(player => player.id === action.playerId);
      
      if (!selectedPlayer || 
          selectedPlayer.team !== state.players[state.currentPlayer].team ||
          selectedPlayer.arrested || 
          selectedPlayer.escaped ||
          state.immobilizedPlayers.includes(selectedPlayer.id)) {
        
        if (selectedPlayer && state.immobilizedPlayers.includes(selectedPlayer.id)) {
          toast({
            title: "Can't Move!",
            description: `This meeple is distracted by a nearby puppy 🐶`,
            variant: "destructive"
          });
        }
        
        return state;
      }
      
      return {
        ...state,
        activeMeeple: action.playerId,
      };
    }
      
    case "MOVE_PLAYER": {
      if (!state.activeMeeple) {
        return state;
      }
      
      const selectedPlayerIndex = state.players.findIndex(p => p.id === state.activeMeeple);
      if (selectedPlayerIndex === -1) {
        return state;
      }
      
      const selectedPlayer = state.players[selectedPlayerIndex];
      const newPosition = action.position;
      
      const dx = Math.abs(newPosition.row - selectedPlayer.position.row);
      const dy = Math.abs(newPosition.col - selectedPlayer.position.col);
      const distance = dx + dy;
      
      const currentCell = state.cells[selectedPlayer.position.row][selectedPlayer.position.col];
      const targetCell = state.cells[newPosition.row][newPosition.col];
      
      let isEntranceMove = false;
      
      if (targetCell.type === "entrance" && targetCell.connectedTo) {
        const connectedPosition = targetCell.connectedTo;
        const connectedCell = state.cells[connectedPosition.row][connectedPosition.col];
        
        if (connectedCell.occupied) {
          return state;
        }
        
        isEntranceMove = true;
      } else if (distance > state.diceValue) {
        return state;
      }
      
      if (targetCell.occupied) {
        return state;
      }
      
      if (distance > 1 && !isEntranceMove) {
        const isHorizontalMove = selectedPlayer.position.row === newPosition.row;
        const isVerticalMove = selectedPlayer.position.col === newPosition.col;
        
        let pathBlocked = false;
        
        if (isHorizontalMove) {
          const startCol = Math.min(selectedPlayer.position.col, newPosition.col);
          const endCol = Math.max(selectedPlayer.position.col, newPosition.col);
          const row = selectedPlayer.position.row;
          
          for (let col = startCol + 1; col < endCol; col++) {
            if (state.cells[row][col].type === "granny") {
              pathBlocked = true;
              break;
            }
          }
        } else {
          const startRow = Math.min(selectedPlayer.position.row, newPosition.row);
          const endRow = Math.max(selectedPlayer.position.row, newPosition.row);
          const col = selectedPlayer.position.col;
          
          for (let row = startRow + 1; row < endRow; row++) {
            if (state.cells[row][col].type === "granny") {
              pathBlocked = true;
              break;
            }
          }
        }
        
        if (pathBlocked) {
          toast({
            title: "Can't Move!",
            description: "You can't move through a granny. Try going around!",
            variant: "destructive"
          });
          return state;
        }
      }
      
      if (targetCell.type === "police") {
        const newPlayers = [...state.players];
        newPlayers[selectedPlayerIndex] = {
          ...selectedPlayer,
          arrested: true,
        };
        
        const newJailedPlayers = [...state.jailedPlayers, newPlayers[selectedPlayerIndex]];
        
        const oldPos = selectedPlayer.position;
        const newCells = [...state.cells];
        newCells[oldPos.row][oldPos.col] = {
          ...newCells[oldPos.row][oldPos.col],
          occupied: false,
          occupiedBy: undefined,
        };
        
        toast({
          title: "Player Caught!",
          description: `Your ${selectedPlayer.team} player was caught by the police!`,
          variant: "destructive"
        });
        
        return {
          ...state,
          players: newPlayers,
          jailedPlayers: newJailedPlayers,
          cells: newCells,
          activeMeeple: null,
          diceValue: 0,
        };
      }
      
      const isExit = state.exits.some(
        pos => pos.row === newPosition.row && pos.col === newPosition.col
      );
      
      const newPlayers = [...state.players];
      
      const oldPos = selectedPlayer.position;
      const newCells = [...state.cells];
      newCells[oldPos.row][oldPos.col] = {
        ...newCells[oldPos.row][oldPos.col],
        occupied: false,
        occupiedBy: undefined,
      };
      
      if (isEntranceMove && targetCell.connectedTo) {
        const connectedPos = targetCell.connectedTo;
        
        newPlayers[selectedPlayerIndex] = {
          ...selectedPlayer,
          position: connectedPos,
        };
        
        newCells[connectedPos.row][connectedPos.col] = {
          ...newCells[connectedPos.row][connectedPos.col],
          occupied: true,
          occupiedBy: selectedPlayer.id,
        };
        
        toast({
          title: "Shortcut Used!",
          description: `Your ${selectedPlayer.team} player took a building shortcut!`,
        });
      } else {
        newPlayers[selectedPlayerIndex] = {
          ...selectedPlayer,
          position: newPosition,
          escaped: isExit,
        };
        
        if (!isExit) {
          newCells[newPosition.row][newPosition.col] = {
            ...newCells[newPosition.row][newPosition.col],
            occupied: true,
            occupiedBy: selectedPlayer.id,
          };
        } else {
          toast({
            title: "Player Escaped!",
            description: `Your ${selectedPlayer.team} player successfully escaped!`,
            variant: "default"
          });
        }
      }
      
      const remainingTeams = new Set<Team>();
      for (const player of newPlayers) {
        if (!player.arrested && !player.escaped) {
          remainingTeams.add(player.team);
        }
      }
      
      const allPlayersFinished = remainingTeams.size === 0;
      
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
        diceValue: 0,
        gameStatus: allPlayersFinished ? "ended" : "playing",
        winner,
      };
    }
      
    case "NEXT_TURN": {
      let nextPlayer = (state.currentPlayer + 1) % state.players.length;
      const currentTeam = state.players[state.currentPlayer].team;
      
      while (state.players[nextPlayer].team === currentTeam) {
        nextPlayer = (nextPlayer + 1) % state.players.length;
      }
      
      let teamEliminated = true;
      const nextTeam = state.players[nextPlayer].team;
      for (const player of state.players) {
        if (player.team === nextTeam && !player.arrested && !player.escaped) {
          teamEliminated = false;
          break;
        }
      }
      
      if (teamEliminated) {
        const startingPlayer = nextPlayer;
        do {
          nextPlayer = (nextPlayer + 1) % state.players.length;
          if (nextPlayer === startingPlayer) {
            return {
              ...state,
              gameStatus: "ended",
            };
          }
        } while (state.players.every(p => 
          p.team === state.players[nextPlayer].team && (p.arrested || p.escaped)
        ));
      }
      
      const turnCount = nextPlayer <= state.currentPlayer ? state.turnCount + 1 : state.turnCount;
      
      let newState = {
        ...state,
        currentPlayer: nextPlayer,
        activeMeeple: null,
        diceValue: 0,
        turnCount,
      };
      
      newState = movePolice(newState);
      
      if (turnCount % 2 === 0 && turnCount > 0) {
        newState = addNewPolice(newState);
      }
      
      if (turnCount % 5 === 0 && turnCount > 0) {
        newState = addNewGrannies(newState);
      }
      
      if (turnCount % 2 === 0 && turnCount > 0) {
        newState = moveGrannies(newState);
      }
      
      newState = movePuppies(newState);
      
      newState = updateImmobilizedPlayers(newState);
      
      return newState;
    }
      
    case "START_GAME": {
      const newState = generateInitialBoard(action.teams);
      return {
        ...newState,
        diceValue: 0
      };
    }
      
    case "RESET_GAME": {
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
    }
      
    case "PLAYER_CAUGHT": {
      const { playerId } = action;
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) {
        return state;
      }
      
      const player = state.players[playerIndex];
      const newPlayers = [...state.players];
      newPlayers[playerIndex] = {
        ...player,
        arrested: true,
      };
      
      const oldPos = player.position;
      const newCells = [...state.cells];
      newCells[oldPos.row][oldPos.col] = {
        ...newCells[oldPos.row][oldPos.col],
        occupied: false,
        occupiedBy: undefined,
      };
      
      const newJailedPlayers = [...state.jailedPlayers, newPlayers[playerIndex]];
      
      toast({
        title: "Player Caught!",
        description: `A ${player.team} player was caught by the police!`,
        variant: "destructive"
      });
      
      return {
        ...state,
        players: newPlayers,
        jailedPlayers: newJailedPlayers,
        cells: newCells,
        activeMeeple: null,
      };
    }
      
    default:
      return state;
  }
};

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
