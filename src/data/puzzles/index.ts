import { easyPuzzles } from "./easy";
import { mediumPuzzles } from "./medium";
import { hardPuzzles } from "./hard";
import { expertPuzzles } from "./expert";
import { dailiesPuzzles } from "./dailies";
import { nightmarePuzzles } from "./nightmare";

// Definimos los niveles posibles
export type Difficulty =
  | "easy"
  | "medium"
  | "hard"
  | "expert"
  | "dailies"
  | "nightmare";

export const getRandomPuzzle = (difficulty: Difficulty): number[] => {
  let collection: number[][] = [];

  switch (difficulty) {
    case "easy":
      collection = easyPuzzles;
      break;
    case "medium":
      collection = mediumPuzzles;
      break;
    case "hard":
      collection = hardPuzzles;
      break;
    case "expert":
      collection = expertPuzzles;
      break;
    case "dailies":
      collection = dailiesPuzzles;
      break;
    case "nightmare":
      collection = nightmarePuzzles;
      break;
    default:
      collection = easyPuzzles;
  }

  // Si la colección está vacía (por si aún no llenas algún archivo), devuelve uno vacío para no romper la app
  if (collection.length === 0) {
    return Array(81).fill(0);
  }

  // Selección aleatoria
  const randomIndex = Math.floor(Math.random() * collection.length);
  return collection[randomIndex];
};
