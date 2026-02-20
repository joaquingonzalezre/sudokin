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
const areArraysEqual = (a: number[], b: number[]) =>
  a.length === b.length && a.every((val, index) => val === b[index]);

export const findNakedPair: HintStrategy = (grid, internalCandidates) => {
  const units = [
    { name: "Fila", getter: getRowIndices },
    { name: "Columna", getter: getColIndices },
    { name: "Caja", getter: getBoxIndices },
  ];

  for (const { name, getter } of units) {
    for (let u = 0; u < 9; u++) {
      const cellIndices = getter(u);
      const bivalueCells = cellIndices.filter(
        (idx) => grid[idx] === null && internalCandidates[idx].length === 2,
      );

      for (let i = 0; i < bivalueCells.length; i++) {
        for (let j = i + 1; j < bivalueCells.length; j++) {
          const idxA = bivalueCells[i];
          const idxB = bivalueCells[j];
          const pairValues = internalCandidates[idxA];

          if (areArraysEqual(pairValues, internalCandidates[idxB])) {
            const affectedCells = cellIndices.filter(
              (idx) =>
                idx !== idxA &&
                idx !== idxB &&
                grid[idx] === null &&
                internalCandidates[idx].some((c) => pairValues.includes(c)),
            );

            if (affectedCells.length > 0) {
              return {
                found: true,
                type: `NAKED PAIR (${name})`,
                totalSteps: 3,
                steps: [
                  {
                    message: `Hay dos casillas en esta ${name} que forman una pareja exclusiva ("Naked Pair").`,
                    highlights: {
                      primaryCells: [idxA, idxB],
                      secondaryCells: cellIndices,
                      focusNumber: null,
                    },
                  },
                  {
                    message: `Las celdas resaltadas contienen exactamente los mismos dos candidatos: ${pairValues[0]} y ${pairValues[1]}. Por lo tanto, esos números TIENEN que ir ahí.`,
                    highlights: {
                      primaryCells: [idxA, idxB],
                      secondaryCells: cellIndices,
                      focusNumber: null,
                    },
                  },
                  {
                    message: `¡Elimina los candidatos ${pairValues[0]} y ${pairValues[1]} del resto de las celdas de la ${name}!`,
                    highlights: {
                      primaryCells: affectedCells,
                      secondaryCells: [idxA, idxB],
                      focusNumber: null,
                    },
                  },
                ],
                action: {
                  type: "REMOVE_CANDIDATE",
                  cells: affectedCells,
                  values: pairValues,
                }, // <-- Usamos values (plural)
              };
            }
          }
        }
      }
    }
  }
  return null;
};
