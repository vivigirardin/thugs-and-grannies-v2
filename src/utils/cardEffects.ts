import { BoardState, Position } from '@/types/game';

export const useCard = (state: BoardState, cardId: string, targetId?: string, position?: Position): BoardState => {
  const currentTeam = state.players[state.currentPlayer].team;
  
  // First check if this is the drawn card
  if (state.cards.justDrawn && state.cards.justDrawn.id === cardId) {
    // Apply card effect
    let newState = applyCardEffect(state, state.cards.justDrawn, targetId, position);
    
    // Clear the drawn card
    newState = {
      ...newState,
      cards: {
        ...newState.cards,
        justDrawn: null,
      },
    };
    
    return newState;
  }
  
  // Otherwise, check player's hand
  const cardIndex = state.cards.playerHands[currentTeam].findIndex(card => card.id === cardId);
  
  if (cardIndex === -1) {
    return state;
  }
  
  const card = state.cards.playerHands[currentTeam][cardIndex];
  
  // Apply card effect
  let newState = applyCardEffect(state, card, targetId, position);
  
  // Remove the card from player's hand
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

// Helper function to apply card effects
const applyCardEffect = (state: BoardState, card: any, targetId?: string, position?: Position): BoardState => {
  let newState = { ...state };
  
  // Parse steps from flavor text
  if (card.flavor) {
    const stepsMatch = card.flavor.match(/Steps:\s*(\d+)/i);
    if (stepsMatch) {
      const steps = parseInt(stepsMatch[1], 10);
      newState.diceValue = steps;
    }
  }
  
  switch (card.type) {
    case "smoke_bomb":
      const playerIds = state.players
        .filter(p => p.team === state.players[state.currentPlayer].team && !p.arrested && !p.escaped)
        .map(p => p.id);
      
      newState.cards.activeEffects.policeIgnore = [
        ...newState.cards.activeEffects.policeIgnore,
        ...playerIds
      ];
      break;

    case "shortcut":
      if (state.activeMeeple) {
        newState.cards.activeEffects.moveDiagonally = state.activeMeeple;
      }
      break;

    case "fake_pass":
      const meepleIds = state.players
        .filter(p => p.team === state.players[state.currentPlayer].team && !p.arrested && !p.escaped)
        .map(p => p.id);
      
      newState.cards.activeEffects.grannyIgnore = [
        ...newState.cards.activeEffects.grannyIgnore,
        ...meepleIds
      ];
      break;

    case "dumpster_dive":
      if (state.activeMeeple) {
        newState.cards.activeEffects.policeIgnore = [
          ...newState.cards.activeEffects.policeIgnore,
          state.activeMeeple
        ];
        
        newState.immobilizedPlayers = newState.immobilizedPlayers.filter(
          id => id !== state.activeMeeple
        );
      }
      break;

    case "bribe":
      newState.cards.activeEffects.policeImmobilized = true;
      break;

    case "lobbyist":
      newState.cards.activeEffects.policeExpansionDelay = true;
      break;

    case "public_statement":
      if (!targetId) {
        return state;
      }
      
      newState.cards.activeEffects.skippedPlayers = [
        ...newState.cards.activeEffects.skippedPlayers,
        targetId
      ];
      break;

    case "red_tape":
      newState.cards.activeEffects.policeMoveLimited = true;
      break;

    case "shadow_step":
      if (state.activeMeeple) {
        newState.cards.activeEffects.grannyIgnore = [
          ...newState.cards.activeEffects.grannyIgnore,
          state.activeMeeple
        ];
      }
      break;

    case "meditation":
      if (state.diceValue > 0) {
        newState.diceValue = Math.floor(Math.random() * 6) + 1;
      }
      break;

    default:
      // No effect for unknown card types
      break;
  }
  
  return newState;
};
