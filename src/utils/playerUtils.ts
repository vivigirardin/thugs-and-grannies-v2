import { BoardState } from "@/types/game";

export const updateImmobilizedPlayers = (state: BoardState): BoardState => {
  const immobilizedIds: string[] = [];
  
  state.puppies.forEach(puppyPos => {
    const isPuppyDistracted = state.cards.activeEffects.puppyImmunity.some(
      pos => pos.row === puppyPos.row && pos.col === puppyPos.col
    );
    
    if (isPuppyDistracted) {
      return;
    }
    
    const adjacentPositions = [
      { row: puppyPos.row - 1, col: puppyPos.col },
      { row: puppyPos.row + 1, col: puppyPos.col },
      { row: puppyPos.row, col: puppyPos.col - 1 },
      { row: puppyPos.row, col: puppyPos.col + 1 },
    ];
    
    adjacentPositions.forEach(pos => {
      if (
        pos.row >= 0 && pos.row < state.cells.length &&
        pos.col >= 0 && pos.col < state.cells[0].length
      ) {
        const cell = state.cells[pos.row][pos.col];
        if (cell.occupiedBy) {
          immobilizedIds.push(cell.occupiedBy);
        }
      }
    });
  });
  
  return {
    ...state,
    immobilizedPlayers: immobilizedIds,
  };
};
