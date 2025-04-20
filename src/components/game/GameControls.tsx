
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGame } from "@/context/GameContext";
import DiceControl from "@/components/game/controls/DiceControl";
import EndTurnButton from "@/components/game/controls/EndTurnButton";

const GameControls: React.FC = () => {
  const { state } = useGame();
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-col ${isMobile ? "items-start gap-2" : "items-center gap-4"} mb-4`}>
      <div className="flex items-center justify-between w-full">
        <DiceControl />
        <EndTurnButton />
      </div>
    </div>
  );
};

export default GameControls;
