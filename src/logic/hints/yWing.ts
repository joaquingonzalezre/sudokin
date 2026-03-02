import { HintStrategy } from "./types";

const getRow = (idx: number) => Math.floor(idx / 9);
const getCol = (idx: number) => idx % 9;
const getBox = (idx: number) =>
  Math.floor(getRow(idx) / 3) * 3 + Math.floor(getCol(idx) / 3);

const getPeers = (idx: number) => {
  const peers = new Set<number>();
  const r = getRow(idx);
  const c = getCol(idx);
  const b = getBox(idx);
  for (let i = 0; i < 81; i++) {
    if (i !== idx && (getRow(i) === r || getCol(i) === c || getBox(i) === b))
      peers.add(i);
  }
  return Array.from(peers);
};

export const findYWing: HintStrategy = (grid, internalCandidates) => {
  const biValueCells = [];
  for (let i = 0; i < 81; i++) {
    if (grid[i] === null && internalCandidates[i].length === 2) {
      biValueCells.push({ idx: i, cands: internalCandidates[i] });
    }
  }

  for (const pivot of biValueCells) {
    const [x, y] = pivot.cands;
    const peers = getPeers(pivot.idx);

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

    for (const p1 of pincer1Candidates) {
      for (const p2 of pincer2Candidates) {
        if (p1.z === p2.z && p1.idx !== p2.idx) {
          const z = p1.z;
          const p1Peers = getPeers(p1.idx);
          const p2Peers = getPeers(p2.idx);

          const commonPeers = p1Peers.filter(
            (idx) =>
              p2Peers.includes(idx) &&
              idx !== pivot.idx &&
              idx !== p1.idx &&
              idx !== p2.idx,
          );
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
                  message: `Ahora mira estas dos celdas "Pinzas" conectadas. Una tiene [${x}, ${z}] y la otra [${y}, ${z}].`,
                  highlights: {
                    primaryCells: [p1.idx, p2.idx],
                    secondaryCells: [pivot.idx],
                    focusNumber: null,
                  },
                },
                {
                  message: `Si la Bisagra es ${x}, la Pinza 1 será ${z}. Si es ${y}, la Pinza 2 será ${z}. ¡Una siempre será ${z}! Elimina el ${z} de las casillas que cruzan ambas pinzas.`,
                  highlights: {
                    primaryCells: cellsToClear,
                    secondaryCells: [p1.idx, p2.idx],
                    focusNumber: z,
                  },
                },
              ],
              action: {
                type: "REMOVE_CANDIDATE",
                cells: cellsToClear,
                values: [z],
              },
            };
          }
        }
      }
    }
  }
  return null;
};
