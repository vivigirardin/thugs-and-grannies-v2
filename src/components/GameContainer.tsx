
import React from "react";
import { GameProvider } from "@/context/GameContext";
import GameBoard from "./game/GameBoard";
import GameControls from "./game/GameControls";
import TeamSelector from "./game/TeamSelector";
import GameRules from "./game/GameRules";

const GameContainer: React.FC = () => {
  return (
    <GameProvider>
      <div className="flex flex-col items-center gap-4 max-w-full overflow-hidden">
        <GameControls />
        <div className="overflow-auto max-w-full">
          <GameBoard />
        </div>
        <TeamSelector />
        <div className="mt-4">
          <GameRules />
        </div>
      </div>
    </GameProvider>
  );
};

export default GameContainer;
