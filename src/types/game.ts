
export type SquareType = "path" | "exit" | "entrance" | "police" | "granny" | "city" | "library" | "school" | "townhall";

export interface Position {
  row: number;
  col: number;
}

export interface Square {
  type: SquareType;
  position: Position;
  occupied?: boolean;
  occupiedBy?: string;
  connectedTo?: Position;
}

export type Team = "gang" | "mafia" | "politicians" | "cartel";

export interface Meeple {
  id: string;
  team: Team;
  position: Position;
  escaped: boolean;
  arrested: boolean;
}

export interface BoardState {
  cells: Square[][];
  players: Meeple[];
  police: Position[];
  grannies: Position[];
  exits: Position[];
  jailedPlayers: string[];
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
  activeMeeple: string | null;
  diceValue: number;
  gameStatus: "setup" | "playing" | "ended";
  winner: Team | null;
  turnCount: number;
  policeChains: Position[][];
  immobilizedPlayers: string[];
  previousState: BoardState | null;
  canUndo: boolean;
  cards: {
    deck: Card[];
    playerHands: {
      [key in Team]: Card[];
    };
    activeEffects: {
      policeIgnore: string[];
      grannyIgnore: string[];
      policeImmobilized: boolean;
      policeExpansionDelay: boolean;
      moveDiagonally: string | null;
      policeMoveLimited: boolean;
      skippedPlayers: string[];
    };
    justDrawn: Card | null;
    tradingOffer: {
      from: Team | null;
      to: Team | null;
      card: Card | null;
    };
  };
}

export type CardType = 
  | "smoke_bomb" 
  | "shortcut" 
  | "fake_pass" 
  | "switcheroo" 
  | "dumpster_dive" 
  | "shiv"
  | "lookout" 
  | "bribe" 
  | "getaway_car" 
  | "cover_story" 
  | "lobbyist" 
  | "public_statement" 
  | "red_tape" 
  | "shadow_step" 
  | "meditation" 
  | "honor_bound"
  | "empty"; // Special type for empty deck message

export interface Card {
  id: string;
  type: CardType;
  name: string;
  description: string;
  flavor?: string;
  team?: Team;
  used: boolean;
  icon?: string;
}

export type GameAction =
  | { type: "START_GAME"; teams: Team[] }
  | { type: "ROLL_DICE" }
  | { type: "SELECT_MEEPLE"; playerId: string }
  | { type: "DESELECT_MEEPLE" }
  | { type: "MOVE_PLAYER"; position: Position }
  | { type: "NEXT_TURN" }
  | { type: "UNDO_MOVE" }
  | { type: "DRAW_CARD" }
  | { type: "KEEP_CARD" }
  | { type: "USE_CARD"; cardId: string; targetId?: string; position?: Position }
  | { type: "OFFER_TRADE"; fromTeam: Team; toTeam: Team; cardId: string }
  | { type: "ACCEPT_TRADE" }
  | { type: "DECLINE_TRADE" };
