import { Team, Card, CardType } from "@/types/game";

export const CARDS: Omit<Card, 'id' | 'used'>[] = [
  // General cards
  { 
    type: "smoke_bomb", 
    name: "Smoke Bomb", 
    description: "Avoid detection this turn. Police can't catch you.", 
    flavor: "Now you see me… now you don't.",
    icon: "bomb"
  },
  { 
    type: "shortcut", 
    name: "Shortcut", 
    description: "Move diagonally once this turn, even if normally not allowed.", 
    flavor: "Found a crack in the fence.",
    icon: "arrow-right"
  },
  { 
    type: "fake_pass", 
    name: "Fake Pass", 
    description: "Pass through a granny square once this turn.", 
    flavor: "Nice old lady. Didn't even notice.",
    icon: "user-minus-2"
  },
  { 
    type: "switcheroo", 
    name: "Switcheroo", 
    description: "Swap any two of your gang members on the board.", 
    flavor: "You take the left, I'll take the right.",
    icon: "switch-camera"
  },
  
  // Gang cards
  { 
    type: "dumpster_dive", 
    name: "Dumpster Dive", 
    description: "Hide in place for a turn – police and puppies ignore you.", 
    flavor: "Not glamorous, but it works.",
    team: "gang",
    icon: "user-minus-2"
  },
  { 
    type: "shiv", 
    name: "Shiv", 
    description: "Push an adjacent police officer back one space.", 
    flavor: "He'll think twice next time.",
    team: "gang",
    icon: "sword"
  },
  { 
    type: "lookout", 
    name: "Lookout", 
    description: "See where the puppies will move next round before anyone else.", 
    flavor: "Eyes everywhere.",
    team: "gang",
    icon: "eye"
  },
  
  // Mafia cards
  { 
    type: "bribe", 
    name: "Bribe", 
    description: "Delay police movement for one round.", 
    flavor: "Everyone's got a price.",
    team: "mafia",
    icon: "dollar-sign"
  },
  { 
    type: "getaway_car", 
    name: "Getaway Car", 
    description: "Move two gang members, 1 space each.", 
    flavor: "Hop in!",
    team: "mafia",
    icon: "car"
  },
  { 
    type: "cover_story", 
    name: "Cover Story", 
    description: "One gang member can move through 1 police square.", 
    flavor: "He's with me.",
    team: "mafia",
    icon: "user"
  },
  
  // Politicians cards
  { 
    type: "lobbyist", 
    name: "Lobbyist", 
    description: "Police delay their expansion by one round.", 
    flavor: "We're postponing this due to a press conference.",
    team: "politicians",
    icon: "clipboard-list"
  },
  { 
    type: "public_statement", 
    name: "Public Statement", 
    description: "Choose 1 opponent's gang member to skip their next turn.", 
    flavor: "That's a scandal waiting to happen.",
    team: "politicians",
    icon: "speaker-off"
  },
  { 
    type: "red_tape", 
    name: "Red Tape", 
    description: "Police can't move more than 1 space this round.", 
    flavor: "We'll need a permit for that...",
    team: "politicians",
    icon: "file-warning"
  },
  
  // Cartel cards
  { 
    type: "shadow_step", 
    name: "Shadow Step", 
    description: "Move through 1 granny square this turn.", 
    flavor: "No sound. No trace.",
    team: "cartel",
    icon: "notepad-text"
  },
  { 
    type: "meditation", 
    name: "Meditation", 
    description: "Reroll your dice once this turn.", 
    flavor: "Still the mind. Try again.",
    team: "cartel",
    icon: "dice-5"
  },
  { 
    type: "honor_bound", 
    name: "Honor Bound", 
    description: "If a gang member is caught, immediately move another one 3 spaces.", 
    flavor: "Their sacrifice won't be in vain.",
    team: "cartel",
    icon: "fist"
  },
].filter(card => card.type !== "distraction");
