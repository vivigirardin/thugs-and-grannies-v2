
import React, { createContext, useContext, useReducer } from "react";
import { BoardState, GameAction } from "@/types/game";
import { gameReducer, initialState } from "@/reducers/gameReducer";

interface GameContextType {
  state: BoardState;
  dispatch: React.Dispatch<GameAction>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  
  return context;
};
