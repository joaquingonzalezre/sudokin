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

export const findNakedTriple: HintStrategy = (grid, internalCandidates) => {
  const units = [
    { name: "Caja", getter: getBoxIndices },
    { name: "Fila", getter: getRowIndices },
    { name: "Columna", getter: getColIndices },
  ];

  for (const { name, getter } of units) {
    for (let u = 0; u < 9; u++) {
      const cellIndices = getter(u);

      // 1. Buscamos celdas vacías que tengan 2 o 3 notas como máximo
      const eligibleCells = cellIndices.filter(
        (idx) =>
          grid[idx] === null &&
          internalCandidates[idx].length >= 2 &&
          internalCandidates[idx].length <= 3,
      );

      if (eligibleCells.length < 3) continue;

      // 2. Evaluamos todas las combinaciones posibles de 3 celdas
      for (let i = 0; i < eligibleCells.length - 2; i++) {
        for (let j = i + 1; j < eligibleCells.length - 1; j++) {
          for (let k = j + 1; k < eligibleCells.length; k++) {
            const cell1 = eligibleCells[i];
            const cell2 = eligibleCells[j];
            const cell3 = eligibleCells[k];

            const c1 = internalCandidates[cell1];
            const c2 = internalCandidates[cell2];
            const c3 = internalCandidates[cell3];

            // Juntamos todas las notas de estas 3 celdas eliminando duplicados
            const combinedCandidates = new Set([...c1, ...c2, ...c3]);

            // 🛑 SEGURO DE LÓGICA: Si entre las 3 celdas suman exactamente 3 números únicos
            if (combinedCandidates.size === 3) {
              const tripleValues = Array.from(combinedCandidates);

              // 3. Buscamos si esos 3 números están "ensuciando" otras celdas de la misma Fila/Col/Caja
              const affectedCells = cellIndices.filter(
                (idx) =>
                  idx !== cell1 &&
                  idx !== cell2 &&
                  idx !== cell3 &&
                  grid[idx] === null &&
                  internalCandidates[idx].some((cand) =>
                    tripleValues.includes(cand),
                  ),
              );

              if (affectedCells.length > 0) {
                // ¡Encontramos un Trío Desnudo útil! Preparamos la limpieza.
                const removals = affectedCells.map((idx) => ({
                  cell: idx,
                  values: internalCandidates[idx].filter((c) =>
                    tripleValues.includes(c),
                  ),
                }));

                return {
                  found: true,
                  type: `NAKED TRIPLE (${name})`,
                  totalSteps: 3,
                  steps: [
                    {
                      message: `Fíjate en esta ${name}. Hay 3 celdas que comparten exclusivamente estos 3 candidatos: ${tripleValues.join(
                        ", ",
                      )}.`,
                      highlights: {
                        primaryCells: [cell1, cell2, cell3],
                        secondaryCells: cellIndices,
                        focusNumber: null,
                      },
                    },
                    {
                      message: `Como esos 3 números deben ubicarse obligatoriamente repartidos en esas 3 casillas, forman un "Trío Desnudo".`,
                      highlights: {
                        primaryCells: [cell1, cell2, cell3],
                        // 🛑 CORRECCIÓN 1: Quitamos el .map(a => a.cell)
                        secondaryCells: affectedCells,
                        focusNumber: null,
                      },
                    },
                    {
                      message: `Esto significa que ninguna otra casilla de la ${name} puede tener esos números. ¡Bórralos de las demás celdas!`,
                      highlights: {
                        // 🛑 CORRECCIÓN 1: Quitamos el .map(a => a.cell)
                        primaryCells: affectedCells,
                        secondaryCells: [cell1, cell2, cell3],
                        focusNumber: null,
                      },
                    },
                  ],
                  // 🛑 CORRECCIÓN 2: Agregamos "as any" para saltar el tipado estricto
                  action: {
                    type: "REMOVE_CANDIDATES",
                    removals: removals,
                  } as any,
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
