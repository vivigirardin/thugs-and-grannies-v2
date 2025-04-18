
export type Team = "creeps" | "italian" | "politicians" | "japanese";

export type CellType = "path" | "exit" | "police" | "granny" | "empty" | "city" | "library" | "school" | "townhall" | "entrance" | "puppy";

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

export type CardType = 
  // General cards
  | "smoke_bomb"
  | "shortcut"
  | "fake_pass"
  | "distraction"
  | "switcheroo"
  // Creeps cards
  | "dumpster_dive"
  | "shiv"
  | "lookout"
  // Italian cards
  | "bribe"
  | "getaway_car"
  | "cover_story"
  // Politicians cards
  | "lobbyist"
  | "public_statement"
  | "red_tape"
  // Japanese cards
  | "shadow_step"
  | "meditation"
  | "honor_bound";

export interface Card {
  id: string;
  type: CardType;
  name: string;
  description: string;
  flavor: string;
  team?: Team; // If undefined, it's a general card
  used: boolean;
  icon: string; // Icon name for the card
}

export interface BoardState {
  cells: Square[][];
  players: Meeple[];
  police: Position[];
  grannies: Position[];
  puppies: Position[]; // Added puppies array
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
  immobilizedPlayers: string[]; // Track players who can't move due to puppies
  previousState: BoardState | null; // To store the state before a move for undo
  canUndo: boolean;
  cards: {
    deck: Card[];
    playerHands: Record<Team, Card[]>;
    activeEffects: {
      policeIgnore: string[]; // IDs of players immune to police
      grannyIgnore: string[]; // IDs of players who can pass through grannies
      policeImmobilized: boolean; // Police can't move
      policeExpansionDelay: boolean; // Police don't expand this round
      moveDiagonally: string | null; // ID of player who can move diagonally
      puppyImmunity: Position[]; // Positions of puppies that don't distract
      policeMoveLimited: boolean; // Police can't move more than 1 space
      skippedPlayers: string[]; // IDs of players who skip next turn
    };
    justDrawn: Card | null; // Card just drawn at the start of the turn
    tradingOffer: {
      from: Team | null;
      to: Team | null;
      card: Card | null;
    };
  };
}

export type GameAction = 
  | { type: "ROLL_DICE" }
  | { type: "MOVE_PLAYER"; position: Position }
  | { type: "SELECT_MEEPLE"; playerId: string }
  | { type: "DESELECT_MEEPLE" }
  | { type: "UNDO_MOVE" }
  | { type: "NEXT_TURN" }
  | { type: "START_GAME"; teams: Team[] }
  | { type: "RESET_GAME" }
  | { type: "PLAYER_CAUGHT"; playerId: string }
  | { type: "DRAW_CARD" }
  | { type: "USE_CARD"; cardId: string; targetId?: string; position?: Position }
  | { type: "KEEP_CARD" }
  | { type: "OFFER_TRADE"; fromTeam: Team; toTeam: Team; cardId: string }
  | { type: "ACCEPT_TRADE" }
  | { type: "DECLINE_TRADE" };
