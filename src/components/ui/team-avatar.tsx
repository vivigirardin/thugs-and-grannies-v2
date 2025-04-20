
import React from 'react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Team } from "@/types/game";

interface TeamAvatarProps {
  team: Team;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const TeamAvatar = React.forwardRef<HTMLDivElement, TeamAvatarProps>(
  ({ team, size = 'md', className }, ref) => {
    const sizeClasses = {
      sm: 'h-6 w-6 text-xs',
      md: 'h-8 w-8 text-sm',
      lg: 'h-10 w-10 text-base'
    };

    const teamColorClasses = {
      gang: 'bg-game-gang text-white',
      mafia: 'bg-game-mafia text-white',
      politicians: 'bg-game-politicians text-white',
      cartel: 'bg-game-cartel text-white'
    };

    return (
      <Avatar 
        ref={ref}
        className={cn(
          sizeClasses[size],
          teamColorClasses[team],
          className
        )}
      >
        <AvatarFallback>
          {team.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    );
  }
);

TeamAvatar.displayName = 'TeamAvatar';

export { TeamAvatar };

