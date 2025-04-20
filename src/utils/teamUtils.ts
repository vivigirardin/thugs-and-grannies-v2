
import { Team } from "@/types/game";

export const getTeamColorClass = (team: Team) => {
  return {
    gang: "bg-game-gang text-white",
    mafia: "bg-game-mafia text-white",
    politicians: "bg-game-politicians text-white",
    cartel: "bg-game-cartel text-white"
  }[team] || "bg-gray-500 text-white";
};

export const calculateEscapedMeeples = (players: { team: Team; escaped: boolean }[]) => {
  const escaped: Record<Team, number> = {
    gang: 0,
    mafia: 0,
    politicians: 0,
    cartel: 0
  };
  
  players.forEach(player => {
    if (player.escaped) {
      escaped[player.team]++;
    }
  });
  
  return escaped;
};

export const findTeamWithMostEscapes = (escapedMeeples: Record<Team, number>) => {
  let maxTeam: Team | null = null;
  let maxCount = 0;
  
  (Object.entries(escapedMeeples) as [Team, number][]).forEach(([team, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxTeam = team;
    }
  });
  
  return { team: maxTeam, count: maxCount };
};
