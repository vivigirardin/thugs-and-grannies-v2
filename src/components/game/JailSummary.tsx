
import React from "react";
import { Team, Meeple } from "@/types/game";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getTeamColorClass } from "@/utils/teamUtils";

interface JailSummaryProps {
  players: Meeple[];
}

const JailSummary: React.FC<JailSummaryProps> = ({ players }) => {
  const jailedPlayersByTeam = React.useMemo(() => {
    const jailed = players.filter(p => p.arrested);
    const byTeam: Record<string, typeof jailed> = {};
    
    jailed.forEach(player => {
      if (!byTeam[player.team]) {
        byTeam[player.team] = [];
      }
      byTeam[player.team].push(player);
    });
    
    return byTeam;
  }, [players]);

  if (Object.keys(jailedPlayersByTeam).length === 0) return null;

  return (
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
                  className={`w-8 h-8 ${getTeamColorClass(player.team)}`}
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
  );
};

export default JailSummary;
