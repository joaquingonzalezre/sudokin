// src/logic/hints/nakedSingle.ts
import { HintStrategy } from "./types";

export const findNakedSingle: HintStrategy = (grid, candidates) => {
  // Recorremos las 81 celdas
  for (let i = 0; i < 81; i++) {
    // Si la celda está vacía Y tiene exactamente 1 candidato
    if (grid[i] === null && candidates[i].length === 1) {
      const val = candidates[i][0];
      const row = Math.floor(i / 9) + 1;
      const col = (i % 9) + 1;

      return {
        type: "Naked Single",
        cellIdx: i,
        value: val,
        candidates: [val],
        levels: {
          1: "Hay una casilla que solo tiene una posibilidad lógica.",
          2: `Mira la Fila ${row}, Columna ${col}.`,
          3: "Si eliminas los números ya usados en su fila, columna y caja, solo queda uno.",
          4: `En la celda seleccionada (F${row}C${col}), el único candidato posible es el número ${val}.`,
          5: `¡Es un "Naked Single"! El ${val} es la única opción matemática. ¡Ponlo!`,
        },
      };
    }
  }

  // Si no se encontró ningún Naked Single
  return null;
};
