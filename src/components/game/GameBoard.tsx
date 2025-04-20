import React, { useMemo, useCallback } from "react";
import { useGame } from "@/context/GameContext";
import { useCurrentTeam } from "@/hooks/use-current-team";
import GameCell from "./GameCell";
import { Position } from "@/types/game";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";
import { calculateEscapedMeeples } from "@/utils/teamUtils";
import EscapedMeeplesSummary from "./EscapedMeeplesSummary";
import JailSummary from "./JailSummary";

const GameBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const currentTeam = useCurrentTeam();

  const selectedMeeple = useMemo(() => 
    state.activeMeeple 
      ? state.players.find(p => p.id === state.activeMeeple) 
      : null,
    [state.activeMeeple, state.players]
  );

  const escapedMeeplesByTeam = useMemo(() => 
    calculateEscapedMeeples(state.players), 
    [state.players]
  );

  const handleCellClick = useCallback((position: Position) => {
    if (state.gameStatus !== "playing") {
      return;
    }

    if (selectedMeeple && state.diceValue > 0 && !selectedMeeple.arrested && !selectedMeeple.escaped) {
      const targetCell = state.cells[position.row][position.col];
      if (targetCell.type === "entrance" && targetCell.connectedTo) {
        dispatch({ type: "MOVE_PLAYER", position });
        return;
      }
      
      const dx = Math.abs(position.row - selectedMeeple.position.row);
      const dy = Math.abs(position.col - selectedMeeple.position.col);
      const distance = dx + dy;

      if (distance > 0 && distance <= state.diceValue) {
        dispatch({ type: "MOVE_PLAYER", position });
      }
      return;
    }

    if (state.diceValue > 0) {
      const cell = state.cells[position.row][position.col];
      if (cell.occupiedBy) {
        const player = state.players.find(p => p.id === cell.occupiedBy);
        if (player && player.team === currentTeam && !player.arrested && !player.escaped) {
          dispatch({ type: "SELECT_MEEPLE", playerId: player.id });
        }
      }
    }
  }, [state.gameStatus, selectedMeeple, state.diceValue, dispatch, currentTeam]);

  const isValidMove = useCallback((rowIndex: number, colIndex: number) => {
    if (state.gameStatus !== "playing" || !selectedMeeple || 
        selectedMeeple.arrested || selectedMeeple.escaped || state.diceValue === 0) {
      return false;
    }
    
    if (state.immobilizedPlayers.includes(selectedMeeple.id)) {
      return false;
    }
    
    const cell = state.cells[rowIndex][colIndex];
    
    if (cell.type === "entrance" && !cell.occupied) {
      return true;
    }
    
    if (cell.occupied || cell.type === "police" || cell.type === "granny" || (cell.type !== "path" && cell.type !== "exit")) {
      return false;
    }
    
    const dx = Math.abs(rowIndex - selectedMeeple.position.row);
    const dy = Math.abs(colIndex - selectedMeeple.position.col);
    
    if (dx + dy > state.diceValue || dx + dy === 0) {
      return false;
    }
    
    const isHorizontalMove = selectedMeeple.position.row === rowIndex;
    const isVerticalMove = selectedMeeple.position.col === colIndex;
    
    if (isHorizontalMove || isVerticalMove) {
      if (isHorizontalMove) {
        const startCol = Math.min(selectedMeeple.position.col, colIndex);
        const endCol = Math.max(selectedMeeple.position.col, colIndex);
        const row = rowIndex;
        
        for (let col = startCol + 1; col < endCol; col++) {
          if (state.cells[row][col].type === "granny") {
            return false;
          }
        }
      } else {
        const startRow = Math.min(selectedMeeple.position.row, rowIndex);
        const endRow = Math.max(selectedMeeple.position.row, rowIndex);
        const col = colIndex;
        
        for (let row = startRow + 1; row < endRow; row++) {
          if (state.cells[row][col].type === "granny") {
            return false;
          }
        }
      }
    }
    
    return true;
  }, [state.gameStatus, selectedMeeple, state.diceValue, state.immobilizedPlayers, state.cells]);

  const isSelectableMeeple = useCallback((rowIndex: number, colIndex: number) => {
    if (state.gameStatus !== "playing" || state.diceValue === 0) {
      return false;
    }
    
    const cell = state.cells[rowIndex][colIndex];
    if (!cell.occupiedBy) {
      return false;
    }
    
    const player = state.players.find(p => p.id === cell.occupiedBy);
    
    if (player && state.immobilizedPlayers.includes(player.id)) {
      return false;
    }
    
    return player && player.team === currentTeam && !player.arrested && !player.escaped;
  }, [state.gameStatus, state.diceValue, state.cells, currentTeam]);

  return (
    <div className="flex flex-col items-center mb-6 overflow-auto max-w-full relative">
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

      {state.gameStatus === "ended" && state.winner && (
        <div className="mt-4 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-center animate-fade-in">
          <div className="flex items-center justify-center mb-2">
            <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-bold capitalize">{state.winner} Team Wins!</h2>
          </div>
          <p className="text-gray-700">
            With {escapedMeeplesByTeam[state.winner]} escaped meeples
          </p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {selectedMeeple && (
          <Button
            onClick={() => dispatch({ type: "DESELECT_MEEPLE" })}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-white shadow-md"
          >
            <span className="text-xs">Change Meeple</span>
          </Button>
        )}
        
        {state.canUndo && (
          <Button
            onClick={() => dispatch({ type: "UNDO_MOVE" })}
            variant="outline"
            size="sm"
            className="flex items-center gap-1 bg-white shadow-md"
          >
            <span className="text-xs">Undo Move</span>
          </Button>
        )}
      </div>

      <EscapedMeeplesSummary 
        escapedMeeples={escapedMeeplesByTeam}
        winner={state.winner}
        gameStatus={state.gameStatus}
      />

      <JailSummary players={state.players} />
    </div>
  );
};

export default React.memo(GameBoard);
