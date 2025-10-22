
import { useGame } from "@/context/GameContext";
import { Card, Team } from "@/types/game";
import { toast } from "@/hooks/use-toast";

export const useCardActions = () => {
  const { state, dispatch } = useGame();

  const handleDrawCard = () => {
    if (state.cards.justDrawn) {
      toast({
        title: "Card Already Drawn",
        description: "You already drew a card this turn.",
        variant: "destructive",
      });
      return;
    }
    
    dispatch({ type: "DRAW_CARD" });
  };

  const handleKeepCard = () => {
    if (state.cards.justDrawn) {
      dispatch({ type: "KEEP_CARD" });
      // Don't automatically end turn - player needs to move first
    }
  };

  const handleUseCard = (card: Card) => {
    if (state.gameStatus !== "playing") {
      return;
    }
    
    dispatch({ type: "USE_CARD", cardId: card.id });
    
    toast({
      title: "Card Used",
      description: `${card.name} has been used.`,
    });
    
    // Don't automatically end turn - player needs to move first
  };

  const handleTradeCard = (fromTeam: Team, toTeam: Team, cardId: string) => {
    dispatch({ 
      type: "OFFER_TRADE", 
      fromTeam, 
      toTeam, 
      cardId 
    });
  };

  const handleAcceptTrade = () => {
    dispatch({ type: "ACCEPT_TRADE" });
  };

  const handleDeclineTrade = () => {
    dispatch({ type: "DECLINE_TRADE" });
  };

  return {
    handleDrawCard,
    handleKeepCard,
    handleUseCard,
    handleTradeCard,
    handleAcceptTrade,
    handleDeclineTrade,
  };
};
