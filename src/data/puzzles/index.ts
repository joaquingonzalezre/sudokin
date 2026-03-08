import { sudokusOrdenados } from "../../../scripts/sudokus_ordenados";

// Definimos los niveles posibles
export type Difficulty =
  | "easy"
  | "medium"
  | "hard"
  | "expert"
  | "importado";

/**
 * Obtiene un Sudoku específico por su ID (1-indexed)
 */
export const getPuzzleById = (id: number): number[] => {
  const found = sudokusOrdenados.find(s => s.id === id);
  return found ? found.grid : Array(81).fill(0);
};

/**
 * Obtiene un Sudoku aleatorio basado en el rango de dificultad deseado
 */
export const getRandomPuzzle = (difficulty: Difficulty): number[] => {
  if (difficulty === "importado") return Array(81).fill(0);

  const total = sudokusOrdenados.length;
  const quadrant = Math.floor(total / 4);

  let minId = 1;
  let maxId = total;

  switch (difficulty) {
    case "easy":
      minId = 1;
      maxId = quadrant;
      break;
    case "medium":
      minId = quadrant + 1;
      maxId = quadrant * 2;
      break;
    case "hard":
      minId = quadrant * 2 + 1;
      maxId = quadrant * 3;
      break;
    case "expert":
      minId = quadrant * 3 + 1;
      maxId = total;
      break;
  }

  // Filtrar los que están en el rango
  const pool = sudokusOrdenados.filter(s => s.id >= minId && s.id <= maxId);

  if (pool.length === 0) return Array(81).fill(0);

  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex].grid;
};
