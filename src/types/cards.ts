
import { Team, Position } from "./game";

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

export type CardType = 
  | "smoke_bomb" | "shortcut" | "fake_pass" | "distraction" | "switcheroo"
  | "dumpster_dive" | "shiv" | "lookout"
  | "bribe" | "getaway_car" | "cover_story"
  | "lobbyist" | "public_statement" | "red_tape"
  | "shadow_step" | "meditation" | "honor_bound"
  | "empty";

export interface CardState {
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
}
