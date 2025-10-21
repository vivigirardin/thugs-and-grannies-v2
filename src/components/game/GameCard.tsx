
import React from 'react';
import { Card as CardType } from "@/types/game";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { 
  Bomb, ArrowRight, UserMinus2, Dog, SwitchCamera, 
  Sword, Eye, DollarSign, Car, User, ClipboardList, 
  Speaker, FileWarning, FileText, Dice5 
} from "lucide-react";

interface GameCardProps {
  card: CardType;
  disabled?: boolean;
  onClick?: () => void;
}

const getCardIcon = (iconName: string) => {
  switch (iconName) {
    case "bomb": return <Bomb className="w-4 h-4" />;
    case "arrow-right": return <ArrowRight className="w-4 h-4" />;
    case "user-minus-2": return <UserMinus2 className="w-4 h-4" />;
    case "dog": return <Dog className="w-4 h-4" />;
    case "switch-camera": return <SwitchCamera className="w-4 h-4" />;
    case "sword": return <Sword className="w-4 h-4" />;
    case "eye": return <Eye className="w-4 h-4" />;
    case "dollar-sign": return <DollarSign className="w-4 h-4" />;
    case "car": return <Car className="w-4 h-4" />;
    case "user": return <User className="w-4 h-4" />;
    case "clipboard-list": return <ClipboardList className="w-4 h-4" />;
    case "speaker-off": return <Speaker className="w-4 h-4" />;
    case "file-warning": return <FileWarning className="w-4 h-4" />;
    case "notepad-text": return <FileText className="w-4 h-4" />;
    case "dice-5": return <Dice5 className="w-4 h-4" />;
    case "fist": return <User className="w-4 h-4" />;
    default: return null;
  }
};

const getCardTeamClass = (team?: string) => {
  if (!team) return "bg-white";
  
  switch (team) {
    case "gang": return "bg-game-gang";
    case "mafia": return "bg-game-mafia";
    case "politicians": return "bg-game-politicians";
    case "cartel": return "bg-game-cartel";
    default: return "bg-white";
  }
};

const GameCard: React.FC<GameCardProps> = ({ card, disabled = false, onClick }) => {
  const cardStyle = card.backgroundImage 
    ? {
        backgroundImage: `url(${card.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }
    : {};

  return (
    <Card 
      className={`w-48 h-64 ${disabled ? 'opacity-50' : 'cursor-pointer'} relative overflow-hidden`}
      style={cardStyle}
      onClick={!disabled && onClick ? onClick : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-bold text-white uppercase tracking-wide bg-black/65 px-2 py-1 rounded">{card.title || card.name}</CardTitle>
          <div className="rounded-full bg-white p-1">
            {getCardIcon(card.icon || "")}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex items-center">
        <div className="bg-black/55 rounded p-2 w-full">
          <p className="text-xs text-white text-center leading-relaxed">{card.description}</p>
          {card.flavor && (
            <p className="text-xs italic mt-2 text-white/80 text-center">{card.flavor}</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {card.team && (
          <div className="text-xs text-white capitalize bg-black/50 px-2 py-1 rounded">{card.team} card</div>
        )}
      </CardFooter>
    </Card>
  );
};

export default GameCard;
