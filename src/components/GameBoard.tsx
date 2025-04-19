import React, { useState, useMemo } from "react";
import { useGame } from "@/context/GameContext";
import GameCell from "./game/GameCell";
import { Position, Team } from "@/types/game";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, SkipForward, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import "../components/game/GameStyles.css";

const GameBoard: React.FC = () => {
  const { state, dispatch } = useGame();
  const { toast } = useToast();
  const currentTeam = state.players[state.currentPlayer]?.team;
  const selectedMeeple = state.activeMeeple 
    ? state.players.find(p => p.id === state.activeMeeple) 
    : null;
  const [isDiceRolling, setIsDiceRolling] = useState(false);
  const [showTurnDialog, setShowTurnDialog] = useState(false);

  const escapedMeeplesByTeam = useMemo(() => {
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
  
  const mostEscapedMeeples = useMemo(() => {
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

  const renderDice = () => {
    if (state.diceValue === 0) {
      return <Dice6 className="w-12 h-12 opacity-50" />;
    }

    const DiceIcons = [
      <Dice1 key={1} className="w-12 h-12" />,
      <Dice2 key={2} className="w-12 h-12" />,
      <Dice3 key={3} className="w-12 h-12" />,
      <Dice4 key={4} className="w-12 h-12" />,
      <Dice5 key={5} className="w-12 h-12" />,
      <Dice6 key={6} className="w-12 h-12" />
    ];
    
    return DiceIcons[state.diceValue - 1];
  };

  const handleRollDice = () => {
    if (state.gameStatus !== "playing") return;
    setIsDiceRolling(true);
    
    setTimeout(() => {
      dispatch({ type: "ROLL_DICE" });
      setIsDiceRolling(false);
    }, 500);
  };

  const handleEndTurn = () => {
    if (state.gameStatus !== "playing") return;
    dispatch({ type: "NEXT_TURN" });
    setShowTurnDialog(true);
  };

  React.useEffect(() => {
    if (state.gameStatus === "playing" && state.diceValue === 0) {
      setShowTurnDialog(true);
    }
  }, [state.currentPlayer, state.gameStatus]);

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

      <Dialog open={showTurnDialog} onOpenChange={setShowTurnDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center capitalize">
              {currentTeam}'s Turn
            </DialogTitle>
            <DialogDescription className="text-center">
              Roll the dice to determine how far you can move.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center gap-6 py-4">
            <div className={`p-4 rounded-full ${getTeamColor(currentTeam || "")}`}>
              <div className={`${isDiceRolling ? 'animate-dice-roll' : ''}`}>
                {renderDice()}
              </div>
            </div>
            
            {state.diceValue === 0 ? (
              <Button 
                onClick={handleRollDice}
                className="w-32"
              >
                Roll Dice
              </Button>
            ) : (
              <div className="text-center">
                <p className="mb-2 text-lg font-medium">You rolled a {state.diceValue}!</p>
                <p className="text-sm text-gray-600">Click a meeple to select it, then click a highlighted cell to move.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
        <Button 
          onClick={handleEndTurn}
          variant="outline"
          size="lg"
          className="flex flex-col items-center gap-1 bg-white shadow-lg"
          disabled={state.gameStatus !== "playing"}
        >
          <SkipForward className="w-6 h-6" />
          <span className="text-xs">End Turn</span>
        </Button>
      </div>

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
