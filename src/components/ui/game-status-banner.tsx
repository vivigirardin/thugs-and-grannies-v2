
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { GameStatus, Team } from "@/types/game";

interface GameStatusBannerProps {
  status: GameStatus;
  winner: Team | null;
}

export function GameStatusBanner({ status, winner }: GameStatusBannerProps) {
  if (status === "setup") {
    return (
      <Alert>
        <AlertTitle>Game Setup</AlertTitle>
        <AlertDescription>
          Select teams to begin the game
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "ended" && winner) {
    return (
      <Alert className="bg-green-100 border-green-200">
        <AlertTitle>Game Over!</AlertTitle>
        <AlertDescription>
          Team {winner} has won the game!
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

