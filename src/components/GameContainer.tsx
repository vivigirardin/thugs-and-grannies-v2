
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { GameProvider } from "@/context/GameContext";
import GameBoard from "./game/GameBoard";
import TeamSelector from "./game/TeamSelector";
import GameRules from "./game/GameRules";
import GameControls from "./game/GameControls";
import "./game/GameStyles.css"; // Import game styles for dice animation

const GameContainer: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <GameProvider>
      <div className={`flex ${isMobile ? "flex-col" : "flex-col"} items-center gap-4 max-w-full overflow-hidden`}>
        <div className={`${isMobile ? "w-full" : ""} overflow-auto max-w-full`}>
          <GameControls />
          <GameBoard />
        </div>
        <div className={`${isMobile ? "w-full" : ""} mt-2`}>
          <TeamSelector />
        </div>
        <div className={`${isMobile ? "w-full" : ""} mt-2`}>
          <GameRules />
        </div>
      </div>
    </GameProvider>
  );
};

export default GameContainer;
