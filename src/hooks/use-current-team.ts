
import { useGame } from "@/context/GameContext";

export const useCurrentTeam = () => {
  const { state } = useGame();
  return state.players[state.currentPlayer]?.team;
};
