
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/types/game";

interface HandCardActionsProps {
  card: Card;
  diceValue: number;
  onUse: (card: Card) => void;
  onTrade: (card: Card) => void;
}

const HandCardActions: React.FC<HandCardActionsProps> = ({ 
  card, 
  diceValue, 
  onUse, 
  onTrade 
}) => {
  return (
    <div className="flex gap-2 mt-2">
      <Button 
        size="sm" 
        variant="outline" 
        disabled={card.used || diceValue > 0} 
        onClick={() => onUse(card)}
      >
        Use
      </Button>
      <Button 
        size="sm" 
        variant="outline" 
        disabled={card.used || diceValue > 0} 
        onClick={() => onTrade(card)}
      >
        Trade
      </Button>
    </div>
  );
};

export default HandCardActions;
