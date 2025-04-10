
import React from "react";
import { useGame } from "@/context/GameContext";
import GameCell from "./GameCell";
import { Position } from "@/types/game";

const GameBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const currentTeam = state.players[state.currentPlayer]?.team;
  const selectedMeeple = state.activeMeeple 
    ? state.players.find(p => p.id === state.activeMeeple) 
    : null;

  const handleCellClick = (position: Position) => {
    if (state.gameStatus !== "playing") {
      return;
    }

    // If we have a selected meeple and dice is rolled, try to move
    if (selectedMeeple && state.diceValue > 0 && !selectedMeeple.arrested && !selectedMeeple.escaped) {
      // Check if the move is valid
      const dx = Math.abs(position.row - selectedMeeple.position.row);
      const dy = Math.abs(position.col - selectedMeeple.position.col);
      const distance = dx + dy;

      if (distance > 0 && distance <= state.diceValue) {
        dispatch({ type: "MOVE_PLAYER", position });
      }
      return;
    }

    // If we don't have a selected meeple, check if there's a meeple of the current team to select
    const cell = state.cells[position.row][position.col];
    if (cell.occupiedBy) {
      const player = state.players.find(p => p.id === cell.occupiedBy);
      if (player && player.team === currentTeam && !player.arrested && !player.escaped) {
        dispatch({ type: "SELECT_MEEPLE", playerId: player.id });
      }
    }
  };

  // Calculate if a cell is a valid move for the selected meeple
  const isValidMove = (rowIndex: number, colIndex: number) => {
    if (state.gameStatus !== "playing" || !selectedMeeple || 
        selectedMeeple.arrested || selectedMeeple.escaped || state.diceValue === 0) {
      return false;
    }
    
    const cell = state.cells[rowIndex][colIndex];
    
    // Can't move to occupied cells, landmarks (except exits)
    if (cell.occupied || 
        (cell.type !== "path" && cell.type !== "exit" && cell.type !== "police" && cell.type !== "granny")) {
      return false;
    }
    
    const dx = Math.abs(rowIndex - selectedMeeple.position.row);
    const dy = Math.abs(colIndex - selectedMeeple.position.col);
    return dx + dy <= state.diceValue && dx + dy > 0;
  };

  // Check if a cell contains a selectable meeple
  const isSelectableMeeple = (rowIndex: number, colIndex: number) => {
    if (state.gameStatus !== "playing" || state.activeMeeple !== null) {
      return false;
    }
    
    const cell = state.cells[rowIndex][colIndex];
    if (!cell.occupiedBy) {
      return false;
    }
    
    const player = state.players.find(p => p.id === cell.occupiedBy);
    return player && player.team === currentTeam && !player.arrested && !player.escaped;
  };

  return (
    <div className="flex flex-col items-center mb-6 overflow-auto max-w-full">
      <div className="bg-game-board p-2 rounded-lg shadow-lg">
        <div className="grid grid-cols-20 gap-0.5">
          {state.cells.map((row, rowIndex) => 
            row.map((cell, colIndex) => (
              <GameCell 
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                onClick={() => handleCellClick({ row: rowIndex, col: colIndex })}
                isValidMove={isValidMove(rowIndex, colIndex)}
                isSelected={selectedMeeple?.position.row === rowIndex && selectedMeeple?.position.col === colIndex}
                isSelectable={isSelectableMeeple(rowIndex, colIndex)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
