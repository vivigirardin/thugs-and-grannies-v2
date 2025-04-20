
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
      
      const resetActiveEffects = {
        policeIgnore: [],
        grannyIgnore: [],
        policeImmobilized: false,
        policeExpansionDelay: false,
        moveDiagonally: null,
        policeMoveLimited: false,
        skippedPlayers: [...state.cards.activeEffects.skippedPlayers],
      };
    
      let nextPlayerIndex = (state.currentPlayer + 1) % state.players.length;
      let loopCount = 0;
      const maxLoops = state.players.length;
    
      while (loopCount < maxLoops) {
        const nextPlayer = state.players[nextPlayerIndex];
        const isSkipped = resetActiveEffects.skippedPlayers.includes(nextPlayer.id);
    
        if (!nextPlayer.arrested && !nextPlayer.escaped && !isSkipped) {
          break;
        }
    
        if (isSkipped) {
          resetActiveEffects.skippedPlayers = resetActiveEffects.skippedPlayers.filter(
            id => id !== nextPlayer.id
          );
        }
    
        nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
        loopCount++;
      }
    
      if (loopCount >= maxLoops) {
        const validPlayerIndex = state.players.findIndex(p => !p.arrested && !p.escaped);
        if (validPlayerIndex !== -1) {
          nextPlayerIndex = validPlayerIndex;
        }
      }

      console.log("Current player:", state.currentPlayer, "Next player:", nextPlayerIndex);
    
      return {
        currentPlayer: nextPlayerIndex,
        activeMeeple: null,
        diceValue: 0,
        turnCount: state.turnCount + 1,
        canUndo: false,
        cards: {
          ...state.cards,
          activeEffects: resetActiveEffects,
          justDrawn: null,
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
