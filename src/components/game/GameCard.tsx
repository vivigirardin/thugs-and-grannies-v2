
import React from "react";
import { Card as CardType } from "@/types/game";
import { 
  Bomb, 
  ArrowRight, 
  Dog, 
  UserMinus2, 
  Sword, 
  Eye, 
  DollarSign, 
  Car, 
  User, 
  ClipboardList, 
  SpeakerOff, 
  FileWarning, 
  NotepadText, 
  Dice5, 
  Fist,
  SwitchCamera
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const cardIcons: Record<string, React.ReactNode> = {
  smoke_bomb: <Bomb size={24} />,
  shortcut: <ArrowRight size={24} />,
  fake_pass: <UserMinus2 size={24} />,
  distraction: <Dog size={24} />,
  switcheroo: <SwitchCamera size={24} />,
  dumpster_dive: <UserMinus2 size={24} />,
  shiv: <Sword size={24} />,
  lookout: <Eye size={24} />,
  bribe: <DollarSign size={24} />,
  getaway_car: <Car size={24} />,
  cover_story: <User size={24} />,
  lobbyist: <ClipboardList size={24} />,
  public_statement: <SpeakerOff size={24} />,
  red_tape: <FileWarning size={24} />,
  shadow_step: <NotepadText size={24} />,
  meditation: <Dice5 size={24} />,
  honor_bound: <Fist size={24} />
};

const getTeamColor = (team?: string) => {
  if (!team) return "bg-gray-200";
  
  switch (team) {
    case "creeps":
      return "bg-red-500";
    case "italian":
      return "bg-green-600";
    case "politicians":
      return "bg-blue-500";
    case "japanese":
      return "bg-yellow-500";
    default:
      return "bg-gray-200";
  }
};

const getTeamTextColor = (team?: string) => {
  if (!team) return "text-gray-900";
  if (team === "japanese") return "text-gray-900";
  return "text-white";
};

interface GameCardProps {
  card: CardType;
  onClick?: () => void;
  disabled?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ card, onClick, disabled = false }) => {
  const bgColor = getTeamColor(card.team);
  const textColor = getTeamTextColor(card.team);
  
  return (
    <Card 
      className={`w-36 h-52 transition-all ${disabled ? 'opacity-60' : 'hover:scale-105'} cursor-pointer ${bgColor} ${textColor} select-none`}
      onClick={() => !disabled && onClick?.()}
    >
      <CardHeader className="p-3">
        <div className="flex justify-center mb-1">
          {cardIcons[card.type]}
        </div>
        <CardTitle className="text-center text-sm font-bold">{card.name}</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <CardDescription className={`text-center text-xs ${textColor} font-medium leading-tight`}>
          {card.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-2">
        <p className="w-full text-center text-xs italic">{card.flavor}</p>
      </CardFooter>
      {card.team && (
        <div className="absolute bottom-0 left-0 right-0 p-1 text-center text-xs font-medium border-t border-black/20">
          Team {card.team.charAt(0).toUpperCase() + card.team.slice(1)}
        </div>
      )}
      {card.used && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold">
          USED
        </div>
      )}
    </Card>
  );
};

export default GameCard;
