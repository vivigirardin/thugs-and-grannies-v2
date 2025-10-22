
import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { useCardActions } from "@/hooks/use-card-actions";
import { Team, Card } from "@/types/game";
import DrawnCard from "./DrawnCard";
import PlayerHand from "./PlayerHand";
import TradeDialog from "./TradeDialog";
import UseCardDialog from "./UseCardDialog";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import GameCard from "../GameCard";
import { Button } from "@/components/ui/button";

const CardManager: React.FC = () => {
  const { state } = useGame();
  const currentTeam = useCurrentTeam();
  const cardActions = useCardActions();
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [targetTeam, setTargetTeam] = useState<Team | null>(null);
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [isUseCardDialogOpen, setIsUseCardDialogOpen] = useState(false);
  const [targetPlayer, setTargetPlayer] = useState<string | null>(null);

  const currentHand = currentTeam ? state.cards.playerHands[currentTeam] : [];
  const otherTeams = Object.keys(state.cards.playerHands).filter(team => team !== currentTeam) as Team[];

  const handleUseCard = (card: Card) => {
    cardActions.handleUseCard(card);
  };

  const handleTradeCard = (card: Card) => {
    setSelectedCard(card);
    setIsTradeDialogOpen(true);
  };

  const handleOfferTrade = () => {
    if (selectedCard && targetTeam && currentTeam) {
      cardActions.handleTradeCard(currentTeam, targetTeam, selectedCard.id);
      setIsTradeDialogOpen(false);
    }
  };

  const handleConfirmUseCard = () => {
    if (!selectedCard) return;
    cardActions.handleUseCard(selectedCard);
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
        onKeep={cardActions.handleKeepCard}
        onUse={handleUseCard}
      />

      {!state.cards.justDrawn && state.gameStatus === "playing" && (
        <div className="flex justify-center mb-4">
          <Button 
            onClick={cardActions.handleDrawCard} 
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
              <Button variant="secondary" onClick={cardActions.handleDeclineTrade}>
                Decline
              </Button>
              <Button onClick={cardActions.handleAcceptTrade}>
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
