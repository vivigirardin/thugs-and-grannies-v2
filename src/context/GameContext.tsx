import React, { createContext, useContext, useReducer } from "react";
import { BoardState, GameAction, Team } from "@/types/game";
import { generateInitialBoard } from "@/utils/boardUtils";
import { drawCard, keepCard, useCard, useJustDrawnCard, offerTrade, acceptTrade, declineTrade } from "@/utils/cardActions";
import { updateImmobilizedPlayers } from "@/utils/playerUtils";

const initialState: BoardState = {
  cells: [],
  players: [],
  police: [],
  grannies: [],
  puppies: [],
  exits: [],
  jailedPlayers: [],
  landmarks: {
    city: [],
    library: [],
    school: [],
    townhall: [],
  },
  buildingEntrances: {},
  currentPlayer: 0,
  activeMeeple: null,
  diceValue: 0,
  gameStatus: "setup",
  winner: null,
  turnCount: 0,
  policeChains: [],
  immobilizedPlayers: [],
  previousState: null,
  canUndo: false,
  cards: {
    deck: [],
    playerHands: {
      Gang: [],
      Mafia: [],
      Politicians: [],
      Cartel: [],
    },
    activeEffects: {
      policeIgnore: [],
      grannyIgnore: [],
      policeImmobilized: false,
      policeExpansionDelay: false,
      moveDiagonally: null,
      puppyImmunity: [],
      policeMoveLimited: false,
      skippedPlayers: [],
    },
    justDrawn: null,
    tradingOffer: {
      from: null,
      to: null,
      card: null,
    },
  },
};

const gameReducer = (state: BoardState, action: GameAction): BoardState => {
  switch (action.type) {
    case "START_GAME":
      return generateInitialBoard(action.teams || []);
      
    case "ROLL_DICE":
      return {
        ...state,
        diceValue: Math.floor(Math.random() * 6) + 1,
        activeMeeple: null,
      };
      
    case "SELECT_MEEPLE":
      return {
        ...state,
        activeMeeple: action.playerId || null,
        previousState: state,
        canUndo: true,
      };
      
    case "DESELECT_MEEPLE":
      return {
        ...state,
        activeMeeple: null,
      };
      
    case "MOVE_PLAYER":
      if (!state.activeMeeple) return state;
      
      const playerId = state.activeMeeple;
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      
      if (playerIndex === -1) return state;
      
      const player = state.players[playerIndex];
      const oldPos = player.position;
      const newPos = action.position;
      
      const targetCell = state.cells[newPos.row][newPos.col];
      let nextPos = newPos;
      
      if (targetCell.type === "entrance" && targetCell.connectedTo) {
        nextPos = targetCell.connectedTo;
      }
      
      const updatedPlayers = [...state.players];
      updatedPlayers[playerIndex] = {
        ...player,
        position: nextPos,
      };
      
      const newCells = [...state.cells];
      
      newCells[oldPos.row][oldPos.col] = {
        ...state.cells[oldPos.row][oldPos.col],
        occupied: false,
        occupiedBy: undefined,
      };
      
      let escaped = false;
      if (state.cells[nextPos.row][nextPos.col].type === "exit") {
        updatedPlayers[playerIndex].escaped = true;
        escaped = true;
        
        toast({
          title: "Escaped!",
          description: `${player.team} meeple has escaped!`,
        });
      } else {
        newCells[nextPos.row][nextPos.col] = {
          ...state.cells[nextPos.row][nextPos.col],
          occupied: true,
          occupiedBy: playerId,
        };
      }
      
      let gameStatus = state.gameStatus;
      let winner = state.winner;
      
      if (escaped) {
        const escapedCounts: Record<Team, number> = {
          Gang: 0,
          Mafia: 0,
          Politicians: 0,
          Cartel: 0,
        };
        
        updatedPlayers.forEach(p => {
          if (p.escaped) {
            escapedCounts[p.team]++;
          }
        });
        
        Object.entries(escapedCounts).forEach(([team, count]) => {
          if (count >= 3) {
            gameStatus = "ended";
            winner = team as Team;
            
            toast({
              title: "Game Over!",
              description: `${team} team wins with ${count} escaped meeples!`,
            });
          }
        });
      }
      
      return {
        ...state,
        players: updatedPlayers,
        cells: newCells,
        diceValue: 0,
        activeMeeple: null,
        gameStatus,
        winner,
      };
      
    case "NEXT_TURN":
      let newState = { 
        ...state,
        activeMeeple: null,
        diceValue: 0,
        turnCount: state.turnCount + 1,
        canUndo: false,
      };
      
      const resetActiveEffects = {
        policeIgnore: [],
        grannyIgnore: [],
        policeImmobilized: false,
        policeExpansionDelay: false,
        moveDiagonally: null,
        puppyImmunity: [],
        policeMoveLimited: false,
        skippedPlayers: [...state.cards.activeEffects.skippedPlayers],
      };
      
      let nextPlayerIndex = (state.currentPlayer + 1) % state.players.length;
      
      let loopCount = 0;
      const maxLoops = state.players.length * 2;
      
      while (loopCount < maxLoops) {
        const nextPlayer = state.players[nextPlayerIndex];
        
        if (!nextPlayer) {
          nextPlayerIndex = (nextPlayerIndex + 1) % state.players.length;
          loopCount++;
          continue;
        }
        
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
        
        if (loopCount >= maxLoops) {
          const anyValidIndex = state.players.findIndex(p => !p.arrested && !p.escaped);
          if (anyValidIndex !== -1) {
            nextPlayerIndex = anyValidIndex;
          } else {
            nextPlayerIndex = 0;
          }
          break;
        }
      }
      
      return {
        ...newState,
        currentPlayer: nextPlayerIndex,
        cards: {
          ...newState.cards,
          activeEffects: resetActiveEffects,
          justDrawn: null,
        },
      };
      
    case "UNDO_MOVE":
      if (state.previousState) {
        return {
          ...state.previousState,
          canUndo: false,
        };
      }
      return state;
      
    case "DRAW_CARD":
      return drawCard(state);
      
    case "KEEP_CARD":
      return keepCard(state);
      
    case "USE_CARD":
      return useCard(state, action.cardId || "", action.targetId, action.position);
      
    case "OFFER_TRADE":
      return offerTrade(state, action.fromTeam!, action.toTeam!, action.cardId!);
      
    case "ACCEPT_TRADE":
      return acceptTrade(state);
      
    case "DECLINE_TRADE":
      return declineTrade(state);
      
    default:
      return state;
  }
};

type GameContextType = {
  state: BoardState;
  dispatch: React.Dispatch<GameAction>;
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
