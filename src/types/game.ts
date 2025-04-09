
export type Team = "creeps" | "italian" | "politicians" | "japanese";

export type CellType = "path" | "exit" | "police" | "granny" | "empty";

export interface Position {
  row: number;
  col: number;
}

export interface Player {
  id: string;
  team: Team;
  position: Position;
  escaped: boolean;
  arrested: boolean;
}

export interface Cell {
  type: CellType;
  position: Position;
  occupied: boolean;
  occupiedBy?: string; // player id
}

export interface BoardState {
  cells: Cell[][];
  players: Player[];
  police: Position[];
  grannies: Position[];
  exits: Position[];
  currentPlayer: number;
  diceValue: number;
  gameStatus: "setup" | "playing" | "ended";
  winner: Team | null;
}

export type GameAction = 
  | { type: "ROLL_DICE" }
  | { type: "MOVE_PLAYER"; position: Position }
  | { type: "NEXT_TURN" }
  | { type: "START_GAME"; teams: Team[] }
  | { type: "RESET_GAME" };
