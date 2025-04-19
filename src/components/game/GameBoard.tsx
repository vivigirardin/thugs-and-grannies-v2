import React from "react";
import { useGame } from "@/context/GameContext";
import { useCurrentTeam } from "@/hooks/use-current-team";
import GameCell from "./GameCell";
import { Position, Team } from "@/types/game";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy } from "lucide-react";

const GameBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const currentTeam = useCurrentTeam();
  const selectedMeeple = state.activeMeeple 
    ? state.players.find(p => p.id === state.activeMeeple) 
    : null;

  // Record of escaped meeples by team
  const escapedMeeplesByTeam = React.useMemo(() => {
    const escaped: Record<Team, number> = {
      gang: 0,
      mafia: 0,
      politicians: 0,
      cartel: 0
    };
    
    state.players.forEach(player => {
      if (player.escaped) {
        escaped[player.team]++;
      }
    });
    
    return escaped;
  }, [state.players]);
  
  // Determine the team with most escaped meeples
  const mostEscapedMeeples = React.useMemo(() => {
    let maxTeam: Team | null = null;
    let maxCount = 0;
    
    (Object.entries(escapedMeeplesByTeam) as [Team, number][]).forEach(([team, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxTeam = team;
      }
    });
    
    return { team: maxTeam, count: maxCount };
  }, [escapedMeeplesByTeam]);

  const hasEscapedMeeples = Object.values(escapedMeeplesByTeam).some(count => count > 0);

  const handleCellClick = (position: Position) => {
    if (state.gameStatus !== "playing") {
      return;
    }

    // If we have a selected meeple and dice is rolled, try to move
    if (selectedMeeple && state.diceValue > 0 && !selectedMeeple.arrested && !selectedMeeple.escaped) {
      // Check if this is an entrance
      const targetCell = state.cells[position.row][position.col];
      if (targetCell.type === "entrance" && targetCell.connectedTo) {
        // Special case for entrances - can move regardless of dice value
        dispatch({ type: "MOVE_PLAYER", position });
        return;
      }
      
      // Regular move - check distance
      const dx = Math.abs(position.row - selectedMeeple.position.row);
      const dy = Math.abs(position.col - selectedMeeple.position.col);
      const distance = dx + dy;

      if (distance > 0 && distance <= state.diceValue) {
        dispatch({ type: "MOVE_PLAYER", position });
      }
      return;
    }

    // If dice is rolled but no meeple is selected, check if there's a meeple to select
    if (state.diceValue > 0) {
      const cell = state.cells[position.row][position.col];
      if (cell.occupiedBy) {
        const player = state.players.find(p => p.id === cell.occupiedBy);
        if (player && player.team === currentTeam && !player.arrested && !player.escaped) {
          dispatch({ type: "SELECT_MEEPLE", playerId: player.id });
        }
      }
    }
  };

  const isValidMove = (rowIndex: number, colIndex: number) => {
    if (state.gameStatus !== "playing" || !selectedMeeple || 
        selectedMeeple.arrested || selectedMeeple.escaped || state.diceValue === 0) {
      return false;
    }
    
    if (state.immobilizedPlayers.includes(selectedMeeple.id)) {
      return false;
    }
    
    const cell = state.cells[rowIndex][colIndex];
    
    // Special case for entrances - can always use them
    if (cell.type === "entrance" && !cell.occupied) {
      return true;
    }
    
    // Can't move to occupied cells or cells with police or grannies
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
  };

  const isSelectableMeeple = (rowIndex: number, colIndex: number) => {
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
  };

  const getJailedPlayersByTeam = () => {
    const jailed = state.players.filter(p => p.arrested);
    const byTeam: Record<string, typeof jailed> = {};
    
    jailed.forEach(player => {
      if (!byTeam[player.team]) {
        byTeam[player.team] = [];
      }
      byTeam[player.team].push(player);
    });
    
    return byTeam;
  };

  const jailedPlayersByTeam = getJailedPlayersByTeam();

  const getTeamColor = (team: string) => {
    switch (team) {
      case "gang":
        return "bg-game-gang text-white";
      case "mafia":
        return "bg-game-mafia text-white";
      case "politicians":
        return "bg-game-politicians text-white";
      case "cartel":
        return "bg-game-cartel text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

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

      {Object.values(escapedMeeplesByTeam).some(count => count > 0) && (
        <div className="escaped-meeples mt-4">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 mr-2 flex items-center justify-center text-white">
              🏃
            </div>
            <h3 className="text-white font-bold">Escaped Meeples</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {(Object.entries(escapedMeeplesByTeam) as [Team, number][]).map(([team, count]) => {
              if (count === 0) return null;
              
              const isWinner = state.gameStatus === "ended" && team === state.winner;
              
              return (
                <div key={team} className="flex flex-col items-center">
                  <div className="mb-1 text-xs text-white capitalize flex items-center">
                    {team}
                    {isWinner && <span className="winner-badge">Winner!</span>}
                  </div>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTeamColor(team)}`}>
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {Object.keys(jailedPlayersByTeam).length > 0 && (
        <div className="mt-6 p-3 bg-gray-800 rounded-lg w-full max-w-xl">
          <div className="flex items-center mb-2">
            <div className="w-6 h-6 mr-2 flex items-center justify-center text-white">
              👮
            </div>
            <h3 className="text-white font-bold">Jail</h3>
          </div>
          <div className="flex flex-wrap gap-4">
            {Object.entries(jailedPlayersByTeam).map(([team, players]) => (
              <div key={team} className="flex flex-col items-center">
                <div className="mb-1 text-xs text-gray-300 capitalize">{team}</div>
                <div className="flex flex-wrap gap-2">
                  {players.map(player => (
                    <Avatar 
                      key={player.id} 
                      className={`w-8 h-8 ${getTeamColor(team)}`}
                    >
                      <AvatarFallback className="text-xs">
                        {player.team.slice(0, 1).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameBoard;
