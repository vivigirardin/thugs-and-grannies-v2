import { BoardState } from "@/types/game";
import { Card } from "@/types/cards";
import { Team, Position } from "@/types/game";
import { toast } from "@/hooks/use-toast";

export const drawCard = (state: BoardState): BoardState => {
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
          type: "empty" as any,
          used: false,
          flavor: "The deck is empty",
          icon: "alert-circle"
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

export const useCard = (state: BoardState, cardId: string, targetId?: string, position?: Position): BoardState => {
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
        description: "Lookout: You can now see where the puppies will move next.",
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
  newHand.splice(cardIndex, 1);
  newPlayerHands[currentTeam] = newHand;
  
  return {
    ...newState,
    cards: {
      ...newState.cards,
      playerHands: newPlayerHands,
    },
  };
};

export const useJustDrawnCard = (state: BoardState, targetId?: string, position?: Position): BoardState => {
  if (!state.cards.justDrawn) {
    return state;
  }
  
  const currentTeam = state.players[state.currentPlayer].team;
  const card = state.cards.justDrawn;
  
  const newState = useCard({
    ...state,
    cards: {
      ...state.cards,
      justDrawn: null,
    }
  }, card.id, targetId, position);
  
  return newState;
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

export const declineTrade = (state: BoardState): BoardState => {
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
