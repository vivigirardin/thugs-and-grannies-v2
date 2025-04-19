
import { BoardState, Position, Square, Team } from "@/types/game";
import { generateSingleCard } from "./cardUtils";

const BOARD_SIZE = 20;

const PATH_DENSITY = 0.7;
const EXIT_COUNT = 6;
const ENTRANCE_COUNT = 4;
const POLICE_COUNT = 8;
const GRANNY_COUNT = 6;

const CITY_COUNT = 1;
const LIBRARY_COUNT = 1;
const SCHOOL_COUNT = 1;
const TOWNHALL_COUNT = 1;

const generateRandomPosition = (board: Square[][], avoidPositions: Position[] = []): Position => {
  let row, col;
  do {
    row = Math.floor(Math.random() * BOARD_SIZE);
    col = Math.floor(Math.random() * BOARD_SIZE);
  } while (board[row][col].type !== "path" || avoidPositions.some(pos => pos.row === row && pos.col === col));
  return { row, col };
};

const generatePath = (): Square => ({
  type: "path",
  position: { row: 0, col: 0 },
});

const generateExit = (position: Position): Square => ({
  type: "exit",
  position,
});

const generateEntrance = (position: Position, connectedTo: Position): Square => ({
  type: "entrance",
  position,
  connectedTo,
});

const generatePolice = (position: Position): Square => ({
  type: "police",
  position,
});

const generateGranny = (position: Position): Square => ({
  type: "granny",
  position,
});

const generateCity = (position: Position): Square => ({
  type: "city",
  position,
});

const generateLibrary = (position: Position): Square => ({
  type: "library",
  position,
});

const generateSchool = (position: Position): Square => ({
  type: "school",
  position,
});

const generateTownhall = (position: Position): Square => ({
  type: "townhall",
  position,
});

export const generateInitialBoard = (teams?: Team[]): BoardState => {
  let cells: Square[][] = Array.from({ length: BOARD_SIZE }, (_, row) =>
    Array.from({ length: BOARD_SIZE }, (_, col) => ({
      type: Math.random() < PATH_DENSITY ? "path" : "city",
      position: { row, col },
    }))
  );

  const exits: Position[] = [];
  for (let i = 0; i < EXIT_COUNT; i++) {
    const position = generateRandomPosition(cells, exits);
    cells[position.row][position.col] = generateExit(position);
    exits.push(position);
  }

  const entrances: Position[] = [];
  const entrancePositions: Position[] = [];
  for (let i = 0; i < ENTRANCE_COUNT; i++) {
    let position = generateRandomPosition(cells, [...exits, ...entrancePositions]);
    cells[position.row][position.col] = generateEntrance(position, exits[i % exits.length]);
    entrances.push(exits[i % exits.length]);
    entrancePositions.push(position);
  }

  const police: Position[] = [];
  for (let i = 0; i < POLICE_COUNT; i++) {
    const position = generateRandomPosition(cells, [...exits, ...entrancePositions, ...police]);
    cells[position.row][position.col] = generatePolice(position);
    police.push(position);
  }

  const grannies: Position[] = [];
  for (let i = 0; i < GRANNY_COUNT; i++) {
    const position = generateRandomPosition(cells, [...exits, ...entrancePositions, ...police, ...grannies]);
    cells[position.row][position.col] = generateGranny(position);
    grannies.push(position);
  }

  const cityPositions: Position[] = [];
  for (let i = 0; i < CITY_COUNT; i++) {
    const position = generateRandomPosition(cells, [...exits, ...entrancePositions, ...police, ...grannies, ...cityPositions]);
    cells[position.row][position.col] = generateCity(position);
    cityPositions.push(position);
  }

  const libraryPositions: Position[] = [];
  for (let i = 0; i < LIBRARY_COUNT; i++) {
    const position = generateRandomPosition(cells, [...exits, ...entrancePositions, ...police, ...grannies, ...cityPositions, ...libraryPositions]);
    cells[position.row][position.col] = generateLibrary(position);
    libraryPositions.push(position);
  }

  const schoolPositions: Position[] = [];
  for (let i = 0; i < SCHOOL_COUNT; i++) {
    const position = generateRandomPosition(cells, [...exits, ...entrancePositions, ...police, ...grannies, ...cityPositions, ...libraryPositions, ...schoolPositions]);
    cells[position.row][position.col] = generateSchool(position);
    schoolPositions.push(position);
  }

  const townhallPositions: Position[] = [];
  for (let i = 0; i < TOWNHALL_COUNT; i++) {
    const position = generateRandomPosition(cells, [...exits, ...entrancePositions, ...police, ...grannies, ...cityPositions, ...libraryPositions, ...schoolPositions, ...townhallPositions]);
    cells[position.row][position.col] = generateTownhall(position);
    townhallPositions.push(position);
  }

  const cityEntrances: Position[] = [];
  for (let i = 0; i < CITY_COUNT; i++) {
    cityEntrances.push(cityPositions[i % cityPositions.length]);
  }

  const libraryEntrances: Position[] = [];
  for (let i = 0; i < LIBRARY_COUNT; i++) {
    libraryEntrances.push(libraryPositions[i % libraryPositions.length]);
  }

  const schoolEntrances: Position[] = [];
  for (let i = 0; i < SCHOOL_COUNT; i++) {
    schoolEntrances.push(schoolPositions[i % schoolPositions.length]);
  }

  const townhallEntrances: Position[] = [];
  for (let i = 0; i < TOWNHALL_COUNT; i++) {
    townhallEntrances.push(townhallPositions[i % townhallPositions.length]);
  }

  const policeChains: Position[][] = [];

  const board: BoardState = {
    cells,
    players: [],
    police,
    grannies,
    exits,
    jailedPlayers: [],
    landmarks: {
      city: cityPositions,
      library: libraryPositions,
      school: schoolPositions,
      townhall: townhallPositions,
    },
    buildingEntrances: {
      city: cityEntrances,
      library: libraryEntrances, 
      school: schoolEntrances,
      townhall: townhallEntrances,
    },
    currentPlayer: 0,
    activeMeeple: null,
    diceValue: 0,
    gameStatus: "setup",
    winner: null,
    turnCount: 0,
    policeChains,
    immobilizedPlayers: [],
    previousState: null,
    canUndo: false,
    cards: {
      deck: Array.from({ length: 30 }, (_, i) => generateSingleCard(i)),
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
    turnState: {
      hasMoved: false,
    },
  };

  return board;
};

export const isPositionValid = (position: Position): boolean => {
  return position.row >= 0 && position.row < BOARD_SIZE && position.col >= 0 && position.col < BOARD_SIZE;
};
