import { BoardState, GameAction, Team, Position } from '@/types/game';
import { generateInitialBoard } from '@/utils/boardUtils';

const addNewPoliceGrannies = (state: BoardState): Partial<BoardState> => {
  const newPolice: Position[] = [];
  const newGrannies: Position[] = [];
  const cells = [...state.cells];
  
  // Get all empty path cells
  const emptyCells: Position[] = [];
  for (let row = 0; row < cells.length; row++) {
    for (let col = 0; col < cells[row].length; col++) {
      const cell = cells[row][col];
      if (
        cell.type === "path" && 
        !cell.occupied &&
        !state.exits.some(exit => exit.row === row && exit.col === col)
      ) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  // Add 3 new police if possible
  for (let i = 0; i < 3; i++) {
    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const newPos = emptyCells[randomIndex];
      
      cells[newPos.row][newPos.col].type = "police";
      newPolice.push(newPos);
      
      // Remove used position
      emptyCells.splice(randomIndex, 1);
    }
  }
  
  // Add 3 new grannies if possible
  for (let i = 0; i < 3; i++) {
    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const newPos = emptyCells[randomIndex];
      
      cells[newPos.row][newPos.col].type = "granny";
      newGrannies.push(newPos);
      
      // Remove used position
      emptyCells.splice(randomIndex, 1);
    }
  }
  
  return {
    cells,
    police: [...state.police, ...newPolice],
    grannies: [...state.grannies, ...newGrannies],
  };
};

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
      
      // Get current team to ensure we switch to a different team
      const currentTeam = state.players[state.currentPlayer].team;
      console.log(`Current team: ${currentTeam}`);
      
      // Start with the next player
      let nextPlayerIndex = (state.currentPlayer + 1) % playersCount;
      console.log(`Initial next player calculation: ${nextPlayerIndex}`);
      console.log(`Next player details: ${JSON.stringify(state.players[nextPlayerIndex])}`);
      
      let loopCount = 0;
      const maxLoops = playersCount * 2;  // Increased loop protection
      
      // First, find the next valid player from a different team
      let foundDifferentTeam = false;
      
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
          Escaped: ${nextPlayer.escaped}
          Current Team: ${currentTeam}
          Different Team: ${nextPlayer.team !== currentTeam}`);
        
        // Found a valid player from a different team
        if (!nextPlayer.arrested && !nextPlayer.escaped && !isSkipped && nextPlayer.team !== currentTeam) {
          console.log(`Found valid next player from different team: ${nextPlayerIndex} (${nextPlayer.team})`);
          foundDifferentTeam = true;
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
      
      // If no player from a different team is found, try any valid player
      if (!foundDifferentTeam) {
        console.log("No player from different team found, looking for any valid player");
        nextPlayerIndex = (state.currentPlayer + 1) % playersCount;
        loopCount = 0;
        
        while (loopCount < maxLoops) {
          const nextPlayer = state.players[nextPlayerIndex];
          
          if (!nextPlayer) {
            console.error(`Next player is undefined at index ${nextPlayerIndex}`);
            break;
          }
          
          // Just find any valid player if we can't find one from a different team
          if (!nextPlayer.arrested && !nextPlayer.escaped) {
            console.log(`Found valid player when looking for any: ${nextPlayerIndex} (${nextPlayer.team})`);
            break;
          }
          
          nextPlayerIndex = (nextPlayerIndex + 1) % playersCount;
          loopCount++;
        }
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
      
      // Add new police and grannies after player switch
      const newBoardState = addNewPoliceGrannies(state);
      
      // Return updated state with new obstacles
      return {
        ...newBoardState,
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
      
    default:
      return {};
  }
};
