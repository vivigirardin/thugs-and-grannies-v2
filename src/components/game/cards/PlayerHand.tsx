
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, Team } from "@/types/game";
import GameCard from "../GameCard";

interface PlayerHandProps {
  team: Team;
  cards: Card[];
  diceValue: number;
  onUseCard: (card: Card) => void;
  onTradeCard: (card: Card) => void;
}

const PlayerHand: React.FC<PlayerHandProps> = ({ team, cards, diceValue, onUseCard, onTradeCard }) => {
  return (
    <div>
      <h3 className="font-bold mb-2 capitalize">{team}'s Hand</h3>
      {cards.length === 0 ? (
        <p className="text-gray-500 text-center py-2">No cards</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map(card => (
            <div key={card.id} className="flex flex-col items-center">
              <GameCard 
                card={card} 
                disabled={card.used || diceValue > 0} 
                onClick={() => !card.used && diceValue === 0 ? onUseCard(card) : null} 
              />
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  disabled={card.used || diceValue > 0} 
                  onClick={() => onUseCard(card)}
                >
                  Use
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  disabled={card.used || diceValue > 0} 
                  onClick={() => onTradeCard(card)}
                >
                  Trade
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerHand;
