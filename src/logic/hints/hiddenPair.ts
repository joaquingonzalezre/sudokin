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

export const findHiddenPair: HintStrategy = (grid, internalCandidates) => {
  const units = [
    { name: "Fila", getter: getRowIndices },
    { name: "Columna", getter: getColIndices },
    { name: "Caja", getter: getBoxIndices },
  ];

  for (const { name, getter } of units) {
    for (let u = 0; u < 9; u++) {
      const cellIndices = getter(u);
      const candidatePositions: Record<number, number[]> = {};

      for (let num = 1; num <= 9; num++) {
        candidatePositions[num] = cellIndices.filter(
          (idx) => grid[idx] === null && internalCandidates[idx].includes(num),
        );
      }

      const possiblePairs = [];
      for (let num = 1; num <= 9; num++) {
        if (candidatePositions[num].length === 2) possiblePairs.push(num);
      }

      for (let i = 0; i < possiblePairs.length; i++) {
        for (let j = i + 1; j < possiblePairs.length; j++) {
          const numA = possiblePairs[i];
          const numB = possiblePairs[j];
          const posA = candidatePositions[numA];
          const posB = candidatePositions[numB];

          if (posA[0] === posB[0] && posA[1] === posB[1]) {
            const idx1 = posA[0];
            const idx2 = posA[1];

            // Verificamos si hay basura que limpiar
            if (
              internalCandidates[idx1].length > 2 ||
              internalCandidates[idx2].length > 2
            ) {
              return {
                found: true,
                type: `HIDDEN PAIR (${name})`,
                totalSteps: 3,
                steps: [
                  {
                    message: `Hay dos números ocultos en esta ${name} que forman una pareja exclusiva.`,
                    highlights: {
                      primaryCells: [],
                      secondaryCells: cellIndices,
                      focusNumber: null,
                    },
                  },
                  {
                    message: `Los números ${numA} y ${numB} solo pueden ir en estas dos casillas. Por lo tanto, deben vivir ahí aislados.`,
                    highlights: {
                      primaryCells: [idx1, idx2],
                      secondaryCells: cellIndices,
                      focusNumber: null,
                    },
                  },
                  {
                    message: `Cualquier otro candidato en esas dos celdas es imposible. ¡Borra todas las demás notas y deja solo el ${numA} y ${numB}!`,
                    highlights: {
                      primaryCells: [idx1, idx2],
                      secondaryCells: [],
                      focusNumber: null,
                    },
                  },
                ],
                action: {
                  type: "KEEP_CANDIDATES",
                  cells: [idx1, idx2],
                  values: [numA, numB],
                }, // <-- Usamos la nueva acción KEEP
              };
            }
          }
        }
      }
    }
  }
  return null;
};
