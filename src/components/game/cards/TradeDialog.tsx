
import React from 'react';
import { Button } from "@/components/ui/button";
import { Team } from "@/types/game";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TradeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  otherTeams: Team[];
  selectedTeam: Team | null;
  onTeamSelect: (team: Team) => void;
  onConfirm: () => void;
}

const TradeDialog: React.FC<TradeDialogProps> = ({
  isOpen,
  onClose,
  otherTeams,
  selectedTeam,
  onTeamSelect,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
              variant={selectedTeam === team ? "default" : "outline"}
              className="capitalize"
              onClick={() => onTeamSelect(team)}
            >
              {team}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm} disabled={!selectedTeam}>Offer Trade</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TradeDialog;
