
import { Team, Card, CardType } from "@/types/game";

export const CARDS: Omit<Card, 'id' | 'used'>[] = [
  { 
    type: "bail" as CardType, 
    name: "BAIL",
    title: "BAIL",
    description: "Get one of your thugs back from prison. Place it at the start.", 
    flavor: "Steps: 9",
    icon: "unlock",
    backgroundImage: "https://c4.wallpaperflare.com/wallpaper/215/245/188/hand-handcuffs-tuxedo-wallpaper-preview.jpg"
  },
  { 
    type: "thief" as CardType, 
    name: "THIEF",
    title: "THIEF",
    description: "Steal a card from another player.", 
    flavor: "Steps: 5",
    icon: "user-minus",
    backgroundImage: "https://images.unsplash.com/photo-1551376347-075b0121a65b?fit=crop&w=600&q=80"
  },
  { 
    type: "favor" as CardType, 
    name: "FAVOR 🔪",
    title: "FAVOR 🔪",
    description: "Play a card on behalf of another player during their turn. Look at their cards and take one of your choice", 
    flavor: "Steps: 4",
    icon: "hand",
    backgroundImage: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?fit=crop&w=600&q=80"
  },
  { 
    type: "redemption" as CardType, 
    name: "REDEMPTION",
    title: "REDEMPTION",
    description: "Choose one opponent. Send their thug closest to their own starting square back to the start. Cannot be used as a Favor card. Thugs using Underground are immune.", 
    flavor: "Steps: 5",
    icon: "undo",
    backgroundImage: "https://images.unsplash.com/photo-1536431311719-398b6704d4cc?fit=crop&w=600&q=80"
  },
  { 
    type: "buy_my_vote" as CardType, 
    name: "BUY MY VOTE",
    title: "BUY MY VOTE",
    description: "Pick up the top three cards from the deck. Choose one to keep, then place the two remaining cards at the bottom of the deck.", 
    flavor: "Steps: 4",
    icon: "vote",
    backgroundImage: "https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?fit=crop&w=600&q=80"
  },
  { 
    type: "undercover" as CardType, 
    name: "UNDERCOVER",
    title: "UNDERCOVER",
    description: "Exchange a granny for a police officer.", 
    flavor: "Steps: 5",
    icon: "user-check",
    backgroundImage: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?fit=crop&w=600&q=80"
  },
  { 
    type: "thank_you_service" as CardType, 
    name: "THANK YOU FOR YOUR SERVICE",
    title: "THANK YOU FOR YOUR SERVICE",
    description: "Replace an officer for a granny", 
    flavor: "Steps: 6",
    icon: "shield",
    backgroundImage: "https://images.unsplash.com/photo-1587048907384-6ad0d5a1c9c0?fit=crop&w=600&q=80"
  },
  { 
    type: "minister" as CardType, 
    name: "MINISTER",
    title: "MINISTER",
    description: "You can't get caught until your next turn", 
    flavor: "Steps: 6",
    icon: "briefcase",
    backgroundImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&q=80"
  },
  { 
    type: "underground" as CardType, 
    name: "UNDERGROUND",
    title: "UNDERGROUND",
    description: "Move over officers or grannies. You can share a square with them. This thug cannot get caught until it is no longer sharing a square", 
    flavor: "Steps: 6",
    icon: "move-down",
    backgroundImage: "https://images.unsplash.com/photo-1485628390555-1a7bd503f9fe?fit=crop&w=600&q=80"
  },
  { 
    type: "swat" as CardType, 
    name: "SWAT 🔪",
    title: "SWAT 🔪",
    description: "Thugs can get caught by the police up to three squares away", 
    flavor: "Steps: 6",
    icon: "shield-alert",
    backgroundImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?fit=crop&w=600&q=80"
  },
  { 
    type: "sick_leave" as CardType, 
    name: "SICK LEAVE",
    title: "SICK LEAVE",
    description: "Can't increase the police chain from a chosen point", 
    flavor: "Steps: 9",
    icon: "bed",
    backgroundImage: "https://images.unsplash.com/photo-1584982751601-97dcc096659c?fit=crop&w=600&q=80"
  },
  { 
    type: "kick_granny" as CardType, 
    name: "KICK THE GRANNY",
    title: "KICK THE GRANNY",
    description: "Move a granny up to two squares. If she lands on a cop, place her on top of the cop — the square is now treated as a granny square, and the cop has no effect.", 
    flavor: "Steps: 9",
    icon: "person-standing",
    backgroundImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&w=600&q=80"
  },
  { 
    type: "distraction" as CardType, 
    name: "DISTRACTION 🔪",
    title: "DISTRACTION 🔪",
    description: "If one of your thugs get caught, move another thug 5 spaces immediately and pick a new card", 
    flavor: "Reactive card",
    icon: "alert-triangle",
    backgroundImage: "https://images.unsplash.com/photo-1525442304055-154128b7f311?fit=crop&w=600&q=80"
  },
  { 
    type: "hands_up" as CardType, 
    name: "HANDS UP 🔪",
    title: "HANDS UP 🔪",
    description: "Choose one thug to freeze during their turn", 
    flavor: "Steps: 7",
    icon: "hand-raised",
    backgroundImage: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?fit=crop&w=600&q=80"
  },
  { 
    type: "holidays" as CardType, 
    name: "HOLIDAYS 🔪",
    title: "HOLIDAYS 🔪",
    description: "Cop is not placed during this turn", 
    flavor: "Timing matters",
    icon: "palm-tree",
    backgroundImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?fit=crop&w=600&q=80"
  },
  { 
    type: "twin_thugs" as CardType, 
    name: "TWIN THUGS",
    title: "TWIN THUGS",
    description: "Two thugs can be moved the full dice roll on this turn. Two thugs only.", 
    flavor: "Double trouble",
    icon: "users",
    backgroundImage: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?fit=crop&w=600&q=80"
  },
  { 
    type: "cop_toss" as CardType, 
    name: "COP TOSS",
    title: "COP TOSS",
    description: "Move one cop up to two spaces. If the cop lands on a granny, place the cop on top of the granny — the square is now treated as a cop square, but it cannot be used to directly catch a thug.", 
    flavor: "Move the law",
    icon: "move",
    backgroundImage: "https://images.unsplash.com/photo-1568667256549-094345857637?fit=crop&w=600&q=80"
  },
  { 
    type: "parkour" as CardType, 
    name: "PARKOUR",
    title: "PARKOUR",
    description: "Jump over any obstacle — including buildings, cops, grannies, or thugs. Each jump costs 1 point from your die roll. After jumping, continue moving normally with your remaining points. (Example: Roll a 5, jump over 1 square, then move 4 squares normally.) Cannot be combined with The Breakdancer.", 
    flavor: "Urban acrobatics",
    icon: "zap",
    backgroundImage: "https://images.unsplash.com/photo-1518611012118-696072aa579a?fit=crop&w=600&q=80"
  },
  { 
    type: "negotiator" as CardType, 
    name: "THE NEGOTIATOR",
    title: "THE NEGOTIATOR",
    description: "Swap the positions of any two thugs on the board. They must not be in a start zone, out of the city, or in jail.", 
    flavor: "Deal maker",
    icon: "repeat",
    backgroundImage: "https://images.unsplash.com/photo-1556761175-4b46a572b786?fit=crop&w=600&q=80"
  },
  { 
    type: "corruption" as CardType, 
    name: "CORRUPTION",
    title: "CORRUPTION",
    description: "Replace a cop with one of your own thugs. Cop is discarded", 
    flavor: "Inside job",
    icon: "dollar-sign",
    backgroundImage: "https://images.unsplash.com/photo-1633158829585-23ba8f7c8caf?fit=crop&w=600&q=80"
  },
  { 
    type: "breakdancer" as CardType, 
    name: "THE BREAKDANCER",
    title: "THE BREAKDANCER",
    description: "Move diagonally this turn", 
    flavor: "Steps: 5",
    icon: "corner-down-right",
    backgroundImage: "https://images.unsplash.com/photo-1547153760-18fc9498041f?fit=crop&w=600&q=80"
  },
  { 
    type: "thug_fight" as CardType, 
    name: "THUG FIGHT",
    title: "THUG FIGHT",
    description: "Thugs on the same square can fight. Roll the dice and move the thug that rolled the lowest back to the start.", 
    flavor: "May the best thug win",
    icon: "sword",
    backgroundImage: "https://images.unsplash.com/photo-1534438097545-49ba7ec79b26?fit=crop&w=600&q=80"
  },
];
