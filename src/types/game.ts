
export type Team = "Gang" | "Mafia" | "Politicians" | "Cartel";

export interface Position {
  row: number;
  col: number;
}

export interface Square {
  type: "path" | "exit" | "entrance" | "police" | "granny" | "puppy" | "city" | "library" | "school" | "townhall";
  position: Position;
  occupied?: boolean;
  occupiedBy?: string;
  connectedTo?: Position;
}

export interface Meeple {
  id: string;
  team: Team;
  position: Position;
  escaped: boolean;
  arrested: boolean;
}

export type CardType = 
  | "smoke_bomb" | "shortcut" | "fake_pass" | "distraction" | "switcheroo"
  | "dumpster_dive" | "shiv" | "lookout"
  | "bribe" | "getaway_car" | "cover_story"
  | "lobbyist" | "public_statement" | "red_tape"
  | "shadow_step" | "meditation" | "honor_bound"
  | "empty";

export interface Card {
  id: string;
  type: CardType;
  name: string;
  description: string;
  flavor: string;
  icon: string;
  team?: Team;
  used: boolean;
}

export interface BoardState {
  cells: Square[][];
  players: Meeple[];
  police: Position[];
  grannies: Position[];
  puppies: Position[];
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
      puppyImmunity: Position[];
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

export interface GameAction {
  type: 
    | "START_GAME"
    | "ROLL_DICE"
    | "SELECT_MEEPLE"
    | "DESELECT_MEEPLE"
    | "MOVE_PLAYER"
    | "NEXT_TURN"
    | "UNDO_MOVE"
    | "DRAW_CARD"
    | "KEEP_CARD"
    | "USE_CARD"
    | "OFFER_TRADE"
    | "ACCEPT_TRADE"
    | "DECLINE_TRADE";
  teams?: Team[];
  playerId?: string;
  position?: Position;
  targetId?: string;
  cardId?: string;
  fromTeam?: Team;
  toTeam?: Team;
}
