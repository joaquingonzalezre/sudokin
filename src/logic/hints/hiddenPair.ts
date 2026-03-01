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

      // 1. Mapeamos en qué celdas puede ir cada número
      for (let num = 1; num <= 9; num++) {
        if (cellIndices.some((idx) => grid[idx] === num)) {
          candidatePositions[num] = [];
          continue;
        }
        candidatePositions[num] = cellIndices.filter(
          (idx) => grid[idx] === null && internalCandidates[idx].includes(num),
        );
      }

      // 2. Solo nos interesan los números que aparecen exactamente 2 veces
      const possibleCandidates = [];
      for (let num = 1; num <= 9; num++) {
        if (candidatePositions[num].length === 2) {
          possibleCandidates.push(num);
        }
      }

      if (possibleCandidates.length < 2) continue;

      // 3. Comparamos los números para ver si comparten las MISMAS 2 celdas
      for (let i = 0; i < possibleCandidates.length - 1; i++) {
        for (let j = i + 1; j < possibleCandidates.length; j++) {
          const numA = possibleCandidates[i];
          const numB = possibleCandidates[j];

          const posA = candidatePositions[numA];
          const posB = candidatePositions[numB];

          if (posA[0] === posB[0] && posA[1] === posB[1]) {
            const cell1 = posA[0];
            const cell2 = posA[1];

            // 4. SEGURO: Verificamos si hay "basura" que limpiar en estas celdas
            const hasGarbage =
              internalCandidates[cell1].some((c) => c !== numA && c !== numB) ||
              internalCandidates[cell2].some((c) => c !== numA && c !== numB);

            if (hasGarbage) {
              return {
                found: true,
                type: `HIDDEN PAIR (${name})`,
                totalSteps: 3,
                steps: [
                  {
                    message: `Analiza esta ${name}. Los números ${numA} y ${numB} están "escondidos" y solo pueden ir en estas dos casillas.`,
                    highlights: {
                      primaryCells: [],
                      secondaryCells: cellIndices,
                      focusNumber: null,
                    },
                  },
                  {
                    message: `Como no pueden ir en ningún otro lado de la ${name}, forman una Pareja Oculta ("Hidden Pair"). ¡Deben vivir ahí aislados!`,
                    highlights: {
                      primaryCells: [cell1, cell2],
                      secondaryCells: cellIndices,
                      focusNumber: null,
                    },
                  },
                  {
                    message: `Cualquier otro candidato en esas dos celdas es imposible. ¡Borra la basura y deja solo el ${numA} y ${numB}!`,
                    highlights: {
                      primaryCells: [cell1, cell2],
                      secondaryCells: [],
                      focusNumber: null,
                    },
                  },
                ],
                // 🛑 LA MAGIA: Acción KEEP en lugar de REMOVE
                action: {
                  type: "KEEP_CANDIDATES",
                  cells: [cell1, cell2],
                  values: [numA, numB],
                } as any,
              };
            }
          }
        }
      }
    }
  }
  return null;
};
