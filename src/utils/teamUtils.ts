/**
 * Utility functions for team-related operations in the game
 */

import { Team } from "@/types/game";

/**
 * Returns the CSS class name for a team's color scheme
 * @param team The team identifier
 * @returns CSS class string for the team's colors
 */
export const getTeamColorClass = (team: Team) => {
  return {
    gang: "bg-game-gang text-white",
    mafia: "bg-game-mafia text-white",
    politicians: "bg-game-politicians text-white",
    cartel: "bg-game-cartel text-white"
  }[team] || "bg-gray-500 text-white";
};

/**
 * Calculates the number of escaped meeples for each team
 * @param players Array of player objects with team and escaped status
 * @returns Record of escaped meeple counts by team
 */
export const calculateEscapedMeeples = (players: { team: Team; escaped: boolean }[]) => {
  return players.reduce((escaped: Record<Team, number>, player) => {
    if (player.escaped) {
      return {
        ...escaped,
        [player.team]: (escaped[player.team] || 0) + 1
      };
    }
    return escaped;
  }, {
    gang: 0,
    mafia: 0,
    politicians: 0,
    cartel: 0
  });
};

/**
 * Determines which team has the most escaped meeples
 * @param escapedMeeples Record of escaped meeple counts by team
 * @returns Object containing the winning team and their escape count
 */
export const findTeamWithMostEscapes = (escapedMeeples: Record<Team, number>) => {
  return Object.entries(escapedMeeples).reduce<{ team: Team | null; count: number }>(
    (max, [team, count]) => 
      count > max.count ? { team: team as Team, count } : max,
    { team: null, count: 0 }
  );
};
