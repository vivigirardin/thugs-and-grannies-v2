
import React, { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGame } from "@/context/GameContext";
import DiceControl from "../game/controls/DiceControl";
import EndTurnButton from "../game/controls/EndTurnButton";
import TurnIndicatorDialog from "../game/controls/TurnIndicatorDialog";

const GameControls: React.FC = () => {
  const { state } = useGame();
  const isMobile = useIsMobile();
  const [showTurnDialog, setShowTurnDialog] = useState(false);

  useEffect(() => {
    if (state.gameStatus === "playing" && state.diceValue === 0) {
      setShowTurnDialog(true);
    }
  }, [state.currentPlayer, state.gameStatus]);

  return (
    <div className={`flex flex-col ${isMobile ? "items-start gap-2" : "items-center gap-4"} mb-4`}>
      <div className="flex items-center justify-between w-full">
        <DiceControl />
        <EndTurnButton />
      </div>
      
      <TurnIndicatorDialog
        open={showTurnDialog}
        onOpenChange={setShowTurnDialog}
      />
    </div>
  );
};

export default GameControls;
