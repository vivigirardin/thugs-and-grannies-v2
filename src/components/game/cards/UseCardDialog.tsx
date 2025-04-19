
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/types/game";
import { User, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Player {
  id: string;
  team: string;
}

interface UseCardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
  opposingPlayers: Player[];
  selectedPlayer: string | null;
  onPlayerSelect: (playerId: string) => void;
  onConfirm: () => void;
}

const UseCardDialog: React.FC<UseCardDialogProps> = ({
  isOpen,
  onClose,
  card,
  opposingPlayers,
  selectedPlayer,
  onPlayerSelect,
  onConfirm,
}) => {
  if (!card) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Use {card.name}</DialogTitle>
          <DialogDescription>
            {card.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {card.type === "public_statement" && (
            <div>
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <User size={16} /> Choose opponent
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {opposingPlayers.map(player => (
                  <Button
                    key={player.id}
                    variant={selectedPlayer === player.id ? "default" : "outline"}
                    className="capitalize"
                    onClick={() => onPlayerSelect(player.id)}
                  >
                    {player.team} ({player.id.split("-")[1]})
                  </Button>
                ))}
              </div>
            </div>
          )}

          {card.type === "switcheroo" && (
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
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={onConfirm}
            disabled={card.type === "public_statement" && !selectedPlayer}
          >
            Use Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UseCardDialog;
