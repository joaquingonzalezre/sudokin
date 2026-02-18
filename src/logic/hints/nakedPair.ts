import { HintStrategy } from "./types";

// --- HELPERS (Podrías moverlos a un utils.ts compartido en el futuro) ---
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

// Compara si dos arrays son idénticos (ej: [2,5] y [2,5])
const areArraysEqual = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
};

export const findNakedPair: HintStrategy = (grid, candidates) => {
  const units = [
    { name: "Fila", getter: getRowIndices },
    { name: "Columna", getter: getColIndices },
    { name: "Caja", getter: getBoxIndices },
  ];

  for (const { name, getter } of units) {
    for (let u = 0; u < 9; u++) {
      const cellIndices = getter(u);

      // 1. Buscamos todas las celdas en esta unidad que tengan EXACTAMENTE 2 candidatos.
      // (Un Naked Pair solo puede ocurrir en celdas bivalentes)
      const bivalueCells = cellIndices.filter(
        (idx) => grid[idx] === null && candidates[idx].length === 2,
      );

      // 2. Comparamos cada celda con las demás para encontrar gemelos
      for (let i = 0; i < bivalueCells.length; i++) {
        for (let j = i + 1; j < bivalueCells.length; j++) {
          const idxA = bivalueCells[i];
          const idxB = bivalueCells[j];
          const candA = candidates[idxA];
          const candB = candidates[idxB];

          // ¿Tienen exactamente los mismos candidatos? (ej: [3,7] y [3,7])
          if (areArraysEqual(candA, candB)) {
            const pairValues = candA; // Los dos números culpables (ej: [3, 7])

            // 3. VERIFICACIÓN CRÍTICA: ¿Esta pareja sirve para eliminar algo?
            // Buscamos en el resto de la unidad si existen estos números para borrar.
            const affectedCells = cellIndices.filter((idx) => {
              // No es una de las celdas del par
              if (idx === idxA || idx === idxB) return false;
              // Está vacía
              if (grid[idx] !== null) return false;
              // ¿Tiene alguno de los valores prohibidos?
              return candidates[idx].some((c) => pairValues.includes(c));
            });

            // Si encontramos celdas afectadas, ¡Tenemos una pista útil!
            if (affectedCells.length > 0) {
              const rA = Math.floor(idxA / 9) + 1;
              const cA = (idxA % 9) + 1;
              const rB = Math.floor(idxB / 9) + 1;
              const cB = (idxB % 9) + 1;

              return {
                type: "Naked Pair",
                cellIdx: idxA, // Foco principal en la primera celda del par
                value: null, // No sugiere un número para poner, sino para borrar
                candidates: pairValues,
                levels: {
                  1: `Hay dos casillas en esta ${name} que forman una pareja exclusiva ("Naked Pair").`,
                  2: `Mira la ${name} ${u + 1}. Hay dos celdas que contienen exactamente los mismos dos candidatos.`,
                  3: `Las celdas en (F${rA},C${cA}) y (F${rB},C${cB}) solo pueden ser ${pairValues[0]} o ${pairValues[1]}.`,
                  4: `Como el ${pairValues[0]} y ${pairValues[1]} TIENEN que estar en esas dos casillas, no pueden estar en ninguna otra de la ${name}.`,
                  5: `¡Elimina los candidatos ${pairValues.join(" y ")} del resto de las celdas de la ${name}!`,
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
