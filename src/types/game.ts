
// Remove 'puppy' from Square type's type
export type SquareType = "path" | "exit" | "entrance" | "police" | "granny" | "city" | "library" | "school" | "townhall";

export interface Square {
  type: SquareType;
  position: Position;
  occupied?: boolean;
  occupiedBy?: string;
  connectedTo?: Position;
}

// Remove puppies from BoardState
export interface BoardState {
  cells: Square[][];
  players: Meeple[];
  police: Position[];
  grannies: Position[];
  // Removed puppies
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
      // Remove puppyImmunity
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
