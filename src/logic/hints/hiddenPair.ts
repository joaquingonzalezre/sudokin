import { HintStrategy } from "./types";

// --- HELPERS (Reutilizamos los mismos getters) ---
const getRowIndices = (row: number) =>
  Array.from({ length: 9 }, (_, i) => row * 9 + i);
const getColIndices = (col: number) =>
  Array.from({ length: 9 }, (_, i) => i * 9 + col);
const getBoxIndices = (box: number) => {
  const startRow = Math.floor(box / 3) * 3;
  const startCol = (box % 3) * 3;
  const indices = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      indices.push((startRow + r) * 9 + (startCol + c));
    }
  }
  return indices;
};

export const findHiddenPair: HintStrategy = (grid, candidates) => {
  const units = [
    { name: "Fila", getter: getRowIndices },
    { name: "Columna", getter: getColIndices },
    { name: "Caja", getter: getBoxIndices },
  ];

  for (const { name, getter } of units) {
    for (let u = 0; u < 9; u++) {
      const cellIndices = getter(u);

      // 1. Mapa de frecuencia: ¿En qué celdas aparece cada número (1-9)?
      // Ejemplo: El '3' aparece en las celdas [0, 4, 8]
      const candidatePositions: Record<number, number[]> = {};

      for (let num = 1; num <= 9; num++) {
        candidatePositions[num] = cellIndices.filter(
          (idx) => grid[idx] === null && candidates[idx].includes(num),
        );
      }

      // 2. Buscamos números que aparezcan EXACTAMENTE en 2 celdas
      const possiblePairs = [];
      for (let num = 1; num <= 9; num++) {
        if (candidatePositions[num].length === 2) {
          possiblePairs.push(num);
        }
      }

      // 3. Comparamos esos números entre sí para ver si comparten las MISMAS celdas
      for (let i = 0; i < possiblePairs.length; i++) {
        for (let j = i + 1; j < possiblePairs.length; j++) {
          const numA = possiblePairs[i];
          const numB = possiblePairs[j];

          const posA = candidatePositions[numA];
          const posB = candidatePositions[numB];

          // ¿Están en las mismas dos celdas? (ej: posiciones [2, 5] y [2, 5])
          if (posA[0] === posB[0] && posA[1] === posB[1]) {
            const idx1 = posA[0];
            const idx2 = posA[1];

            // 4. VERIFICACIÓN CRÍTICA: ¿Hay "basura" para borrar?
            // Si las celdas ya son [numA, numB] limpias, entonces es un Naked Pair (ya detectado por otra lógica).
            // Solo nos interesa si tienen candidatos EXTRA que podamos eliminar.
            const candidates1 = candidates[idx1];
            const candidates2 = candidates[idx2];

            // ¿Alguna de las dos celdas tiene más de 2 candidatos?
            const hasExtraCandidates =
              candidates1.length > 2 || candidates2.length > 2;

            if (hasExtraCandidates) {
              const r1 = Math.floor(idx1 / 9) + 1;
              const c1 = (idx1 % 9) + 1;

              // Identificamos la basura a borrar (todos los candidatos MENOS el par oculto)
              // Esto es solo para mostrarlo en el mensaje, no para borrarlo aquí.
              // const toRemove = candidates1.filter(c => c !== numA && c !== numB)
              //    .concat(candidates2.filter(c => c !== numA && c !== numB));

              return {
                type: "Hidden Pair",
                cellIdx: idx1, // Foco en la primera celda
                value: null, // No ponemos un número, limpiamos notas
                candidates: [numA, numB],
                levels: {
                  1: `Hay dos números ocultos en esta ${name} que forman una pareja exclusiva.`,
                  2: `Mira la ${name} ${u + 1}. Los números ${numA} y ${numB} solo aparecen en dos casillas.`,
                  3: `Como ${numA} y ${numB} SOLO pueden ir en (F${r1},C${c1}) y la otra celda gemela, deben vivir allí solos.`,
                  4: `Cualquier otro candidato en esas dos celdas (aparte de ${numA} y ${numB}) es imposible.`,
                  5: `¡Limpia las celdas! Borra todo excepto ${numA} y ${numB} en esas dos ubicaciones.`,
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
