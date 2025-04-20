
import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { Team, Card } from "@/types/game";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DrawnCard from "./cards/DrawnCard";
import PlayerHand from "./cards/PlayerHand";
import TradeDialog from "./cards/TradeDialog";
import UseCardDialog from "./cards/UseCardDialog";
import GameCard from "./GameCard";

const CardManager: React.FC = () => {
  const { state, dispatch } = useGame();
  const currentTeam = useCurrentTeam();
  const currentHand = currentTeam ? state.cards.playerHands[currentTeam] : [];
  const otherTeams = Object.keys(state.cards.playerHands).filter(team => team !== currentTeam) as Team[];
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [targetTeam, setTargetTeam] = useState<Team | null>(null);
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [isUseCardDialogOpen, setIsUseCardDialogOpen] = useState(false);
  const [targetPlayer, setTargetPlayer] = useState<string | null>(null);

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

  const handleUseCard = (card: Card) => {
    if (state.diceValue === 0) {
      toast({
        title: "Can't Use Card Now",
        description: "You need to complete your movement first.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedCard(card);

    if (card.type === "public_statement" || card.type === "switcheroo") {
      setIsUseCardDialogOpen(true);
      return;
    }

    dispatch({ type: "USE_CARD", cardId: card.id });
  };

  const handleKeepCard = () => {
    if (state.cards.justDrawn) {
      dispatch({ type: "KEEP_CARD" });
    }
  };

  const handleTradeCard = (card: Card) => {
    if (state.diceValue > 0) {
      toast({
        title: "Can't Trade Now",
        description: "You need to complete your movement first.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedCard(card);
    setIsTradeDialogOpen(true);
  };

  const handleOfferTrade = () => {
    if (selectedCard && targetTeam && currentTeam) {
      dispatch({ 
        type: "OFFER_TRADE", 
        fromTeam: currentTeam, 
        toTeam: targetTeam, 
        cardId: selectedCard.id 
      });
      setIsTradeDialogOpen(false);
    }
  };

  const handleConfirmUseCard = () => {
    if (!selectedCard) return;

    switch (selectedCard.type) {
      case "public_statement":
        if (targetPlayer) {
          dispatch({ type: "USE_CARD", cardId: selectedCard.id, targetId: targetPlayer });
        }
        break;
      case "switcheroo":
        dispatch({ type: "USE_CARD", cardId: selectedCard.id });
        break;
      default:
        dispatch({ type: "USE_CARD", cardId: selectedCard.id });
    }

    setIsUseCardDialogOpen(false);
    setTargetPlayer(null);
  };

  const opposingPlayers = state.players.filter(
    player => player.team !== currentTeam && !player.arrested && !player.escaped
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Cards</h2>

      <DrawnCard 
        card={state.cards.justDrawn}
        onKeep={handleKeepCard}
        onUse={handleUseCard}
      />

      {!state.cards.justDrawn && state.gameStatus === "playing" && (
        <div className="flex justify-center mb-4">
          <Button 
            onClick={handleDrawCard} 
            disabled={state.diceValue === 0}
            className="relative transition-all hover:bg-primary-hover active:scale-95"
          >
            Draw Card
          </Button>
        </div>
      )}

      {currentTeam && (
        <PlayerHand 
          team={currentTeam}
          cards={currentHand}
          diceValue={state.diceValue}
          onUseCard={handleUseCard}
          onTradeCard={handleTradeCard}
        />
      )}

      <TradeDialog 
        isOpen={isTradeDialogOpen}
        onClose={() => setIsTradeDialogOpen(false)}
        otherTeams={otherTeams}
        selectedTeam={targetTeam}
        onTeamSelect={setTargetTeam}
        onConfirm={handleOfferTrade}
      />

      <UseCardDialog 
        isOpen={isUseCardDialogOpen}
        onClose={() => setIsUseCardDialogOpen(false)}
        card={selectedCard}
        opposingPlayers={opposingPlayers}
        selectedPlayer={targetPlayer}
        onPlayerSelect={setTargetPlayer}
        onConfirm={handleConfirmUseCard}
      />

      <Dialog 
        open={!!state.cards.tradingOffer.from && state.cards.tradingOffer.to === currentTeam}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Trade Offer</DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-4">
            <p>
              {state.cards.tradingOffer.from} team offers you this card:
            </p>
            
            <div className="py-4">
              {state.cards.tradingOffer.card && (
                <GameCard card={state.cards.tradingOffer.card} />
              )}
            </div>
            
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => dispatch({ type: "DECLINE_TRADE" })}>
                Decline
              </Button>
              <Button onClick={() => dispatch({ type: "ACCEPT_TRADE" })}>
                Accept
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CardManager;
