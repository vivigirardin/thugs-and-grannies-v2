
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

const DiceControl: React.FC = () => {
  const { state, dispatch } = useGame();
  const isMobile = useIsMobile();
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  
  const handleRollDice = () => {
    if (state.gameStatus !== "playing") return;
    setIsDiceRolling(true);
    
    setTimeout(() => {
      dispatch({ type: "ROLL_DICE" });
      setIsDiceRolling(false);
    }, 500);
  };

  const renderDice = () => {
    if (state.diceValue === 0) {
      return <Dice6 className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} opacity-50`} />;
    }

    const DiceIcons = [
      <Dice1 key={1} className={`${isMobile ? "w-6 h-6" : "w-8 h-8"}`} />,
      <Dice2 key={2} className={`${isMobile ? "w-6 h-6" : "w-8 h-8"}`} />,
      <Dice3 key={3} className={`${isMobile ? "w-6 h-6" : "w-8 h-8"}`} />,
      <Dice4 key={4} className={`${isMobile ? "w-6 h-6" : "w-8 h-8"}`} />,
      <Dice5 key={5} className={`${isMobile ? "w-6 h-6" : "w-8 h-8"}`} />,
      <Dice6 key={6} className={`${isMobile ? "w-6 h-6" : "w-8 h-8"}`} />,
    ];
    
    return DiceIcons[state.diceValue - 1];
  };

  return (
    <div className="flex flex-col items-center">
      <Button
        onClick={handleRollDice}
        disabled={state.gameStatus !== "playing" || state.diceValue > 0}
        className="relative"
        size={isMobile ? "sm" : "default"}
      >
        <div className={state.diceValue === 0 ? "" : "animate-dice-roll"}>
          {renderDice()}
        </div>
        <span className={`${isMobile ? "text-sm ml-1" : "ml-2"}`}>Roll Dice</span>
      </Button>
      
      {state.diceValue > 0 && (
        <div className={`${isMobile ? "text-xs" : "text-sm"} font-medium mt-2`}>
          You rolled a {state.diceValue}!
        </div>
      )}
    </div>
  );
};

export default DiceControl;
