import { SudokuGridType } from "../data/sudokuPuzzles";

export type CandidateGridType = number[][];

/**
 * CAMBIO IMPORTANTE:
 * Ahora esta función devuelve arrays VACÍOS [].
 * Ya no llena todo con 1-9 por defecto.
 */
export const generateEmptyCandidates = (
  currentGrid: SudokuGridType,
): CandidateGridType => {
  // Crea un array de 81 elementos, cada uno es un array vacío []
  return Array(81).fill([]);
};

export const toggleCandidate = (
  currentCandidates: number[],
  numberToToggle: number,
): number[] => {
  if (currentCandidates.includes(numberToToggle)) {
    return currentCandidates.filter((n) => n !== numberToToggle);
  } else {
    return [...currentCandidates, numberToToggle].sort((a, b) => a - b);
  }
};

export const calculateAllCandidates = (
  grid: SudokuGridType,
): CandidateGridType => {
  return grid.map((cellValue, index) => {
    // Si la celda ya tiene un número, no lleva candidatos
    if (cellValue !== null && cellValue !== 0) {
      return [];
    }

    const row = Math.floor(index / 9);
    const col = index % 9;
    const boxStartRow = Math.floor(row / 3) * 3;
    const boxStartCol = Math.floor(col / 3) * 3;

    const validCandidates: number[] = [];

    for (let num = 1; num <= 9; num++) {
      let conflictFound = false;

      // Revisar Fila y Columna
      for (let k = 0; k < 9; k++) {
        const rowVal = grid[row * 9 + k];
        const colVal = grid[k * 9 + col];
        if (rowVal !== null && Number(rowVal) === num) {
          conflictFound = true;
          break;
        }
        if (colVal !== null && Number(colVal) === num) {
          conflictFound = true;
          break;
        }
      }

      // Revisar Cuadrante (Box)
      if (!conflictFound) {
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const cellIndex = (boxStartRow + r) * 9 + (boxStartCol + c);
            const boxVal = grid[cellIndex];
            if (boxVal !== null && Number(boxVal) === num) {
              conflictFound = true;
              break;
            }
          }
          if (conflictFound) break;
        }
      }

      if (!conflictFound) {
        validCandidates.push(num);
      }
    }

    return validCandidates;
  });
};
