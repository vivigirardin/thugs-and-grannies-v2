
import React from "react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/context/GameContext";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

const GameControls: React.FC = () => {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players[state.currentPlayer];

  const renderDice = () => {
    const DiceIcons = [
      <Dice1 key={1} className="w-10 h-10" />,
      <Dice2 key={2} className="w-10 h-10" />,
      <Dice3 key={3} className="w-10 h-10" />,
      <Dice4 key={4} className="w-10 h-10" />,
      <Dice5 key={5} className="w-10 h-10" />,
      <Dice6 key={6} className="w-10 h-10" />
    ];
    
    return state.diceValue > 0 ? DiceIcons[state.diceValue - 1] : null;
  };

  const handleRollDice = () => {
    if (state.gameStatus !== "playing") return;
    if (currentPlayer && !currentPlayer.arrested && !currentPlayer.escaped) {
      dispatch({ type: "ROLL_DICE" });
    }
  };

  const handleEndTurn = () => {
    if (state.gameStatus !== "playing") return;
    dispatch({ type: "NEXT_TURN" });
  };

  const getTeamColor = () => {
    if (!currentPlayer) return "bg-gray-500";
    
    switch (currentPlayer.team) {
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

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      {state.gameStatus === "playing" && (
        <div className="text-sm text-gray-600 mb-1">
          Turn: {state.turnCount + 1} • Police: {state.police.length} • Grannies: {state.grannies.length}
        </div>
      )}
      
      {state.gameStatus === "playing" && currentPlayer && (
        <>
          <div className={`p-3 rounded-lg ${getTeamColor()} text-center w-full max-w-md`}>
            <h3 className="font-bold text-lg capitalize">
              {currentPlayer.team} Turn
              {currentPlayer.arrested && " (Arrested)"}
              {currentPlayer.escaped && " (Escaped)"}
            </h3>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center justify-center">
            <Button
              onClick={handleRollDice}
              disabled={
                state.diceValue > 0 || 
                currentPlayer.arrested || 
                currentPlayer.escaped
              }
              className="relative"
            >
              Roll Dice
              <div className={`ml-2 ${state.diceValue > 0 ? "animate-dice-roll" : ""}`}>
                {renderDice()}
              </div>
            </Button>
            
            <Button
              onClick={handleEndTurn}
              variant="outline"
            >
              End Turn
            </Button>
          </div>
          
          <div className="text-sm text-gray-600 max-w-md text-center">
            <p className="mb-1">Navigate through the city avoiding police and grannies.</p>
            <p className="mb-1">
              <span className="inline-block w-3 h-3 bg-blue-300 mr-1"></span> City
              <span className="inline-block w-3 h-3 bg-amber-200 mx-1 ml-3"></span> Library
              <span className="inline-block w-3 h-3 bg-green-200 mx-1 ml-3"></span> School
              <span className="inline-block w-3 h-3 bg-purple-200 mx-1 ml-3"></span> Townhall
            </p>
            {state.diceValue > 0 && (
              <p>You can move up to {state.diceValue} spaces. Click on a highlighted cell to move.</p>
            )}
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
