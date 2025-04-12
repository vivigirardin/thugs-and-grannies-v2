
import React from "react";
import { GameProvider } from "@/context/GameContext";
import GameBoard from "./game/GameBoard";
import TeamSelector from "./game/TeamSelector";
import GameRules from "./game/GameRules";
import "./game/GameStyles.css"; // Import game styles for dice animation

const GameContainer: React.FC = () => {
  return (
    <GameProvider>
      <div className="flex flex-col items-center gap-4 max-w-full overflow-hidden">
        <div className="overflow-auto max-w-full w-full">
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
