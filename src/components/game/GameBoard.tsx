
import React from "react";
import { useGame } from "@/context/GameContext";
import GameCell from "./GameCell";
import { Position } from "@/types/game";

const GameBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const currentPlayer = state.players[state.currentPlayer];

  const handleCellClick = (position: Position) => {
    if (state.gameStatus !== "playing" || !currentPlayer || currentPlayer.arrested || currentPlayer.escaped) {
      return;
    }

    if (state.diceValue === 0) {
      return; // Player needs to roll the dice first
    }

    // Check if the move is valid
    const dx = Math.abs(position.row - currentPlayer.position.row);
    const dy = Math.abs(position.col - currentPlayer.position.col);
    const distance = dx + dy;

    if (distance > 0 && distance <= state.diceValue) {
      dispatch({ type: "MOVE_PLAYER", position });
    }
  };

  return (
    <div className="flex flex-col items-center mb-6">
      <div className="bg-game-board p-2 rounded-lg shadow-lg">
        <div className="grid grid-cols-8 gap-1">
          {state.cells.map((row, rowIndex) => 
            row.map((cell, colIndex) => (
              <GameCell 
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                onClick={() => handleCellClick({ row: rowIndex, col: colIndex })}
                isValidMove={
                  state.gameStatus === "playing" && 
                  currentPlayer && 
                  !currentPlayer.arrested && 
                  !currentPlayer.escaped && 
                  state.diceValue > 0 &&
                  (() => {
                    const dx = Math.abs(rowIndex - currentPlayer.position.row);
                    const dy = Math.abs(colIndex - currentPlayer.position.col);
                    return dx + dy <= state.diceValue && dx + dy > 0 && !cell.occupied;
                  })()
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
