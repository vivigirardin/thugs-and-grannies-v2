
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGame } from "@/context/GameContext";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { Button } from "@/components/ui/button";
import { SkipForward } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const EndTurnButton: React.FC = () => {
  const { state, dispatch } = useGame();
  const isMobile = useIsMobile();
  const currentTeam = useCurrentTeam();

  const handleEndTurn = () => {
    if (state.gameStatus !== "playing") return;
    
    // Store the current team for the toast message
    const previousTeam = currentTeam;
    
    // First dispatch the action to ensure state updates properly
    console.log("End Turn button clicked - dispatching NEXT_TURN action");    
    dispatch({ type: "NEXT_TURN" });
    
    // Then show toast after the state has been updated
    toast({
      title: "Turn Ended",
      description: `${previousTeam}'s turn has ended.`,
    });
  };

  return (
    <Button 
      onClick={handleEndTurn}
      variant="outline"
      size={isMobile ? "sm" : "default"}
      className="flex items-center gap-1"
      disabled={state.gameStatus !== "playing"}
    >
      <SkipForward className={`${isMobile ? "w-4 h-4" : "w-5 h-5"}`} />
      <span className={`${isMobile ? "text-xs" : "text-sm"}`}>End Turn</span>
    </Button>
  );
};

export default EndTurnButton;
