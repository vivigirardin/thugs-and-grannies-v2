
export type Team = "creeps" | "italian" | "politicians" | "japanese";

export type CellType = "path" | "exit" | "police" | "granny" | "empty" | "city" | "library" | "school" | "townhall" | "entrance";

export interface Position {
  row: number;
  col: number;
}

export interface Meeple {
  id: string;
  team: Team;
  position: Position;
  escaped: boolean;
  arrested: boolean;
}

export interface Square {
  type: CellType;
  position: Position;
  occupied: boolean;
  occupiedBy?: string; // player id
  size?: number; // For landmarks like city, library, etc.
  connectedTo?: Position; // For entrances/exits within buildings
}

export interface BoardState {
  cells: Square[][];
  players: Meeple[];
  police: Position[];
  grannies: Position[];
  exits: Position[];
  jailedPlayers: Meeple[]; // New property to track jailed players
  landmarks: {
    city: Position[];
    library: Position[];
    school: Position[];
    townhall: Position[];
  };
  buildingEntrances: {
    [key: string]: Position[];
  };
  currentPlayer: number;
  activeMeeple: string | null; // ID of the currently selected meeple
  diceValue: number;
  gameStatus: "setup" | "playing" | "ended";
  winner: Team | null;
  turnCount: number;
  policeChains: Position[][]; // Added to track chains of police
}

export type GameAction = 
  | { type: "ROLL_DICE" }
  | { type: "MOVE_PLAYER"; position: Position }
  | { type: "SELECT_MEEPLE"; playerId: string }
  | { type: "NEXT_TURN" }
  | { type: "START_GAME"; teams: Team[] }
  | { type: "RESET_GAME" }
  | { type: "PLAYER_CAUGHT"; playerId: string };
