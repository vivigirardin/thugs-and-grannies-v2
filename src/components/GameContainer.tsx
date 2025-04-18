
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { GameProvider } from "@/context/GameContext";
import GameBoard from "./game/GameBoard";
import TeamSelector from "./game/TeamSelector";
import GameRules from "./game/GameRules";
import GameControls from "./game/GameControls";
import CardManager from "./game/CardManager";
import "./game/GameStyles.css"; // Import game styles for dice animation

const GameContainer: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <GameProvider>
      <div className={`flex ${isMobile ? "flex-col" : "flex-col"} items-center gap-4 max-w-full overflow-hidden`}>
        {/* Game controls (Roll Dice) comes first in the turn order */}
        <div className={`${isMobile ? "w-full" : ""} mt-2 mb-2`}>
          <GameControls />
        </div>
        
        {/* Card Manager (Draw/Play Card) comes second in the turn order */}
        <div className={`${isMobile ? "w-full" : ""} mt-2 mb-4`}>
          <CardManager />
        </div>
        
        {/* The game board shows the board and handles meeple movement */}
        <div className={`${isMobile ? "w-full" : ""} overflow-auto max-w-full`}>
          <GameBoard />
        </div>
        
        {/* Team selector and rules last */}
        <div className={`${isMobile ? "w-full" : ""} mt-4`}>
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
