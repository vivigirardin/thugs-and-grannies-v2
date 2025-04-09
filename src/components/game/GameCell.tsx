
import React from "react";
import { Cell } from "@/types/game";
import { useGame } from "@/context/GameContext";
import { Shield, User, LogOut, CircleDot } from "lucide-react";

interface GameCellProps {
  cell: Cell;
  onClick: () => void;
  isValidMove: boolean;
}

const GameCell: React.FC<GameCellProps> = ({ cell, onClick, isValidMove }) => {
  const { state } = useGame();
  const player = cell.occupiedBy ? state.players.find(p => p.id === cell.occupiedBy) : undefined;

  const getCellClass = () => {
    switch (cell.type) {
      case "path":
        return "bg-game-path";
      case "exit":
        return "bg-game-exit";
      case "police":
        return "bg-game-police";
      case "granny":
        return "bg-game-granny";
      default:
        return "bg-gray-200";
    }
  };

  const getPlayerClass = () => {
    if (!player) return "";
    
    switch (player.team) {
      case "creeps":
        return "bg-game-creeps";
      case "italian":
        return "bg-game-italian";
      case "politicians":
        return "bg-game-politicians";
      case "japanese":
        return "bg-game-japanese";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div 
      className={`w-12 h-12 flex items-center justify-center relative ${getCellClass()} ${
        isValidMove ? "cursor-pointer ring-2 ring-yellow-400" : ""
      }`}
      onClick={onClick}
    >
      {cell.type === "exit" && <LogOut className="w-8 h-8 text-white" />}
      {cell.type === "police" && <Shield className="w-8 h-8 text-white" />}
      {cell.type === "granny" && <User className="w-8 h-8 text-pink-700" />}
      
      {player && (
        <div 
          className={`absolute inset-0 flex items-center justify-center ${getPlayerClass()} rounded-full m-2 border-2 border-white`}
        >
          <span className="text-white font-bold">
            {player.team.slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}

      {isValidMove && <CircleDot className="absolute top-0 right-0 w-4 h-4 text-yellow-400" />}
    </div>
  );
};

export default GameCell;
