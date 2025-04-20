
import { BoardState, GameAction } from '@/types/game';
import { generateInitialBoard } from '@/utils/boardUtils';

export const gameStateReducer = (state: BoardState, action: GameAction): Partial<BoardState> => {
  switch (action.type) {
    case "START_GAME":
      return generateInitialBoard(action.teams);
      
    case "ROLL_DICE":
      return {
        diceValue: Math.floor(Math.random() * 6) + 1,
        activeMeeple: null,
      };
      
    case "NEXT_TURN": {
      console.log("NEXT_TURN action dispatched");
      console.log("Current player before switch:", state.currentPlayer);
      
      // Create a new object for active effects to avoid mutation
      const resetActiveEffects = {
        policeIgnore: [],
        grannyIgnore: [],
        policeImmobilized: false,
        policeExpansionDelay: false,
        moveDiagonally: null,
        policeMoveLimited: false,
        skippedPlayers: [...state.cards.activeEffects.skippedPlayers],
      };
    
      // Calculate the next player index
      const playersCount = state.players.length;
      if (playersCount === 0) {
        console.error("No players in game state");
        return {};
      }
      
      let nextPlayerIndex = (state.currentPlayer + 1) % playersCount;
      console.log("Initial next player calculation:", nextPlayerIndex);
      
      let loopCount = 0;
      const maxLoops = playersCount;
    
      // Find a valid next player (not arrested, not escaped, not skipped)
      while (loopCount < maxLoops) {
        const nextPlayer = state.players[nextPlayerIndex];
        
        // Safety check
        if (!nextPlayer) {
          console.error("Next player is undefined at index", nextPlayerIndex);
          break;
        }
        
        const isSkipped = resetActiveEffects.skippedPlayers.includes(nextPlayer.id);
        console.log("Checking player", nextPlayerIndex, "skipped:", isSkipped, "arrested:", nextPlayer.arrested, "escaped:", nextPlayer.escaped);
    
        // Found a valid player
        if (!nextPlayer.arrested && !nextPlayer.escaped && !isSkipped) {
          console.log("Found valid next player:", nextPlayerIndex);
          break;
        }
    
        if (isSkipped) {
          resetActiveEffects.skippedPlayers = resetActiveEffects.skippedPlayers.filter(
            id => id !== nextPlayer.id
          );
        }
    
        // Try the next player
        nextPlayerIndex = (nextPlayerIndex + 1) % playersCount;
        loopCount++;
        console.log("Trying next player:", nextPlayerIndex);
      }
    
      // Fallback if we couldn't find a valid player
      if (loopCount >= maxLoops) {
        console.log("Reached max loops, looking for any valid player");
        const validPlayerIndex = state.players.findIndex(p => !p.arrested && !p.escaped);
        if (validPlayerIndex !== -1) {
          nextPlayerIndex = validPlayerIndex;
          console.log("Fallback to valid player:", nextPlayerIndex);
        } else {
          console.log("No valid players found!");
        }
      }

      console.log("Final - Current player:", state.currentPlayer, "Next player:", nextPlayerIndex);
      
      // Return updated state with the next player
      return {
        currentPlayer: nextPlayerIndex,
        activeMeeple: null,
        diceValue: 0, // Reset dice value when turn changes
        turnCount: state.turnCount + 1,
        canUndo: false,
        cards: {
          ...state.cards,
          activeEffects: resetActiveEffects,
          justDrawn: null, // Clear any drawn card when turn changes
        },
      };
    }
      
    case "UNDO_MOVE":
      if (state.previousState) {
        return {
          ...state.previousState,
          canUndo: false,
        };
      }
      return {};
      
    default:
      return {};
  }
};
