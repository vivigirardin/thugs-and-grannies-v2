
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGame } from "@/context/GameContext";
import DiceControl from "./DiceControl";
import EndTurnButton from "./EndTurnButton";
import TurnIndicatorDialog from "./TurnIndicatorDialog";

const GameControls: React.FC = () => {
  const { state } = useGame();
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-col ${isMobile ? "items-start gap-2" : "items-center gap-4"} mb-4`}>
      <div className="flex items-center justify-between w-full">
        <DiceControl />
        <EndTurnButton />
      </div>
      
      <TurnIndicatorDialog
        open={state.gameStatus === "playing" && state.diceValue === 0}
        onOpenChange={() => {}}
      />
    </div>
  );
};

export default GameControls;
