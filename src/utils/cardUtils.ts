
import { v4 as uuidv4 } from 'uuid';
import { Card } from "@/types/cards";
import { Team } from "@/types/game";
import { CARDS } from "@/data/cardData";
import { toast } from "@/hooks/use-toast";

export const createCardDeck = (): Card[] => {
  const deck: Card[] = [];
  
  CARDS.filter(card => !card.team).forEach(cardTemplate => {
    for (let i = 0; i < 3; i++) {
      deck.push({
        ...cardTemplate,
        id: uuidv4(),
        used: false,
      });
    }
  });
  
  CARDS.filter(card => card.team).forEach(cardTemplate => {
    for (let i = 0; i < 2; i++) {
      deck.push({
        ...cardTemplate,
        id: uuidv4(),
        used: false,
      });
    }
  });
  
  return shuffle(deck);
};

export const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};
