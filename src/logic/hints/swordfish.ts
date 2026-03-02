import { HintStrategy } from "./types";

const getRowIndices = (row: number) =>
  Array.from({ length: 9 }, (_, i) => row * 9 + i);
const getColIndices = (col: number) =>
  Array.from({ length: 9 }, (_, i) => i * 9 + col);

export const findSwordfish: HintStrategy = (grid, internalCandidates) => {
  for (let num = 1; num <= 9; num++) {
    // 1. SWORDFISH EN FILAS
    const rowPositions: { row: number; cols: number[]; cells: number[] }[] = [];

    for (let r = 0; r < 9; r++) {
      const rIndices = getRowIndices(r);
      const cellsWithNum = rIndices.filter(
        (idx) => grid[idx] === null && internalCandidates[idx].includes(num),
      );
      if (cellsWithNum.length >= 2 && cellsWithNum.length <= 3) {
        rowPositions.push({
          row: r,
          cols: cellsWithNum.map((idx) => idx % 9),
          cells: cellsWithNum,
        });
      }
    }

    for (let i = 0; i < rowPositions.length - 2; i++) {
      for (let j = i + 1; j < rowPositions.length - 1; j++) {
        for (let k = j + 1; k < rowPositions.length; k++) {
          const r1 = rowPositions[i];
          const r2 = rowPositions[j];
          const r3 = rowPositions[k];

          const combinedCols = Array.from(
            new Set([...r1.cols, ...r2.cols, ...r3.cols]),
          );

          if (combinedCols.length === 3) {
            const cellsToClear: number[] = [];
            const swordfishCells = [...r1.cells, ...r2.cells, ...r3.cells];

            for (const c of combinedCols) {
              const cIndices = getColIndices(c);
              const garbage = cIndices.filter(
                (idx) =>
                  grid[idx] === null &&
                  internalCandidates[idx].includes(num) &&
                  Math.floor(idx / 9) !== r1.row &&
                  Math.floor(idx / 9) !== r2.row &&
                  Math.floor(idx / 9) !== r3.row,
              );
              cellsToClear.push(...garbage);
            }

            if (cellsToClear.length > 0) {
              return {
                found: true,
                type: "SWORDFISH (Filas)",
                totalSteps: 3,
                steps: [
                  {
                    message: `Fíjate en las Filas ${r1.row + 1}, ${r2.row + 1} y ${r3.row + 1}. El candidato ${num} está estrictamente limitado a 2 o 3 casillas en cada una.`,
                    highlights: {
                      primaryCells: swordfishCells,
                      secondaryCells: [
                        ...getRowIndices(r1.row),
                        ...getRowIndices(r2.row),
                        ...getRowIndices(r3.row),
                      ],
                      focusNumber: num,
                    },
                  },
                  {
                    message: `Al alinear esas 3 filas, vemos que todos los ${num} caen exactamente en solo 3 Columnas. Esto crea un patrón "Swordfish".`,
                    highlights: {
                      primaryCells: swordfishCells,
                      secondaryCells: combinedCols.flatMap((c) =>
                        getColIndices(c),
                      ),
                      focusNumber: num,
                    },
                  },
                  {
                    message: `Como el ${num} se repartirá obligatoriamente en esas intersecciones, bloquea el paso en el resto de esas 3 columnas. ¡Límpialo!`,
                    highlights: {
                      primaryCells: cellsToClear,
                      secondaryCells: swordfishCells,
                      focusNumber: num,
                    },
                  },
                ],
                action: {
                  type: "REMOVE_CANDIDATE",
                  cells: cellsToClear,
                  values: [num],
                },
              };
            }
          }
        }
      }
    }

    // 2. SWORDFISH EN COLUMNAS
    const colPositions: { col: number; rows: number[]; cells: number[] }[] = [];

    for (let c = 0; c < 9; c++) {
      const cIndices = getColIndices(c);
      const cellsWithNum = cIndices.filter(
        (idx) => grid[idx] === null && internalCandidates[idx].includes(num),
      );
      if (cellsWithNum.length >= 2 && cellsWithNum.length <= 3) {
        colPositions.push({
          col: c,
          rows: cellsWithNum.map((idx) => Math.floor(idx / 9)),
          cells: cellsWithNum,
        });
      }
    }

    for (let i = 0; i < colPositions.length - 2; i++) {
      for (let j = i + 1; j < colPositions.length - 1; j++) {
        for (let k = j + 1; k < colPositions.length; k++) {
          const c1 = colPositions[i];
          const c2 = colPositions[j];
          const c3 = colPositions[k];

          const combinedRows = Array.from(
            new Set([...c1.rows, ...c2.rows, ...c3.rows]),
          );

          if (combinedRows.length === 3) {
            const cellsToClear: number[] = [];
            const swordfishCells = [...c1.cells, ...c2.cells, ...c3.cells];

            for (const r of combinedRows) {
              const rIndices = getRowIndices(r);
              const garbage = rIndices.filter(
                (idx) =>
                  grid[idx] === null &&
                  internalCandidates[idx].includes(num) &&
                  idx % 9 !== c1.col &&
                  idx % 9 !== c2.col &&
                  idx % 9 !== c3.col,
              );
              cellsToClear.push(...garbage);
            }

            if (cellsToClear.length > 0) {
              return {
                found: true,
                type: "SWORDFISH (Columnas)",
                totalSteps: 3,
                steps: [
                  {
                    message: `Fíjate en las Columnas ${c1.col + 1}, ${c2.col + 1} y ${c3.col + 1}. El candidato ${num} está limitado a 2 o 3 casillas en cada una.`,
                    highlights: {
                      primaryCells: swordfishCells,
                      secondaryCells: [
                        ...getColIndices(c1.col),
                        ...getColIndices(c2.col),
                        ...getColIndices(c3.col),
                      ],
                      focusNumber: num,
                    },
                  },
                  {
                    message: `Al alinearlas, vemos que todos los ${num} caen exactamente en las mismas 3 Filas. ¡Es un patrón "Swordfish" vertical!`,
                    highlights: {
                      primaryCells: swordfishCells,
                      secondaryCells: combinedRows.flatMap((r) =>
                        getRowIndices(r),
                      ),
                      focusNumber: num,
                    },
                  },
                  {
                    message: `El ${num} ocupará 3 casillas dentro de esa red, expulsando a todos los demás ${num} de esas 3 Filas enteras. ¡Límpialos!`,
                    highlights: {
                      primaryCells: cellsToClear,
                      secondaryCells: swordfishCells,
                      focusNumber: num,
                    },
                  },
                ],
                action: {
                  type: "REMOVE_CANDIDATE",
                  cells: cellsToClear,
                  values: [num],
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
