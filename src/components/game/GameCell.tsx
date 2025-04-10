
import React from "react";
import { Cell } from "@/types/game";
import { useGame } from "@/context/GameContext";
import { Shield, User, LogOut, CircleDot, Building, Library, School, Building2 } from "lucide-react";

interface GameCellProps {
  cell: Cell;
  onClick: () => void;
  isValidMove: boolean;
  isSelected?: boolean;
  isSelectable?: boolean;
}

const GameCell: React.FC<GameCellProps> = ({ 
  cell, 
  onClick, 
  isValidMove, 
  isSelected = false,
  isSelectable = false
}) => {
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
      case "city":
        return "bg-blue-300";
      case "library":
        return "bg-amber-200";
      case "school":
        return "bg-green-200";
      case "townhall":
        return "bg-purple-200";
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

  const renderLandmarkIcon = () => {
    switch (cell.type) {
      case "city":
        return <Building className="w-6 h-6 text-blue-600" />;
      case "library":
        return <Library className="w-6 h-6 text-amber-600" />;
      case "school":
        return <School className="w-6 h-6 text-green-600" />;
      case "townhall":
        return <Building2 className="w-6 h-6 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div 
      className={`w-8 h-8 flex items-center justify-center relative ${getCellClass()} ${
        isValidMove ? "cursor-pointer ring-2 ring-yellow-400" :
        isSelectable ? "cursor-pointer ring-2 ring-blue-400" :
        isSelected ? "ring-2 ring-green-500" : ""
      }`}
      onClick={onClick}
    >
      {cell.type === "exit" && <LogOut className="w-6 h-6 text-white" />}
      {cell.type === "police" && <Shield className="w-6 h-6 text-white" />}
      {cell.type === "granny" && <User className="w-6 h-6 text-pink-700" />}
      {renderLandmarkIcon()}
      
      {player && (
        <div 
          className={`absolute inset-0 flex items-center justify-center ${getPlayerClass()} rounded-full m-1 border-2 ${
            isSelected ? "border-green-500" :
            isSelectable ? "border-blue-400" : "border-white"
          }`}
        >
          <span className="text-white font-bold text-xs">
            {player.team.slice(0, 1).toUpperCase()}
          </span>
        </div>
      )}

      {isValidMove && <CircleDot className="absolute top-0 right-0 w-3 h-3 text-yellow-400" />}
    </div>
  );
};

export default GameCell;
