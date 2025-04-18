import React, { createContext, useContext, useReducer } from "react";
import { BoardState, GameAction, Position, Team, Square, Meeple, Card, CardType } from "@/types/game";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

const BOARD_SIZE = 20;

const CARDS: Omit<Card, 'id' | 'used'>[] = [
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
    type: "distraction", 
    name: "Distraction", 
    description: "Choose one puppy – it doesn't distract anyone this round.", 
    flavor: "Squirrel!",
    icon: "dog"
  },
  { 
    type: "switcheroo", 
    name: "Switcheroo", 
    description: "Swap any two of your gang members on the board.", 
    flavor: "You take the left, I'll take the right.",
    icon: "switch-camera"
  },
  
  // Creeps cards
  { 
    type: "dumpster_dive", 
    name: "Dumpster Dive", 
    description: "Hide in place for a turn – police and puppies ignore you.", 
    flavor: "Not glamorous, but it works.",
    team: "creeps",
    icon: "user-minus-2"
  },
  { 
    type: "shiv", 
    name: "Shiv", 
    description: "Push an adjacent police officer back one space.", 
    flavor: "He'll think twice next time.",
    team: "creeps",
    icon: "sword"
  },
  { 
    type: "lookout", 
    name: "Lookout", 
    description: "See where the puppies will move next round before anyone else.", 
    flavor: "Eyes everywhere.",
    team: "creeps",
    icon: "eye"
  },
  
  // Italian cards
  { 
    type: "bribe", 
    name: "Bribe", 
    description: "Delay police movement for one round.", 
    flavor: "Everyone's got a price.",
    team: "italian",
    icon: "dollar-sign"
  },
  { 
    type: "getaway_car", 
    name: "Getaway Car", 
    description: "Move two gang members, 1 space each.", 
    flavor: "Hop in!",
    team: "italian",
    icon: "car"
  },
  { 
    type: "cover_story", 
    name: "Cover Story", 
    description: "One gang member can move through 1 police square.", 
    flavor: "He's with me.",
    team: "italian",
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
  
  // Japanese cards
  { 
    type: "shadow_step", 
    name: "Shadow Step", 
    description: "Move through 1 granny square this turn.", 
    flavor: "No sound. No trace.",
    team: "japanese",
    icon: "notepad-text"
  },
  { 
    type: "meditation", 
    name: "Meditation", 
    description: "Reroll your dice once this turn.", 
    flavor: "Still the mind. Try again.",
    team: "japanese",
    icon: "dice-5"
  },
  { 
    type: "honor_bound", 
    name: "Honor Bound", 
    description: "If a gang member is caught, immediately move another one 3 spaces.", 
    flavor: "Their sacrifice won't be in vain.",
    team: "japanese",
    icon: "fist"
  },
];

const initialState: BoardState = {
  cells: Array(BOARD_SIZE).fill(null).map((_, rowIndex) => 
    Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({
      type: "path",
      position: { row: rowIndex, col: colIndex },
      occupied: false,
    }))
  ),
  players: [],
  police: [],
  grannies: [],
  puppies: [],
  exits: [
    { row: 8, col: 0 },
    { row: 12, col: 0 },
    { row: 8, col: BOARD_SIZE - 1 },
    { row: 12, col: BOARD_SIZE - 1 },
  ],
  jailedPlayers: [],
  landmarks: {
    city: [],
    library: [],
    school: [],
    townhall: [],
  },
  buildingEntrances: {},
  currentPlayer: 0,
  activeMeeple: null,
  diceValue: 0,
  gameStatus: "setup",
  winner: null,
  turnCount: 0,
  policeChains: [],
  immobilizedPlayers: [],
  previousState: null,
  canUndo: false,
  cards: {
    deck: [],
    playerHands: {
      creeps: [],
      italian: [],
      politicians: [],
      japanese: [],
    },
    activeEffects: {
      policeIgnore: [],
      grannyIgnore: [],
      policeImmobilized: false,
      policeExpansionDelay: false,
      moveDiagonally: null,
      puppyImmunity: [],
      policeMoveLimited: false,
      skippedPlayers: [],
    },
    justDrawn: null,
    tradingOffer: {
      from: null,
      to: null,
      card: null,
    },
  },
};

const landmarks = [
  { type: "city", size: 4, position: { row: 0, col: 2 } },
  { type: "library", size: 3, position: { row: 2, col: BOARD_SIZE - 4 } },
  { type: "school", size: 5, position: { row: BOARD_SIZE - 6, col: 2 } },
  { type: "townhall", size: 3, position: { row: BOARD_SIZE - 4, col: BOARD_SIZE - 4 } },
];

const findEntranceLocations = (buildingType: string, buildingPositions: Position[], cells: Square[][]): Position[] => {
  const potentialEntrances: Position[] = [];
  
  buildingPositions.forEach(pos => {
    const { row, col } = pos;
    
    const adjacentPositions = [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ];
    
    adjacentPositions.forEach(adjPos => {
      if (
        adjPos.row >= 0 && adjPos.row < BOARD_SIZE && 
        adjPos.col >= 0 && adjPos.col < BOARD_SIZE &&
        cells[adjPos.row][adjPos.col].type === "path" &&
        !cells[adjPos.row][adjPos.col].occupied
      ) {
        potentialEntrances.push(pos);
      }
    });
  });
  
  const shuffled = [...potentialEntrances].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(2, shuffled.length));
};

const generateInitialBoard = (teams: Team[]): BoardState => {
  const state = { ...initialState };
  state.cells = Array(BOARD_SIZE).fill(null).map((_, rowIndex) => 
    Array(BOARD_SIZE).fill(null).map((_, colIndex) => ({
      type: "path",
      position: { row: rowIndex, col: colIndex },
      occupied: false,
    }))
  );
  
  const landmarkPositions: Record<string, Position[]> = {
    city: [],
    library: [],
    school: [],
    townhall: [],
  };
  
  landmarks.forEach(landmark => {
    const { type, size, position } = landmark;
    const positions: Position[] = [];
    
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const row = position.row + r;
        const col = position.col + c;
        
        if (row < BOARD_SIZE && col < BOARD_SIZE) {
          state.cells[row][col].type = type as any;
          positions.push({ row, col });
        }
      }
    }
    
    landmarkPositions[type] = positions;
  });
  
  state.landmarks = landmarkPositions as any;
  
  state.exits = [
    { row: 8, col: 0 },
    { row: 12, col: 0 },
    { row: 8, col: BOARD_SIZE - 1 },
    { row: 12, col: BOARD_SIZE - 1 },
  ];
  
  state.exits.forEach(exit => {
    state.cells[exit.row][exit.col].type = "exit";
  });
  
  const players = [];
  
  const getPositionsInsideBuilding = (building: string, count: number): Position[] => {
    const buildingCells = state.landmarks[building as keyof typeof state.landmarks];
    if (!buildingCells || buildingCells.length === 0) return [];
    
    const shuffled = [...buildingCells].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };
  
  const buildings = ['city', 'library', 'school', 'townhall'];
  
  teams.forEach((team, index) => {
    const buildingType = buildings[index % buildings.length];
    const positions = getPositionsInsideBuilding(buildingType, 5);
    
    positions.forEach((pos, playerIndex) => {
      if (playerIndex < 5) {
        players.push({
          id: `${team}-${playerIndex}`,
          team,
          position: pos,
          escaped: false,
          arrested: false,
        });
        
        state.cells[pos.row][pos.col].occupied = true;
        state.cells[pos.row][pos.col].occupiedBy = `${team}-${playerIndex}`;
      }
    });
  });
  
  state.players = players;
  
  const buildingEntrances: { [key: string]: Position[] } = {};
  
  Object.entries(state.landmarks).forEach(([type, positions]) => {
    const entrances = findEntranceLocations(type, positions, state.cells);
    
    if (entrances.length >= 2) {
      state.cells[entrances[0].row][entrances[0].col].type = "entrance";
      state.cells[entrances[0].row][entrances[0].col].connectedTo = entrances[1];
      
      state.cells[entrances[1].row][entrances[1].col].type = "entrance";
      state.cells[entrances[1].row][entrances[1].col].connectedTo = entrances[0];
      
      buildingEntrances[type] = entrances;
    }
  });
  
  state.buildingEntrances = buildingEntrances;
  
  const policeChains: Position[][] = [];
  const emptyCells: Position[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = state.cells[row][col];
      if (
        cell.type === "path" && 
        !cell.occupied &&
        !state.exits.some(exit => exit.row === row && exit.col === col)
      ) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  const centerRow = Math.floor(BOARD_SIZE / 2);
  const centerCol = Math.floor(BOARD_SIZE / 2);
  
  for (let chainIndex = 0; chainIndex < 2; chainIndex++) {
    const startPos = { 
      row: centerRow + (chainIndex === 0 ? -1 : 1), 
      col: centerCol + (chainIndex === 0 ? -1 : 1)
    };
    
    if (startPos.row >= 0 && startPos.row < BOARD_SIZE && 
        startPos.col >= 0 && startPos.col < BOARD_SIZE &&
        state.cells[startPos.row][startPos.col].type === "path" &&
        !state.cells[startPos.row][startPos.col].occupied) {
      
      const chain: Position[] = [startPos];
      
      for (let i = 0; i < 2; i++) {
        const lastPos = chain[chain.length - 1];
        const adjacentPositions = [
          { row: lastPos.row - 1, col: lastPos.col },
          { row: lastPos.row + 1, col: lastPos.col },
          { row: lastPos.row, col: lastPos.col - 1 },
          { row: lastPos.row, col: lastPos.col + 1 },
        ].filter(pos => 
          pos.row >= 0 && pos.row < BOARD_SIZE && 
          pos.col >= 0 && pos.col < BOARD_SIZE &&
          state.cells[pos.row][pos.col].type === "path" &&
          !state.cells[pos.row][pos.col].occupied
        );
        
        if (adjacentPositions.length > 0) {
          const nextPos = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
          chain.push(nextPos);
          
          const indexToRemove = emptyCells.findIndex(p => p.row === nextPos.row && p.col === nextPos.col);
          if (indexToRemove >= 0) {
            emptyCells.splice(indexToRemove, 1);
          }
        }
      }
      
      policeChains.push(chain);
    }
  }
  
  const police: Position[] = [];
  policeChains.forEach(chain => {
    chain.forEach(pos => {
      police.push(pos);
      state.cells[pos.row][pos.col].type = "police";
    });
  });
  
  state.police = police;
  state.policeChains = policeChains;
  
  const grannies: Position[] = [];
  for (let i = 0; i < 3; i++) {
    if (emptyCells.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    grannies.push(emptyCells[randomIndex]);
    
    emptyCells.splice(randomIndex, 1);
  }
  
  grannies.forEach(pos => {
    state.cells[pos.row][pos.col].type = "granny";
  });
  state.grannies = grannies;
  
  const puppies: Position[] = [];
  for (let i = 0; i < 2; i++) {
    if (emptyCells.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    puppies.push(emptyCells[randomIndex]);
    
    emptyCells.splice(randomIndex, 1);
  }
  
  puppies.forEach(pos => {
    state.cells[pos.row][pos.col].type = "puppy";
  });
  
  state.puppies = puppies;
  
  const deck = createCardDeck();
  const playerHands: Record<Team, Card[]> = {
    creeps: [],
    italian: [],
    politicians: [],
    japanese: [],
  };
  
  teams.forEach(team => {
    playerHands[team] = [];
  });
  
  state.cards = {
    deck,
    playerHands,
    activeEffects: {
      policeIgnore: [],
      grannyIgnore: [],
      policeImmobilized: false,
      policeExpansionDelay: false,
      moveDiagonally: null,
      puppyImmunity: [],
      policeMoveLimited: false,
      skippedPlayers: [],
    },
    justDrawn: null,
    tradingOffer: {
      from: null,
      to: null,
      card: null,
    },
  };
  
  state.gameStatus = "playing";
  state.turnCount = 0;
  state.activeMeeple = null;
  state.diceValue = 0;
  
  return state;
};

const createCardDeck = (): Card[] => {
  const deck: Card[] = [];
  
  CARDS.filter(card => !card.team).forEach(cardTemplate => {
    for (let i = 0; i < 3; i++) {
      deck.push({
        ...cardTemplate,
        id: uuidv4(),
        used: false,
      });
    }
  });
  
  CARDS.filter(card => card.team).forEach(cardTemplate => {
    for (let i = 0; i < 2; i++) {
      deck.push({
        ...cardTemplate,
        id: uuidv4(),
        used: false,
      });
    }
  });
  
  return shuffle(deck);
};

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const drawCard = (state: BoardState): BoardState => {
  const newState = { ...state };
  const currentTeam = state.players[state.currentPlayer].team;
  
  if (state.cards.deck.length === 0) {
    // Don't call toast directly here - will cause React render warning
    return {
      ...state,
      cards: {
        ...state.cards,
        justDrawn: { 
          id: "empty-deck", 
          name: "Empty Deck", 
          description: "No more cards left in the deck!", 
          type: "empty" as CardType,
          used: false 
        }
      }
    };
  }
  
  const [newCardDrawn, ...remainingDeck] = state.cards.deck;
  
  newState.cards = {
    ...state.cards,
    deck: remainingDeck,
    justDrawn: newCardDrawn,
  };
  
  // Don't call toast directly here
  return newState;
};

const keepCard = (state: BoardState): BoardState => {
  if (!state.cards.justDrawn) {
    return state;
  }
  
  const currentTeam = state.players[state.currentPlayer].team;
  const newCardDrawn = state.cards.justDrawn;
  
  const newHands = { ...state.cards.playerHands };
  newHands[currentTeam] = [...newHands[currentTeam], newCardDrawn];
  
  return {
    ...state,
    cards: {
      ...state.cards,
      playerHands: newHands,
      justDrawn: null,
    },
  };
};

const useCard = (state: BoardState, cardId: string, targetId?: string, position?: Position): BoardState => {
  const currentTeam = state.players[state.currentPlayer].team;
  const cardIndex = state.cards.playerHands[currentTeam].findIndex(card => card.id === cardId);
  
  if (cardIndex === -1) {
    if (state.cards.justDrawn?.id === cardId) {
      return useJustDrawnCard(state, targetId, position);
    }
    return state;
  }
  
  const card = state.cards.playerHands[currentTeam][cardIndex];
  let newState = { ...state };
  
  switch (card.type) {
    case "smoke_bomb":
      const playerIds = state.players
        .filter(p => p.team === currentTeam && !p.arrested && !p.escaped)
        .map(p => p.id);
      
      newState.cards.activeEffects.policeIgnore = [
        ...newState.cards.activeEffects.policeIgnore,
        ...playerIds
      ];
      
      toast({
        title: "Card Used",
        description: "Smoke Bomb: Your team is hidden from police this turn!",
      });
      break;

    case "shortcut":
      if (state.activeMeeple) {
        newState.cards.activeEffects.moveDiagonally = state.activeMeeple;
        
        toast({
          title: "Card Used",
          description: "Shortcut: You can move diagonally this turn!",
        });
      } else {
        toast({
          title: "Select a Meeple",
          description: "You need to select a meeple to use this card on.",
          variant: "destructive",
        });
        return state;
      }
      break;

    case "fake_pass":
      const meepleIds = state.players
        .filter(p => p.team === currentTeam && !p.arrested && !p.escaped)
        .map(p => p.id);
      
      newState.cards.activeEffects.grannyIgnore = [
        ...newState.cards.activeEffects.grannyIgnore,
        ...meepleIds
      ];
      
      toast({
        title: "Card Used",
        description: "Fake Pass: Your team can pass through grannies this turn!",
      });
      break;

    case "distraction":
      if (!position) {
        toast({
          title: "Invalid Target",
          description: "You need to select a puppy to distract.",
          variant: "destructive",
        });
        return state;
      }
      
      newState.cards.activeEffects.puppyImmunity = [
        ...newState.cards.activeEffects.puppyImmunity,
        position
      ];
      
      newState = updateImmobilizedPlayers(newState);
      
      toast({
        title: "Card Used",
        description: "Distraction: The puppy is distracted this round!",
      });
      break;

    case "switcheroo":
      toast({
        title: "Card Used",
        description: "Switcheroo: Select two of your meeples to swap positions.",
      });
      break;

    case "dumpster_dive":
      if (state.activeMeeple) {
        newState.cards.activeEffects.policeIgnore = [
          ...newState.cards.activeEffects.policeIgnore,
          state.activeMeeple
        ];
        
        const selectedPlayer = state.players.find(p => p.id === state.activeMeeple);
        if (selectedPlayer) {
          newState.immobilizedPlayers = newState.immobilizedPlayers.filter(
            id => id !== state.activeMeeple
          );
        }
        
        toast({
          title: "Card Used",
          description: "Dumpster Dive: This meeple can't be caught by police or distracted by puppies this turn.",
        });
      } else {
        toast({
          title: "Select a Meeple",
          description: "You need to select a meeple to use this card on.",
          variant: "destructive",
        });
        return state;
      }
      break;

    case "shiv":
      toast({
        title: "Card Used",
        description: "Shiv: Select an adjacent police officer to push back.",
      });
      break;

    case "lookout":
      toast({
        title: "Card Used",
        description: "Lookout: You can now see where puppies will move next.",
      });
      break;

    case "bribe":
      newState.cards.activeEffects.policeImmobilized = true;
      
      toast({
        title: "Card Used",
        description: "Bribe: Police movement is delayed for one round.",
      });
      break;

    case "getaway_car":
      toast({
        title: "Card Used",
        description: "Getaway Car: You can move two of your meeples one space each.",
      });
      break;

    case "cover_story":
      if (state.activeMeeple) {
        toast({
          title: "Card Used",
          description: "Cover Story: This meeple can move through one police square this turn.",
        });
      } else {
        toast({
          title: "Select a Meeple",
          description: "You need to select a meeple to use this card on.",
          variant: "destructive",
        });
        return state;
      }
      break;

    case "lobbyist":
      newState.cards.activeEffects.policeExpansionDelay = true;
      
      toast({
        title: "Card Used",
        description: "Lobbyist: Police won't expand this round.",
      });
      break;

    case "public_statement":
      if (!targetId) {
        toast({
          title: "Invalid Target",
          description: "You need to select an opponent's meeple.",
          variant: "destructive",
        });
        return state;
      }
      
      newState.cards.activeEffects.skippedPlayers = [
        ...newState.cards.activeEffects.skippedPlayers,
        targetId
      ];
      
      toast({
        title: "Card Used",
        description: "Public Statement: The selected opponent will skip their next turn.",
      });
      break;

    case "red_tape":
      newState.cards.activeEffects.policeMoveLimited = true;
      
      toast({
        title: "Card Used",
        description: "Red Tape: Police can't move more than 1 space this round.",
      });
      break;

    case "shadow_step":
      if (state.activeMeeple) {
        newState.cards.activeEffects.grannyIgnore = [
          ...newState.cards.activeEffects.grannyIgnore,
          state.activeMeeple
        ];
        
        toast({
          title: "Card Used",
          description: "Shadow Step: This meeple can move through a granny square this turn.",
        });
      } else {
        toast({
          title: "Select a Meeple",
          description: "You need to select a meeple to use this card on.",
          variant: "destructive",
        });
        return state;
      }
      break;

    case "meditation":
      if (state.diceValue > 0) {
        newState.diceValue = Math.floor(Math.random() * 6) + 1;
        
        toast({
          title: "Card Used",
          description: `Meditation: You rerolled the dice and got a ${newState.diceValue}!`,
        });
      } else {
        toast({
          title: "Can't Use Now",
          description: "You need to roll the dice first.",
          variant: "destructive",
        });
        return state;
      }
      break;

    case "honor_bound":
      toast({
        title: "Card Used",
        description: "Honor Bound: If a gang member is caught, another can move 3 spaces.",
      });
      break;
      
    default:
      toast({
        title: "Card Not Implemented",
        description: `The ${card.name} card effect is not implemented yet.`,
        variant: "destructive",
      });
      return state;
  }
  
  const newPlayerHands = { ...newState.cards.playerHands };
  const newHand = [...newPlayerHands[currentTeam]];
  newHand[cardIndex] = { ...newHand[cardIndex], used: true };
  newPlayerHands[currentTeam] = newHand;
  
  return {
    ...newState,
    cards: {
      ...newState.cards,
      playerHands: newPlayerHands,
    },
  };
};

const useJustDrawnCard = (state: BoardState, targetId?: string, position?: Position): BoardState => {
  if (!state.cards.justDrawn) {
    return state;
  }
  
  const currentTeam = state.players[state.currentPlayer].team;
  const card = state.cards.justDrawn;
  
  const withCardInHand = {
    ...state,
    cards: {
      ...state.cards,
      playerHands: {
        ...state.cards.playerHands,
        [currentTeam]: [...state.cards.playerHands[currentTeam], card]
      },
      justDrawn: null,
    }
  };
  
  return useCard(withCardInHand, card.id, targetId, position);
};

const offerTrade = (state: BoardState, fromTeam: Team, toTeam: Team, cardId: string): BoardState => {
  const card = state.cards.playerHands[fromTeam].find(c => c.id === cardId);
  
  if (!card) {
    return state;
  }
  
  return {
    ...state,
    cards: {
      ...state.cards,
      tradingOffer: {
        from: fromTeam,
        to: toTeam,
        card,
      },
    },
  };
};

const acceptTrade = (state: BoardState): BoardState => {
  const { from, to, card } = state.cards.tradingOffer;
  
  if (!from || !to || !card) {
    return state;
  }
  
  const fromHand = state.cards.playerHands[from].filter(c => c.id !== card.id);
  const toHand = [...state.cards.playerHands[to], card];
  
  toast({
    title: "Trade Accepted",
    description: `${to} team received ${card.name} from ${from} team.`,
  });
  
  return {
    ...state,
    cards: {
      ...state.cards,
      playerHands: {
        ...state.cards.playerHands,
        [from]: fromHand,
        [to]: toHand,
      },
      tradingOffer: {
        from: null,
        to: null,
        card: null,
      },
    },
  };
};

const declineTrade = (state: BoardState): BoardState => {
  toast({
    title: "Trade Declined",
    description: "The trade offer was declined.",
  });
  
  return {
    ...state,
    cards: {
      ...state.cards,
      tradingOffer: {
        from: null,
        to: null,
        card: null,
      },
    },
  };
};

const updateImmobilizedPlayers = (state: BoardState): BoardState => {
  const immobilizedIds: string[] = [];
  
  state.puppies.forEach(puppyPos => {
    const isPuppyDistracted = state.cards.activeEffects.puppyImmunity.some(
      pos => pos.row === puppyPos.row && pos.col === puppyPos.col
    );
    
    if (isPuppyDistracted) {
      return;
    }
    
    const adjacentPositions = [
      { row: puppyPos.row - 1, col: puppyPos.col },
      { row: puppyPos.row + 1, col: puppyPos.col },
      { row: puppyPos.row, col: puppyPos.col - 1 },
      { row: puppyPos.row, col: puppyPos.col + 1 },
    ];
    
    adjacentPositions.forEach(pos => {
      if (
        pos.row >= 0 && pos.row < state.cells.length &&
        pos.col >= 0 && pos.col < state.cells[0].length
      ) {
        const cell = state.cells[pos.row][pos.col];
        if (cell.occupiedBy) {
          immobilizedIds.push(cell.occupiedBy);
        }
      }
    });
  });
  
  return {
    ...state,
    immobilizedPlayers: immobilizedIds,
  };
};

const gameReducer = (state: BoardState, action: GameAction): BoardState => {
  switch (action.type) {
    case "START_GAME":
      return generateInitialBoard(action.teams);
      
    case "ROLL_DICE":
      return {
        ...state,
        diceValue: Math.floor(Math.random() * 6) + 1,
        activeMeeple: null,
      };
      
    case "SELECT_MEEPLE":
      return {
        ...state,
        activeMeeple: action.playerId,
        previousState: state,
        canUndo: true,
      };
      
    case "DESELECT_MEEPLE":
      return {
        ...state,
        activeMeeple: null,
      };
      
    case "MOVE_PLAYER": {
      if (!state.activeMeeple) return state;
      
      const playerId = state.activeMeeple;
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) return state;
      
      const player = state.players[playerIndex];
      const oldPos = player.position;
      const newPos = action.position;
      
      const targetCell = state.cells[newPos.row][newPos.col];
      let nextPos = newPos;
      
      if (targetCell.type === "entrance" && targetCell.connectedTo) {
        nextPos = targetCell.connectedTo;
      }
      
      const updatedPlayers = [...state.players];
      updatedPlayers[playerIndex] = {
        ...player,
        position: nextPos,
      };
      
      const newCells = [...state.cells];
      
      newCells[oldPos.row][oldPos.col] = {
        ...state.cells[oldPos.row][oldPos.col],
        occupied: false,
        occupiedBy: undefined,
      };
      
      let escaped = false;
      if (state.cells[nextPos.row][nextPos.col].type === "exit") {
        updatedPlayers[playerIndex].escaped = true;
        escaped = true;
        
        toast({
          title: "Escaped!",
          description: `${player.team} meeple has escaped!`,
        });
      } else {
        newCells[nextPos.row][nextPos.col] = {
          ...state.cells[nextPos.row][nextPos.col],
          occupied: true,
          occupiedBy: playerId,
        };
      }
      
      let gameStatus = state.gameStatus;
      let winner = state.winner;
      
      if (escaped) {
        const escapedCounts: Record<Team, number> = {
          creeps: 0,
          italian: 0,
          politicians: 0,
          japanese: 0,
        };
        
        updatedPlayers.forEach(p => {
          if (p.escaped) {
            escapedCounts[p.team]++;
          }
        });
        
        Object.entries(escapedCounts).forEach(([team, count]) => {
          if (count >= 3) {
            gameStatus = "ended";
            winner = team as Team;
            
            toast({
              title: "Game Over!",
              description: `${team} team wins with ${count} escaped meeples!`,
            });
          }
        });
      }
      
      return {
        ...state,
        players: updatedPlayers,
        cells: newCells,
        diceValue: 0,
        activeMeeple: null,
        gameStatus,
        winner,
      };
    }
      
    case "NEXT_TURN": {
      let newState = { 
        ...state,
        activeMeeple: null,
        diceValue: 0,
        turnCount: state.turnCount + 1,
        canUndo: false,
      };
      
      const resetActiveEffects = {
        policeIgnore: [],
        grannyIgnore: [],
        policeImmobilized: false,
        policeExpansionDelay: false,
        moveDiagonally: null,
        puppyImmunity: [],
        policeMoveLimited: false,
        skippedPlayers: [...state.cards.activeEffects.skippedPlayers],
      };
      
      let nextPlayerIndex = (state.currentPlayer + 1) % state.players.length;
      
      let loopCount = 0;
      const maxLoops = state.players.length * 2;
      
      while (loopCount < maxLoops) {
        const nextPlayer = state.players[nextPlayerIndex];
        
        if (!nextPlayer) {
          nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
          loopCount++;
          continue;
        }
        
        const isSkipped = resetActiveEffects.skippedPlayers.includes(nextPlayer.id);
        
        if (!nextPlayer.arrested && !nextPlayer.escaped && !isSkipped) {
          break;
        }
        
        if (isSkipped) {
          resetActiveEffects.skippedPlayers = resetActiveEffects.skippedPlayers.filter(
            id => id !== nextPlayer.id
          );
        }
        
        nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
        loopCount++;
        
        if (loopCount >= maxLoops) {
          const anyValidIndex = state.players.findIndex(p => !p.arrested && !p.escaped);
          if (anyValidIndex !== -1) {
            nextPlayerIndex = anyValidIndex;
          } else {
            nextPlayerIndex = 0;
          }
          break;
        }
      }
      
      return {
        ...newState,
        currentPlayer: nextPlayerIndex,
        cards: {
          ...newState.cards,
          activeEffects: resetActiveEffects,
          justDrawn: null,
        },
      };
    }
      
    case "UNDO_MOVE":
      if (state.previousState) {
        return {
          ...state.previousState,
          canUndo: false,
        };
      }
      return state;
      
    case "DRAW_CARD": {
      if (state.cards.justDrawn) {
        toast({
          title: "Card Already Drawn",
          description: "You already drew a card this turn.",
          variant: "destructive",
        });
        return state;
      }
      
      if (state.cards.deck.length === 0) {
        toast({
          title: "Deck Empty",
          description: "No more cards left in the deck!",
          variant: "destructive",
        });
        return state;
      }
      
      const cardsToDraw = [...state.cards.deck];
      const newCardDrawn = cardsToDraw.shift();
      
      if (!newCardDrawn) {
        return state;
      }
      
      toast({
        title: "Card Drawn",
        description: `You drew: ${newCardDrawn.name}`,
      });
      
      return {
        ...state,
        cards: {
          ...state.cards,
          deck: cardsToDraw,
          justDrawn: newCardDrawn,
        },
      };
    }
      
    case "KEEP_CARD": {
      if (!state.cards.justDrawn) {
        return state;
      }
      
      const currentTeam = state.players[state.currentPlayer].team;
      const newCardDrawn = state.cards.justDrawn;
      
      const newHands = { ...state.cards.playerHands };
      newHands[currentTeam] = [...newHands[currentTeam], newCardDrawn];
      
      return {
        ...state,
        cards: {
          ...state.cards,
          playerHands: newHands,
          justDrawn: null,
        },
      };
    }
      
    case "USE_CARD":
      return useCard(state, action.cardId, action.targetId, action.position);
      
    case "OFFER_TRADE":
      return offerTrade(state, action.fromTeam, action.toTeam, action.cardId);
      
    case "ACCEPT_TRADE":
      return acceptTrade(state);
      
    case "DECLINE_TRADE":
      return declineTrade(state);
      
    default:
      return state;
  }
};

type GameContextType = {
  state: BoardState;
  dispatch: React.Dispatch<GameAction>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export { 
  initialState, 
  generateInitialBoard, 
  drawCard, 
  keepCard, 
  useCard, 
  offerTrade, 
  acceptTrade, 
  declineTrade 
};
