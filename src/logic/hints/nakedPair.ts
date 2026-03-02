import { HintStrategy } from "./types";

const getRowIndices = (row: number) =>
  Array.from({ length: 9 }, (_, i) => row * 9 + i);
const getColIndices = (col: number) =>
  Array.from({ length: 9 }, (_, i) => i * 9 + col);
const getBoxIndices = (box: number) => {
  const startRow = Math.floor(box / 3) * 3;
  const startCol = (box % 3) * 3;
  return Array.from(
    { length: 9 },
    (_, i) => (startRow + Math.floor(i / 3)) * 9 + (startCol + (i % 3)),
  );
};

export const findNakedPair: HintStrategy = (grid, internalCandidates) => {
  const units = [
    { name: "Caja", getter: getBoxIndices },
    { name: "Fila", getter: getRowIndices },
    { name: "Columna", getter: getColIndices },
  ];

  for (const { name, getter } of units) {
    for (let u = 0; u < 9; u++) {
      const cellIndices = getter(u);

      // 1. Buscamos celdas con exactamente 2 candidatos
      const eligibleCells = cellIndices.filter(
        (idx) => grid[idx] === null && internalCandidates[idx].length === 2,
      );

      if (eligibleCells.length < 2) continue;

      // 2. Comparamos para encontrar dos celdas idénticas
      for (let i = 0; i < eligibleCells.length - 1; i++) {
        for (let j = i + 1; j < eligibleCells.length; j++) {
          const cell1 = eligibleCells[i];
          const cell2 = eligibleCells[j];
          const c1 = internalCandidates[cell1];
          const c2 = internalCandidates[cell2];

          // Si tienen exactamente la misma pareja de números
          if (c1[0] === c2[0] && c1[1] === c2[1]) {
            const val1 = c1[0];
            const val2 = c1[1];

            // 3. Buscamos celdas afectadas para limpiar (el resto de la Fila/Col/Caja)
            const affectedCells = cellIndices.filter(
              (idx) =>
                idx !== cell1 &&
                idx !== cell2 &&
                grid[idx] === null &&
                (internalCandidates[idx].includes(val1) ||
                  internalCandidates[idx].includes(val2)),
            );

            if (affectedCells.length > 0) {
              return {
                found: true,
                type: `NAKED PAIR (${name})`,
                totalSteps: 3,
                steps: [
                  {
                    message: `Fíjate en esta ${name}. Hay dos casillas que comparten exclusivamente la misma pareja de candidatos: el ${val1} y el ${val2}.`,
                    highlights: {
                      primaryCells: [cell1, cell2],
                      secondaryCells: cellIndices,
                      focusNumber: null,
                    },
                  },
                  {
                    message: `Como los números ${val1} y ${val2} solo pueden ir obligatoriamente en estas dos casillas, forman una pareja exclusiva ("Naked Pair").`,
                    highlights: {
                      primaryCells: [cell1, cell2],
                      secondaryCells: affectedCells,
                      focusNumber: null,
                    },
                  },
                  {
                    message: `¡Elimina los candidatos ${val1} y ${val2} del resto de las celdas marcadas en azul de esta ${name}!`,
                    highlights: {
                      primaryCells: affectedCells,
                      secondaryCells: [cell1, cell2],
                      focusNumber: null,
                    },
                  },
                ],
                // 🛑 Acción corregida para que el tablero la entienda
                action: {
                  type: "REMOVE_CANDIDATE",
                  cells: affectedCells,
                  values: [val1, val2],
                },
              };
            }
          }
        }
      }
    }
  }
  return null;
};
