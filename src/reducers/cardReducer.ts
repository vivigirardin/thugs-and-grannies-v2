
import { BoardState, GameAction } from '@/types/game';
import { drawCard, keepCard, offerTrade, acceptTrade, declineTrade } from '@/utils/cardUtils';
import { useCard } from '@/utils/cardEffects';

export const cardReducer = (state: BoardState, action: GameAction): Partial<BoardState> => {
  switch (action.type) {
    case "DRAW_CARD":
      if (state.cards.justDrawn || state.cards.deck.length === 0) {
        return {};
      }
      return drawCard(state);
      
    case "KEEP_CARD":
      return keepCard(state);
      
    case "USE_CARD":
      return useCard(state, action.cardId, action.targetId, action.position);
      
    case "OFFER_TRADE":
      return offerTrade(state, action.fromTeam, action.toTeam, action.cardId);
      
    case "ACCEPT_TRADE":
      return acceptTrade(state);
      
    case "DECLINE_TRADE":
      return declineTrade(state);
      
    default:
      return {};
  }
};
