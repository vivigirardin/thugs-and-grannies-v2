
import { useGame } from "@/context/GameContext";
import { Card, Team } from "@/types/game";
import { toast } from "@/hooks/use-toast";

export const useCardActions = () => {
  const { state, dispatch } = useGame();

  const handleDrawCard = () => {
    if (state.diceValue === 0) {
      toast({
        title: "Can't Draw Now",
        description: "You need to roll the dice first.",
        variant: "destructive",
      });
      return;
    }
    
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
      
      setTimeout(() => {
        dispatch({ type: "NEXT_TURN" });
      }, 500);
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
    
    if (state.cards.justDrawn && state.cards.justDrawn.id === card.id) {
      setTimeout(() => {
        dispatch({ type: "NEXT_TURN" });
      }, 1000);
    }
  };

  const handleTradeCard = (fromTeam: Team, toTeam: Team, cardId: string) => {
    if (state.diceValue > 0) {
      toast({
        title: "Can't Trade Now",
        description: "You need to complete your movement first.",
        variant: "destructive",
      });
      return;
    }
    
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
