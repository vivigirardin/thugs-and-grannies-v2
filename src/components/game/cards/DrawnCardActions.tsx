
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/types/game";

interface DrawnCardActionsProps {
  onKeep: () => void;
  onUse: (card: Card) => void;
  card: Card;
}

const DrawnCardActions: React.FC<DrawnCardActionsProps> = ({ onKeep, onUse, card }) => {
  return (
    <div className="flex gap-2 mt-4">
      <Button size="sm" onClick={onKeep}>Keep Card</Button>
      <Button size="sm" onClick={() => onUse(card)}>Use Now</Button>
    </div>
  );
};

export default DrawnCardActions;
