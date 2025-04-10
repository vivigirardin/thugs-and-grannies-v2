
import React from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

const GameControls: React.FC = () => {
  const { state, dispatch } = useGame();
  const currentTeam = state.players[state.currentPlayer]?.team;
  const selectedMeeple = state.activeMeeple 
    ? state.players.find(p => p.id === state.activeMeeple) 
    : null;

  const renderDice = () => {
    if (state.diceValue === 0) {
      return null;
    }

    const DiceIcons = [
      <Dice1 key={1} className="w-10 h-10" />,
      <Dice2 key={2} className="w-10 h-10" />,
      <Dice3 key={3} className="w-10 h-10" />,
      <Dice4 key={4} className="w-10 h-10" />,
      <Dice5 key={5} className="w-10 h-10" />,
      <Dice6 key={6} className="w-10 h-10" />
    ];
    
    return DiceIcons[state.diceValue - 1];
  };

  const handleRollDice = () => {
    if (state.gameStatus !== "playing") return;
    dispatch({ type: "ROLL_DICE" });
  };

  const handleEndTurn = () => {
    if (state.gameStatus !== "playing") return;
    dispatch({ type: "NEXT_TURN" });
  };

  const getTeamColor = () => {
    if (!currentTeam) return "bg-gray-500";
    
    switch (currentTeam) {
      case "creeps":
        return "bg-game-creeps text-white";
      case "italian":
        return "bg-game-italian text-white";
      case "politicians":
        return "bg-game-politicians text-white";
      case "japanese":
        return "bg-game-japanese text-white";
      default:
        return "bg-gray-500";
    }
  };

  // Count available meeples for the current team
  const getAvailableMeeples = () => {
    if (!currentTeam) return 0;
    
    return state.players.filter(
      p => p.team === currentTeam && !p.arrested && !p.escaped
    ).length;
  };

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      {state.gameStatus === "playing" && (
        <div className="text-sm text-gray-600 mb-1">
          Turn: {state.turnCount + 1} • Police: {state.police.length} • Grannies: {state.grannies.length}
        </div>
      )}
      
      {state.gameStatus === "playing" && currentTeam && (
        <>
          <div className={`p-3 rounded-lg ${getTeamColor()} text-center w-full max-w-md`}>
            <h3 className="font-bold text-lg capitalize">
              {currentTeam} Turn
              {selectedMeeple && ` (Meeple ${selectedMeeple.id.split('-')[1]} Selected)`}
            </h3>
            <div className="text-sm mt-1">
              {getAvailableMeeples()} meeples available
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center justify-center">
            {state.diceValue === 0 ? (
              <Button
                onClick={handleRollDice}
                className="relative group" 
              >
                Roll Dice
                <div className="ml-2 w-10 h-10 flex items-center justify-center bg-white/10 rounded">
                  <Dice6 className="w-8 h-8 group-hover:animate-spin" />
                </div>
              </Button>
            ) : (
              <div className="p-4 bg-white rounded-lg shadow-lg animate-fade-in">
                <div className={`animate-dice-roll`}>
                  {renderDice()}
                </div>
              </div>
            )}
            
            <Button
              onClick={handleEndTurn}
              variant="outline"
            >
              End Turn
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 max-w-md text-center">
            {state.diceValue === 0 ? (
              <p className="font-semibold">First, roll the dice to determine how far you can move.</p>
            ) : !selectedMeeple ? (
              <p className="font-semibold">Now, click on one of your meeples to select it.</p>
            ) : (
              <p className="font-semibold">You can move up to {state.diceValue} spaces. Click on a highlighted cell to move.</p>
            )}
            <p className="mt-2">
              <span className="inline-block w-3 h-3 bg-blue-300 mr-1"></span> City
              <span className="inline-block w-3 h-3 bg-amber-200 mx-1 ml-3"></span> Library
              <span className="inline-block w-3 h-3 bg-green-200 mx-1 ml-3"></span> School
              <span className="inline-block w-3 h-3 bg-purple-200 mx-1 ml-3"></span> Townhall
            </p>
            <p className="mt-1">Watch out for police 👮 and grannies 👵!</p>
          </div>
        </>
      )}
      
      {state.gameStatus === "ended" && (
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Game Over!</h2>
          {state.winner && (
            <p className="text-xl capitalize">
              The <span className="font-bold">{state.winner} team</span> wins!
            </p>
          )}
          <Button 
            onClick={() => dispatch({ type: "RESET_GAME" })}
            className="mt-4"
          >
            Play Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameControls;
