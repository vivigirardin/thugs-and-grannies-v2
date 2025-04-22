import React from "react";
import { Square } from "@/types/game";
import { useGame } from "@/context/GameContext";
import { Shield, User, LogOut, CircleDot, Building, Library, School, Building2, DoorOpen, Goal, FlagTriangleRight } from "lucide-react";

interface GameCellProps {
  cell: Square;
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

  const isExit = state.exits.some(exit => 
    exit.row === cell.position.row && exit.col === cell.position.col
  );

  const getCellClass = () => {
    if (isExit) {
      return "bg-green-500";  // Use bright green for exits
    }
    
    switch (cell.type) {
      case "path":
        return "bg-game-path";
      case "exit":
        return "bg-green-500";  // Ensure exits are bright green
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
      case "entrance":
        return "bg-yellow-400";
      default:
        return "bg-gray-200";
    }
  };

  const getPlayerClass = () => {
    if (!player) return "";
    
    let baseClass = "";
    switch (player.team) {
      case "gang":
        baseClass = "bg-game-gang";
        break;
      case "mafia":
        baseClass = "bg-game-mafia";
        break;
      case "politicians":
        baseClass = "bg-game-politicians";
        break;
      case "cartel":
        baseClass = "bg-game-cartel";
        break;
      default:
        baseClass = "bg-gray-500";
    }
    
    return baseClass;
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
      case "entrance":
        return <DoorOpen className="w-6 h-6 text-yellow-700" />;
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
      } ${isExit ? "border-2 border-white" : ""}`}
      onClick={onClick}
    >
      {isExit && (
        <div className="absolute inset-0 flex items-center justify-center">
          <FlagTriangleRight className="w-6 h-6 text-white animate-pulse" />
        </div>
      )}
      
      {cell.type === "exit" && !isExit && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Goal className="w-6 h-6 text-white animate-pulse" />
        </div>
      )}
      
      {cell.type === "police" && (
        <div className="text-xs font-bold police-icon">👮</div>
      )}
      {cell.type === "granny" && (
        <div className="text-xs font-bold text-white text-lg">👵</div>
      )}
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
