// src/utils/numberTracker.ts

/**
 * Analiza el tablero actual de Sudoku y devuelve un array con los números
 * que ya se han colocado exactamente 9 veces.
 * * @param grid El tablero actual (puede contener 0, null o los números del 1 al 9)
 * @returns Array de números completados, ej: [7, 9]
 */
export const getCompletedNumbers = (grid: (number | null)[]): number[] => {
  // Creamos un contador para los números del 1 al 9 (ignoramos la posición 0)
  const counts = new Array(10).fill(0);

  // Recorremos las 81 casillas del tablero
  grid.forEach((cell) => {
    // Si la casilla tiene un número válido (del 1 al 9), sumamos 1 a su contador
    if (cell !== null && cell >= 1 && cell <= 9) {
      counts[cell]++;
    }
  });

  // Revisamos cuáles números llegaron a 9 repeticiones
  const completed: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (counts[i] === 9) {
      completed.push(i);
    }
  }

  return completed;
};
