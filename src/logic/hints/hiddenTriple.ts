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

export const findHiddenTriple: HintStrategy = (grid, internalCandidates) => {
  const units = [
    { name: "Fila", getter: getRowIndices },
    { name: "Columna", getter: getColIndices },
    { name: "Caja", getter: getBoxIndices },
  ];

  for (const { name, getter } of units) {
    for (let u = 0; u < 9; u++) {
      const cellIndices = getter(u);
      const candidatePositions: Record<number, number[]> = {};

      // 1. Mapeamos en qué celdas de esta unidad puede ir cada número (del 1 al 9)
      for (let num = 1; num <= 9; num++) {
        // 🛑 SEGURO ANTI-ERRORES
        if (cellIndices.some((idx) => grid[idx] === num)) {
          candidatePositions[num] = [];
          continue;
        }

        candidatePositions[num] = cellIndices.filter(
          (idx) => grid[idx] === null && internalCandidates[idx].includes(num),
        );
      }

      // 2. Solo nos interesan los números que aparecen 2 o 3 veces en esta unidad
      const possibleCandidates = [];
      for (let num = 1; num <= 9; num++) {
        if (
          candidatePositions[num].length >= 2 &&
          candidatePositions[num].length <= 3
        ) {
          possibleCandidates.push(num);
        }
      }

      // Si no hay al menos 3 números candidatos, es imposible formar un trío
      if (possibleCandidates.length < 3) continue;

      // 3. Probamos todas las combinaciones posibles de 3 números
      for (let i = 0; i < possibleCandidates.length - 2; i++) {
        for (let j = i + 1; j < possibleCandidates.length - 1; j++) {
          for (let k = j + 1; k < possibleCandidates.length; k++) {
            const numA = possibleCandidates[i];
            const numB = possibleCandidates[j];
            const numC = possibleCandidates[k];

            const posA = candidatePositions[numA];
            const posB = candidatePositions[numB];
            const posC = candidatePositions[numC];

            // Unimos todas las celdas donde aparecen estos 3 números (eliminando duplicados con Set)
            const combinedCells = Array.from(
              new Set([...posA, ...posB, ...posC]),
            );

            // 4. ¡LA MAGIA! Si estos 3 números comparten EXACTAMENTE las mismas 3 celdas...
            if (combinedCells.length === 3) {
              const [idx1, idx2, idx3] = combinedCells;

              // 5. Verificamos si hay basura que limpiar en estas celdas
              const hasGarbage = combinedCells.some((idx) =>
                internalCandidates[idx].some(
                  (c) => c !== numA && c !== numB && c !== numC,
                ),
              );

              if (hasGarbage) {
                return {
                  found: true,
                  type: `HIDDEN TRIPLE (${name})`,
                  totalSteps: 3,
                  steps: [
                    {
                      message: `Analiza esta ${name}. Hay tres números que están "escondidos" entre mucha basura: el ${numA}, el ${numB} y el ${numC}.`,
                      highlights: {
                        primaryCells: [],
                        secondaryCells: cellIndices,
                        focusNumber: null,
                      },
                    },
                    {
                      message: `Si te fijas bien, esos 3 números no pueden ir en ningún otro lado de la ${name}. Por lo tanto, ¡están atrapados en estas 3 casillas!`,
                      highlights: {
                        primaryCells: [idx1, idx2, idx3],
                        secondaryCells: cellIndices,
                        focusNumber: null,
                      },
                    },
                    {
                      message: `Cualquier otro candidato en esas tres celdas es imposible. ¡Borra todas las demás notas y deja solo el ${numA}, ${numB} y ${numC}!`,
                      highlights: {
                        primaryCells: [idx1, idx2, idx3],
                        secondaryCells: [],
                        focusNumber: null,
                      },
                    },
                  ],
                  // Usamos la misma lógica que el Hidden Pair, "mantenemos" los ganadores y borramos lo demás
                  action: {
                    type: "KEEP_CANDIDATES",
                    cells: [idx1, idx2, idx3],
                    values: [numA, numB, numC],
                  },
                };
              }
            }
          }
        }
      }
    }
  }
  return null;
};
