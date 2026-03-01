import { HintStrategy } from "./types";

const getRow = (idx: number) => Math.floor(idx / 9);
const getCol = (idx: number) => idx % 9;
const getBox = (idx: number) =>
  Math.floor(getRow(idx) / 3) * 3 + Math.floor(getCol(idx) / 3);

// Función auxiliar para obtener todas las celdas que "ven" a una celda dada
const getPeers = (idx: number) => {
  const peers = new Set<number>();
  const r = getRow(idx);
  const c = getCol(idx);
  const b = getBox(idx);
  for (let i = 0; i < 81; i++) {
    if (i !== idx && (getRow(i) === r || getCol(i) === c || getBox(i) === b)) {
      peers.add(i);
    }
  }
  return Array.from(peers);
};

export const findYWing: HintStrategy = (grid, internalCandidates) => {
  // 1. Encontrar todas las celdas que tengan exactamente 2 candidatos (Bi-value cells)
  const biValueCells = [];
  for (let i = 0; i < 81; i++) {
    if (grid[i] === null && internalCandidates[i].length === 2) {
      biValueCells.push({ idx: i, cands: internalCandidates[i] });
    }
  }

  // 2. Evaluar cada una de estas celdas como una posible "Bisagra"
  for (const pivot of biValueCells) {
    const [x, y] = pivot.cands;
    const peers = getPeers(pivot.idx);

    // 3. Buscar posibles "Pinzas" entre las celdas que ven a la Bisagra
    const pincer1Candidates = peers
      .filter(
        (idx) =>
          grid[idx] === null &&
          internalCandidates[idx].length === 2 &&
          internalCandidates[idx].includes(x) &&
          !internalCandidates[idx].includes(y),
      )
      .map((idx) => ({
        idx,
        z: internalCandidates[idx].find((c) => c !== x)!,
      }));

    const pincer2Candidates = peers
      .filter(
        (idx) =>
          grid[idx] === null &&
          internalCandidates[idx].length === 2 &&
          internalCandidates[idx].includes(y) &&
          !internalCandidates[idx].includes(x),
      )
      .map((idx) => ({
        idx,
        z: internalCandidates[idx].find((c) => c !== y)!,
      }));

    // 4. Probar las combinaciones de Pinza 1 y Pinza 2
    for (const p1 of pincer1Candidates) {
      for (const p2 of pincer2Candidates) {
        // Deben compartir exactamente el mismo tercer número 'Z'
        if (p1.z === p2.z && p1.idx !== p2.idx) {
          const z = p1.z;

          const p1Peers = getPeers(p1.idx);
          const p2Peers = getPeers(p2.idx);

          // 5. Encontrar celdas que sean intersectadas por AMBAS pinzas
          const commonPeers = p1Peers.filter(
            (idx) =>
              p2Peers.includes(idx) &&
              idx !== pivot.idx &&
              idx !== p1.idx &&
              idx !== p2.idx,
          );

          // 6. Revisar si hay "basura" (el número Z) que podamos limpiar en esas intersecciones
          const cellsToClear = commonPeers.filter(
            (idx) => grid[idx] === null && internalCandidates[idx].includes(z),
          );

          if (cellsToClear.length > 0) {
            return {
              found: true,
              type: "Y-WING (XY-Wing)",
              totalSteps: 3,
              steps: [
                {
                  message: `Fíjate en la celda marcada. Funciona como una "Bisagra", y solo tiene 2 opciones posibles: el ${x} y el ${y}.`,
                  highlights: {
                    primaryCells: [pivot.idx],
                    secondaryCells: [],
                    focusNumber: null,
                  },
                },
                {
                  message: `Ahora mira estas dos celdas "Pinzas" que están conectadas a la bisagra. Una tiene [${x}, ${z}] y la otra [${y}, ${z}].`,
                  highlights: {
                    primaryCells: [p1.idx, p2.idx],
                    secondaryCells: [pivot.idx],
                    focusNumber: null,
                  },
                },
                {
                  message: `Piensa en esto: Si la Bisagra es ${x}, la Pinza 1 será ${z}. Si la Bisagra es ${y}, la Pinza 2 será ${z}. ¡Pase lo que pase, una de las dos Pinzas siempre será el número ${z}! Elimina el ${z} de las casillas que crucen con ambas pinzas.`,
                  highlights: {
                    primaryCells: cellsToClear,
                    secondaryCells: [p1.idx, p2.idx],
                    focusNumber: z,
                  },
                },
              ],
              action: {
                type: "REMOVE_CANDIDATES",
                removals: cellsToClear.map((idx) => ({
                  cell: idx,
                  values: [z],
                })),
              } as any, // Mantenemos el "as any" mágico que nos salvó en el X-Wing
            };
          }
        }
      }
    }
  }

  return null;
};
