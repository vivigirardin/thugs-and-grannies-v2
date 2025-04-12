
import React from "react";
import { useGame } from "@/context/GameContext";
import { Button } from "@/components/ui/button";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

const GameControls: React.FC = () => {
  const { state, dispatch } = useGame();

  const handleRollDice = () => {
    if (state.gameStatus !== "playing") return;
    dispatch({ type: "ROLL_DICE" });
  };

  const renderDice = () => {
    if (state.diceValue === 0) {
      return <Dice6 className="w-8 h-8 opacity-50" />;
    }

    const DiceIcons = [
      <Dice1 key={1} className="w-8 h-8" />,
      <Dice2 key={2} className="w-8 h-8" />,
      <Dice3 key={3} className="w-8 h-8" />,
      <Dice4 key={4} className="w-8 h-8" />,
      <Dice5 key={5} className="w-8 h-8" />,
      <Dice6 key={6} className="w-8 h-8" />,
    ];
    
    return DiceIcons[state.diceValue - 1];
  };

  return (
    <div className="flex items-center gap-4 mb-4">
      <Button
        onClick={handleRollDice}
        disabled={state.gameStatus !== "playing" || state.diceValue > 0}
        className="relative"
      >
        <div className={state.diceValue === 0 ? "" : "animate-dice-roll"}>
          {renderDice()}
        </div>
        <span className="ml-2">Roll Dice</span>
      </Button>
      
      {state.diceValue > 0 && (
        <div className="text-sm font-medium">
          You rolled a {state.diceValue}! Select a meeple to move.
        </div>
      )}
    </div>
  );
};

export default GameControls;
