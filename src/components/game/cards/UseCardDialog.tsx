
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
          <p className="text-sm">
            Click "Use Card" to apply the card effect.
          </p>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={onConfirm}
          >
            Use Card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UseCardDialog;
