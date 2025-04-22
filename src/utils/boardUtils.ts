import { BoardState, Team, Position, Square } from '@/types/game';
import { createCardDeck } from './cardUtils';

const BOARD_SIZE = 20;

const landmarks = [
  { type: "city", size: 4, position: { row: 0, col: 2 } },
  { type: "library", size: 3, position: { row: 2, col: BOARD_SIZE - 4 } },
  { type: "school", size: 5, position: { row: BOARD_SIZE - 6, col: 2 } },
  { type: "townhall", size: 3, position: { row: BOARD_SIZE - 4, col: BOARD_SIZE - 4 } },
];

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

export const generateInitialBoard = (teams: Team[]): BoardState => {
  const state: BoardState = {
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
      { row: 9, col: 0 },
      { row: 13, col: 0 },
      { row: 9, col: 9 },
      { row: 13, col: 19 },
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
        state.players.push({
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
  
  state.cards.deck = createCardDeck();
  state.gameStatus = "playing";
  
  return state;
};
