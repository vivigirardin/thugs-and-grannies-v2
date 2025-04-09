
import React from "react";
import { GameProvider } from "@/context/GameContext";
import GameBoard from "./game/GameBoard";
import GameControls from "./game/GameControls";
import TeamSelector from "./game/TeamSelector";
import GameRules from "./game/GameRules";

const GameContainer: React.FC = () => {
  return (
    <GameProvider>
      <div className="flex flex-col items-center gap-4">
        <GameControls />
        <GameBoard />
        <TeamSelector />
        <div className="mt-4">
          <GameRules />
        </div>
      </div>
    </GameProvider>
  );
};

export default GameContainer;
