
import { BoardState, Position } from '@/types/game';

export const useCard = (state: BoardState, cardId: string, targetId?: string, position?: Position): BoardState => {
  const currentTeam = state.players[state.currentPlayer].team;
  const cardIndex = state.cards.playerHands[currentTeam].findIndex(card => card.id === cardId);
  
  if (cardIndex === -1) {
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
      break;

    case "shortcut":
      if (state.activeMeeple) {
        newState.cards.activeEffects.moveDiagonally = state.activeMeeple;
      } else {
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
      } else {
        return state;
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
      } else {
        return state;
      }
      break;

    case "meditation":
      if (state.diceValue > 0) {
        newState.diceValue = Math.floor(Math.random() * 6) + 1;
      }
      break;

    default:
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
