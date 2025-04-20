
import React from "react";
import { Team } from "@/types/game";
import { getTeamColorClass } from "@/utils/teamUtils";

interface EscapedMeeplesSummaryProps {
  escapedMeeples: Record<Team, number>;
  winner: Team | null;
  gameStatus: "setup" | "playing" | "ended";
}

const EscapedMeeplesSummary: React.FC<EscapedMeeplesSummaryProps> = ({ 
  escapedMeeples, 
  winner,
  gameStatus 
}) => {
  if (!Object.values(escapedMeeples).some(count => count > 0)) return null;

  return (
    <div className="escaped-meeples mt-4">
      <div className="flex items-center mb-2">
        <div className="w-6 h-6 mr-2 flex items-center justify-center text-white">
          🏃
        </div>
        <h3 className="text-white font-bold">Escaped Meeples</h3>
      </div>
      <div className="flex flex-wrap gap-4">
        {(Object.entries(escapedMeeples) as [Team, number][]).map(([team, count]) => {
          if (count === 0) return null;
          
          const isWinner = gameStatus === "ended" && team === winner;
          
          return (
            <div key={team} className="flex flex-col items-center">
              <div className="mb-1 text-xs text-white capitalize flex items-center">
                {team}
                {isWinner && <span className="winner-badge">Winner!</span>}
              </div>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getTeamColorClass(team)}`}>
                  {count}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EscapedMeeplesSummary;
