import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useGame } from "@/context/GameContext";
import { Team } from "@/types/game";
import { CheckCircle } from "lucide-react";

const TeamSelector: React.FC = () => {
  const { dispatch } = useGame();
  const [selectedTeams, setSelectedTeams] = useState<Team[]>(["creeps", "politicians"]);
  
  const teams: { id: Team; name: string }[] = [
    { id: "creeps", name: "The Creeps Gang" },
    { id: "italian", name: "Italian Mafia" },
    { id: "politicians", name: "Politicians" },
    { id: "japanese", name: "Japanese Mafia" }
  ];
  
  const toggleTeam = (team: Team) => {
    if (team === "creeps" || team === "politicians") return;
    
    setSelectedTeams(prev => 
      prev.includes(team)
        ? prev.filter(t => t !== team)
        : [...prev, team]
    );
  };
  
  const handleStartGame = () => {
    dispatch({ type: "START_GAME", teams: selectedTeams });
  };
  
  const getTeamColorClass = (team: Team) => {
    switch (team) {
      case "creeps":
        return "bg-game-creeps text-white";
      case "italian":
        return "bg-game-italian text-white";
      case "politicians":
        return "bg-game-politicians text-white";
      case "japanese":
        return "bg-game-japanese text-white";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Select Teams</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {teams.map(team => (
              <div 
                key={team.id}
                className={`p-4 rounded-lg ${
                  team.id === "creeps" || team.id === "politicians"
                    ? "cursor-not-allowed opacity-75"
                    : "cursor-pointer"
                } relative ${
                  selectedTeams.includes(team.id) 
                    ? getTeamColorClass(team.id)
                    : "bg-muted"
                }`}
                onClick={() => toggleTeam(team.id)}
              >
                <h3 className="font-medium">{team.name}</h3>
                {selectedTeams.includes(team.id) && (
                  <CheckCircle className="absolute top-2 right-2 w-5 h-5" />
                )}
                {(team.id === "creeps" || team.id === "politicians") && (
                  <div className="text-xs mt-1">Required</div>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Creeps and Politicians are always included (5 players each). You may select additional teams.
          </p>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleStartGame}
            className="w-full"
          >
            Start Game
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TeamSelector;
