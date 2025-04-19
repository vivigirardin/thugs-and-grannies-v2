
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/types/game";
import GameCard from "../GameCard";

interface DrawnCardProps {
  card: Card | null;
  onKeep: () => void;
  onUse: (card: Card) => void;
}

const DrawnCard: React.FC<DrawnCardProps> = ({ card, onKeep, onUse }) => {
  if (!card) return null;

  return (
    <div className="flex flex-col items-center mb-4 p-3 bg-amber-50 border border-amber-200 rounded">
      <h3 className="text-center mb-2 font-bold">Card Drawn</h3>
      <GameCard card={card} />
      <div className="flex gap-2 mt-4">
        <Button size="sm" onClick={onKeep}>Keep Card</Button>
        <Button size="sm" onClick={() => onUse(card)}>Use Now</Button>
      </div>
    </div>
  );
};

export default DrawnCard;
