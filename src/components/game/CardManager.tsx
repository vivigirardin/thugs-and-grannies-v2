
import React, { useState } from "react";
import { useGame } from "@/context/GameContext";
import GameCard from "./GameCard";
import { Team, Card } from "@/types/game";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Dog, User, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CardManager: React.FC = () => {
  const { state, dispatch } = useGame();
  const currentTeam = state.players[state.currentPlayer]?.team;
  const currentHand = currentTeam ? state.cards.playerHands[currentTeam] : [];
  const otherTeams = Object.keys(state.cards.playerHands).filter(team => team !== currentTeam) as Team[];
  
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [targetTeam, setTargetTeam] = useState<Team | null>(null);
  const [isTradeDialogOpen, setIsTradeDialogOpen] = useState(false);
  const [isUseCardDialogOpen, setIsUseCardDialogOpen] = useState(false);
  const [targetPlayer, setTargetPlayer] = useState<string | null>(null);
  const [targetPuppy, setTargetPuppy] = useState<number | null>(null);

  const handleDrawCard = () => {
    console.log("Draw card button clicked");
    
    // Check if player can draw a card (not during movement phase)
    if (state.diceValue > 0) {
      toast({
        title: "Can't Draw Now",
        description: "You need to complete your movement first.",
        variant: "destructive",
      });
      return;
    }
    
    // If a card was just drawn, don't allow drawing another one
    if (state.cards.justDrawn) {
      toast({
        title: "Card Already Drawn",
        description: "You already drew a card this turn.",
        variant: "destructive",
      });
      return;
    }
    
    // Dispatch the draw card action
    dispatch({ type: "DRAW_CARD" });
  };

  const handleUseCard = (card: Card) => {
    setSelectedCard(card);

    // Cards that need target selection
    if (
      card.type === "public_statement" ||
      card.type === "distraction" ||
      card.type === "switcheroo"
    ) {
      setIsUseCardDialogOpen(true);
      return;
    }

    // Cards that can be used directly
    dispatch({ type: "USE_CARD", cardId: card.id });
  };

  const handleKeepCard = () => {
    if (state.cards.justDrawn) {
      dispatch({ type: "KEEP_CARD" });
    }
  };

  const handleTradeCard = (card: Card) => {
    setSelectedCard(card);
    setIsTradeDialogOpen(true);
  };

  const handleOfferTrade = () => {
    if (selectedCard && targetTeam) {
      dispatch({ 
        type: "OFFER_TRADE", 
        fromTeam: currentTeam!, 
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
      case "distraction":
        if (targetPuppy !== null && targetPuppy >= 0 && targetPuppy < state.puppies.length) {
          dispatch({ 
            type: "USE_CARD", 
            cardId: selectedCard.id, 
            position: state.puppies[targetPuppy]
          });
        }
        break;
      case "switcheroo":
        // For switcheroo, first select one meeple, then another
        // For simplicity, in the UI we'll just use the card and the game logic will handle selection
        dispatch({ type: "USE_CARD", cardId: selectedCard.id });
        break;
      default:
        dispatch({ type: "USE_CARD", cardId: selectedCard.id });
    }

    setIsUseCardDialogOpen(false);
    setTargetPlayer(null);
    setTargetPuppy(null);
  };

  const renderDrawnCard = () => {
    if (!state.cards.justDrawn) return null;

    return (
      <div className="flex flex-col items-center mb-4">
        <h3 className="text-center mb-2 font-bold">Card Drawn</h3>
        <GameCard card={state.cards.justDrawn} />
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={handleKeepCard}>Keep</Button>
          <Button size="sm" onClick={() => handleUseCard(state.cards.justDrawn!)}>Use</Button>
        </div>
      </div>
    );
  };

  // Get opposing players for card targeting
  const opposingPlayers = state.players.filter(
    player => player.team !== currentTeam && !player.arrested && !player.escaped
  );

  // Get active players for current team for card targeting
  const teamPlayers = state.players.filter(
    player => player.team === currentTeam && !player.arrested && !player.escaped
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Cards</h2>

      {/* Just drawn card */}
      {renderDrawnCard()}

      {/* Draw button if no card was just drawn */}
      {!state.cards.justDrawn && state.gameStatus === "playing" && (
        <div className="flex justify-center mb-4">
          <Button 
            onClick={handleDrawCard} 
            disabled={state.diceValue > 0}
            className="relative transition-all hover:bg-primary-hover active:scale-95"
          >
            Draw Card
          </Button>
        </div>
      )}

      {/* Current hand */}
      {currentTeam && (
        <div>
          <h3 className="font-bold mb-2">Your Hand</h3>
          {currentHand.length === 0 ? (
            <p className="text-gray-500 text-center py-2">No cards</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {currentHand.map(card => (
                <div key={card.id} className="flex flex-col items-center">
                  <GameCard 
                    card={card} 
                    disabled={card.used || state.diceValue === 0} 
                    onClick={() => !card.used && state.diceValue === 0 ? handleUseCard(card) : null} 
                  />
                  <div className="flex gap-1 mt-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled={card.used || state.diceValue > 0} 
                      onClick={() => handleUseCard(card)}
                    >
                      Use
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      disabled={card.used || state.diceValue > 0} 
                      onClick={() => handleTradeCard(card)}
                    >
                      Trade
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trade dialog */}
      <Dialog open={isTradeDialogOpen} onOpenChange={setIsTradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Offer Trade</DialogTitle>
            <DialogDescription>
              Choose a team to offer this card to
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {otherTeams.map(team => (
              <Button
                key={team}
                variant={targetTeam === team ? "default" : "outline"}
                className="capitalize"
                onClick={() => setTargetTeam(team)}
              >
                {team}
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsTradeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleOfferTrade} disabled={!targetTeam}>Offer Trade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Use card dialog for targeting */}
      <Dialog open={isUseCardDialogOpen} onOpenChange={setIsUseCardDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Use {selectedCard?.name}</DialogTitle>
            <DialogDescription>
              {selectedCard?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {selectedCard?.type === "public_statement" && (
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <User size={16} /> Choose opponent
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {opposingPlayers.map(player => (
                    <Button
                      key={player.id}
                      variant={targetPlayer === player.id ? "default" : "outline"}
                      className="capitalize"
                      onClick={() => setTargetPlayer(player.id)}
                    >
                      {player.team} ({player.id.split("-")[1]})
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedCard?.type === "distraction" && (
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <Dog size={16} /> Choose puppy
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {state.puppies.map((puppy, index) => (
                    <Button
                      key={index}
                      variant={targetPuppy === index ? "default" : "outline"}
                      onClick={() => setTargetPuppy(index)}
                    >
                      Puppy {index + 1} ({puppy.row}, {puppy.col})
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedCard?.type === "switcheroo" && (
              <div>
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <ArrowRight size={16} /> Swap two meeples
                </h3>
                <p className="text-sm">
                  After using this card, select two of your meeples to swap their positions.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsUseCardDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleConfirmUseCard}
              disabled={
                (selectedCard?.type === "public_statement" && !targetPlayer) ||
                (selectedCard?.type === "distraction" && targetPuppy === null)
              }
            >
              Use Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Trade offer dialog */}
      {state.cards.tradingOffer.from && (
        <Dialog open={!!state.cards.tradingOffer.from && state.cards.tradingOffer.to === currentTeam}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Trade Offer</DialogTitle>
              <DialogDescription>
                {state.cards.tradingOffer.from} team offers you this card:
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex justify-center py-4">
              {state.cards.tradingOffer.card && (
                <GameCard card={state.cards.tradingOffer.card} />
              )}
            </div>
            
            <DialogFooter>
              <Button variant="secondary" onClick={() => dispatch({ type: "DECLINE_TRADE" })}>
                Decline
              </Button>
              <Button onClick={() => dispatch({ type: "ACCEPT_TRADE" })}>
                Accept
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CardManager;
