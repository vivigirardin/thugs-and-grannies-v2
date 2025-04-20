
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
      console.log("NEXT_TURN action started");
      console.log("Current Game State:", JSON.stringify({
        currentPlayer: state.currentPlayer,
        totalPlayers: state.players.length,
        players: state.players.map(p => ({
          id: p.id, 
          team: p.team, 
          arrested: p.arrested, 
          escaped: p.escaped
        }))
      }, null, 2));
      
      const playersCount = state.players.length;
      if (playersCount === 0) {
        console.error("No players in game state");
        return {};
      }
      
      const resetActiveEffects = {
        policeIgnore: [],
        grannyIgnore: [],
        policeImmobilized: false,
        policeExpansionDelay: false,
        moveDiagonally: null,
        policeMoveLimited: false,
        skippedPlayers: [...state.cards.activeEffects.skippedPlayers],
      };
    
      let nextPlayerIndex = (state.currentPlayer + 1) % playersCount;
      console.log(`Initial next player calculation: ${nextPlayerIndex}`);
      console.log(`Next player details: ${JSON.stringify(state.players[nextPlayerIndex])}`);
      
      let loopCount = 0;
      const maxLoops = playersCount * 2;  // Increased loop protection
    
      while (loopCount < maxLoops) {
        const nextPlayer = state.players[nextPlayerIndex];
        
        if (!nextPlayer) {
          console.error(`Next player is undefined at index ${nextPlayerIndex}`);
          break;
        }
        
        const isSkipped = resetActiveEffects.skippedPlayers.includes(nextPlayer.id);
        console.log(`Evaluating player ${nextPlayerIndex}:
          Team: ${nextPlayer.team}
          Player ID: ${nextPlayer.id}
          Skipped: ${isSkipped}
          Arrested: ${nextPlayer.arrested}
          Escaped: ${nextPlayer.escaped}`);
    
        // Found a valid player
        if (!nextPlayer.arrested && !nextPlayer.escaped && !isSkipped) {
          console.log(`Found valid next player: ${nextPlayerIndex} (${nextPlayer.team})`);
          break;
        }
    
        // Remove skipped player from skipped list if encountered
        if (isSkipped) {
          resetActiveEffects.skippedPlayers = resetActiveEffects.skippedPlayers.filter(
            id => id !== nextPlayer.id
          );
        }
    
        // Try the next player
        nextPlayerIndex = (nextPlayerIndex + 1) % playersCount;
        loopCount++;
        console.log(`Trying next player index: ${nextPlayerIndex}`);
      }
    
      // Fallback if we couldn't find a valid player
      if (loopCount >= maxLoops) {
        console.log("Reached max loops, looking for any valid player");
        const validPlayerIndex = state.players.findIndex(p => !p.arrested && !p.escaped);
        if (validPlayerIndex !== -1) {
          nextPlayerIndex = validPlayerIndex;
          console.log(`Fallback to valid player: ${nextPlayerIndex}`);
        } else {
          console.log("No valid players found!");
        }
      }

      console.log(`FINAL Turn Switch:
        Previous Player Index: ${state.currentPlayer}
        Previous Player Team: ${state.players[state.currentPlayer]?.team}
        Next Player Index: ${nextPlayerIndex}
        Next Player Team: ${state.players[nextPlayerIndex]?.team}`);
      
      // Return updated state with the next player
      return {
        currentPlayer: nextPlayerIndex,
        activeMeeple: null,
        diceValue: 0, 
        turnCount: state.turnCount + 1,
        canUndo: false,
        cards: {
          ...state.cards,
          activeEffects: resetActiveEffects,
          justDrawn: null, // Clear any drawn card when turn changes
        },
      };
    }
      
    default:
      return {};
  }
};
