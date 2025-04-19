
import { v4 as uuidv4 } from 'uuid';
import { Card, Team, BoardState } from '@/types/game';
import { CARDS } from '@/data/cardData';

export const generateSingleCard = (index: number): Card => {
  // Use modulo to cycle through the card templates
  const cardTemplate = CARDS[index % CARDS.length];
  
  return {
    ...cardTemplate,
    id: uuidv4(),
    used: false,
  };
};

export const createCardDeck = (): Card[] => {
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

export const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const drawCard = (state: BoardState): BoardState => {
  if (state.cards.deck.length === 0) {
    return {
      ...state,
      cards: {
        ...state.cards,
        justDrawn: { 
          id: "empty-deck", 
          name: "Empty Deck", 
          description: "No more cards left in the deck!", 
          type: "empty",
          used: false,
          flavor: "The deck is empty",
          icon: "alert-circle"
        }
      }
    };
  }
  
  const [newCardDrawn, ...remainingDeck] = state.cards.deck;
  
  return {
    ...state,
    cards: {
      ...state.cards,
      deck: remainingDeck,
      justDrawn: newCardDrawn,
    }
  };
};

export const keepCard = (state: BoardState): BoardState => {
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

export const offerTrade = (state: BoardState, fromTeam: Team, toTeam: Team, cardId: string): BoardState => {
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

export const acceptTrade = (state: BoardState): BoardState => {
  const { from, to, card } = state.cards.tradingOffer;
  
  if (!from || !to || !card) {
    return state;
  }
  
  const fromHand = state.cards.playerHands[from].filter(c => c.id !== card.id);
  const toHand = [...state.cards.playerHands[to], card];
  
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

export const declineTrade = (state: BoardState): BoardState => {
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
