
import { Team, Card, CardType } from "@/types/game";

export const CARDS: Omit<Card, 'id' | 'used'>[] = [
  // General cards
  { 
    type: "bail" as CardType, 
    name: "Bail", 
    description: "Get one of your thugs back from prison. Place it at the start.", 
    flavor: "Steps: 9",
    icon: "unlock"
  },
  { 
    type: "thief" as CardType, 
    name: "Thief", 
    description: "Steal a card from another player.", 
    flavor: "Steps: 5",
    icon: "user-minus"
  },
  { 
    type: "favor" as CardType, 
    name: "Favor", 
    description: "Play a card on behalf of another player during their turn. Look at their cards and take one of your choice", 
    flavor: "Steps: 4",
    icon: "hand"
  },
  { 
    type: "redemption" as CardType, 
    name: "Redemption", 
    description: "Choose one opponent. Send their thug closest to their own starting square back to the start. Cannot be used as a Favor card. Thugs using Underground are immune.", 
    flavor: "Steps: 5",
    icon: "undo"
  },
  { 
    type: "buy_my_vote" as CardType, 
    name: "Buy My Vote", 
    description: "Pick up the top three cards from the deck. Choose one to keep, then place the two remaining cards at the bottom of the deck.", 
    flavor: "Steps: 4",
    icon: "vote"
  },
  { 
    type: "undercover" as CardType, 
    name: "Undercover", 
    description: "Exchange a granny for a police officer.", 
    flavor: "Steps: 5",
    icon: "user-check"
  },
  { 
    type: "thank_you_service" as CardType, 
    name: "Thank You For Your Service", 
    description: "Replace an officer for a granny", 
    flavor: "Steps: 6",
    icon: "shield"
  },
  { 
    type: "minister" as CardType, 
    name: "Minister", 
    description: "You can't get caught until your next turn", 
    flavor: "Steps: 6",
    icon: "briefcase"
  },
  { 
    type: "underground" as CardType, 
    name: "Underground", 
    description: "Move over officers or grannies. You can share a square with them. This thug cannot get caught until it is no longer sharing a square", 
    flavor: "Steps: 6",
    icon: "move-down"
  },
  { 
    type: "swat" as CardType, 
    name: "SWAT", 
    description: "Thugs can get caught by the police up to three squares away", 
    flavor: "Steps: 6",
    icon: "shield-alert"
  },
  { 
    type: "sick_leave" as CardType, 
    name: "Sick Leave", 
    description: "Can't increase the police chain from a chosen point", 
    flavor: "Steps: 9",
    icon: "bed"
  },
  { 
    type: "kick_granny" as CardType, 
    name: "Kick The Granny", 
    description: "Move a granny up to two squares. If she lands on a cop, place her on top of the cop — the square is now treated as a granny square, and the cop has no effect.", 
    flavor: "Steps: 9",
    icon: "person-standing"
  },
  { 
    type: "distraction" as CardType, 
    name: "Distraction", 
    description: "If one of your thugs get caught, move another thug 5 spaces immediately and pick a new card", 
    flavor: "Reactive card",
    icon: "alert-triangle"
  },
  { 
    type: "hands_up" as CardType, 
    name: "Hands Up", 
    description: "Choose one thug to freeze during their turn", 
    flavor: "Steps: 7",
    icon: "hand-raised"
  },
  { 
    type: "holidays" as CardType, 
    name: "Holidays", 
    description: "Cop is not placed during this turn", 
    flavor: "Timing matters",
    icon: "palm-tree"
  },
  { 
    type: "twin_thugs" as CardType, 
    name: "Twin Thugs", 
    description: "Two thugs can be moved the full dice roll on this turn. Two thugs only.", 
    flavor: "Double trouble",
    icon: "users"
  },
  { 
    type: "cop_toss" as CardType, 
    name: "Cop Toss", 
    description: "Move one cop up to two spaces. If the cop lands on a granny, place the cop on top of the granny — the square is now treated as a cop square, but it cannot be used to directly catch a thug.", 
    flavor: "Move the law",
    icon: "move"
  },
  { 
    type: "parkour" as CardType, 
    name: "Parkour", 
    description: "Jump over any obstacle — including buildings, cops, grannies, or thugs. Each jump costs 1 point from your die roll. After jumping, continue moving normally with your remaining points. Cannot be combined with The Breakdancer.", 
    flavor: "Example: Roll a 5, jump over 1 square, then move 4 squares normally.",
    icon: "zap"
  },
  { 
    type: "negotiator" as CardType, 
    name: "The Negotiator", 
    description: "Swap the positions of any two thugs on the board. They must not be in a start zone, out of the city, or in jail.", 
    flavor: "Deal maker",
    icon: "repeat"
  },
  { 
    type: "corruption" as CardType, 
    name: "Corruption", 
    description: "Replace a cop with one of your own thugs. Cop is discarded", 
    flavor: "Inside job",
    icon: "dollar-sign"
  },
  { 
    type: "breakdancer" as CardType, 
    name: "The Breakdancer", 
    description: "Move diagonally this turn", 
    flavor: "Steps: 5",
    icon: "corner-down-right"
  },
  { 
    type: "thug_fight" as CardType, 
    name: "Thug Fight", 
    description: "Thugs on the same square can fight. Roll the dice and move the thug that rolled the lowest back to the start.", 
    flavor: "May the best thug win",
    icon: "sword"
  },
];
