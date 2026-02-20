// src/logic/hints/nakedSingle.ts
import { HintStrategy } from "./types";

export const findNakedSingle: HintStrategy = (grid, internalCandidates) => {
  for (let i = 0; i < 81; i++) {
    if (grid[i] === null && internalCandidates[i].length === 1) {
      const val = internalCandidates[i][0];
      const row = Math.floor(i / 9);
      const col = i % 9;

      // Calculamos las celdas relacionadas (la fila, col y caja de esta celda)
      const boxStartRow = Math.floor(row / 3) * 3;
      const boxStartCol = Math.floor(col / 3) * 3;
      const relatedCells = new Set<number>();
      for (let k = 0; k < 9; k++) {
        relatedCells.add(row * 9 + k);
        relatedCells.add(k * 9 + col);
        relatedCells.add(
          (boxStartRow + Math.floor(k / 3)) * 9 + (boxStartCol + (k % 3)),
        );
      }
      relatedCells.delete(i); // Quitamos la celda principal de las relacionadas

      return {
        found: true,
        type: "Naked Single",
        totalSteps: 2, // <-- Dinámico: 2 pasos
        steps: [
          {
            message: `Mira la Fila ${row + 1}, Columna ${col + 1}. Si revisas su fila, columna y cuadrante...`,
            highlights: {
              primaryCells: [],
              secondaryCells: Array.from(relatedCells),
              focusNumber: null,
            },
          },
          {
            message: `¡Es la única opción matemática! Esa celda debe ser un ${val}.`,
            highlights: {
              primaryCells: [i],
              secondaryCells: [],
              focusNumber: val,
            },
          },
        ],
        action: { type: "PLACE_NUMBER", cells: [i], value: val },
      };
    }
  }
  return null;
};
