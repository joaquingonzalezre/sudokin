import { HintStrategy } from "./types";

const getRowIndices = (row: number) =>
  Array.from({ length: 9 }, (_, i) => row * 9 + i);
const getColIndices = (col: number) =>
  Array.from({ length: 9 }, (_, i) => i * 9 + col);

export const findXWing: HintStrategy = (grid, internalCandidates) => {
  for (let num = 1; num <= 9; num++) {
    // 1. X-WING EN FILAS
    const rowPositions: { row: number; cols: number[]; cells: number[] }[] = [];

    for (let r = 0; r < 9; r++) {
      const rIndices = getRowIndices(r);
      const cellsWithNum = rIndices.filter(
        (idx) => grid[idx] === null && internalCandidates[idx].includes(num),
      );

      if (cellsWithNum.length === 2) {
        rowPositions.push({
          row: r,
          cols: [cellsWithNum[0] % 9, cellsWithNum[1] % 9],
          cells: cellsWithNum,
        });
      }
    }

    for (let i = 0; i < rowPositions.length - 1; i++) {
      for (let j = i + 1; j < rowPositions.length; j++) {
        const r1 = rowPositions[i];
        const r2 = rowPositions[j];

        if (
          r1.cols[0] === r2.cols[0] &&
          r1.cols[1] === r2.cols[1] &&
          Math.floor(r1.row / 3) !== Math.floor(r2.row / 3) &&
          Math.floor(r1.cols[0] / 3) !== Math.floor(r1.cols[1] / 3)
        ) {
          const col1Indices = getColIndices(r1.cols[0]);
          const col2Indices = getColIndices(r1.cols[1]);

          const cellsToClear = [...col1Indices, ...col2Indices].filter(
            (idx) =>
              grid[idx] === null &&
              internalCandidates[idx].includes(num) &&
              Math.floor(idx / 9) !== r1.row &&
              Math.floor(idx / 9) !== r2.row,
          );

          if (cellsToClear.length > 0) {
            return {
              found: true,
              type: "X-WING (Filas)",
              totalSteps: 3,
              steps: [
                {
                  message: `Fíjate en las Filas ${r1.row + 1} y ${r2.row + 1}. El candidato ${num} solo puede ir en 2 casillas en cada una de ellas.`,
                  highlights: {
                    primaryCells: [...r1.cells, ...r2.cells],
                    secondaryCells: [
                      ...getRowIndices(r1.row),
                      ...getRowIndices(r2.row),
                    ],
                    focusNumber: num,
                  },
                },
                {
                  message: `Esto crea un patrón "X-Wing". Pase lo que pase, el ${num} tendrá que ir obligatoriamente en dos esquinas diagonales de este rectángulo.`,
                  highlights: {
                    primaryCells: [...r1.cells, ...r2.cells],
                    secondaryCells: [...col1Indices, ...col2Indices],
                    focusNumber: num,
                  },
                },
                {
                  message: `Por lo tanto, es imposible que el ${num} esté en ninguna otra parte de esas dos Columnas. ¡Elimina el ${num} de las celdas marcadas!`,
                  highlights: {
                    primaryCells: cellsToClear,
                    secondaryCells: [...r1.cells, ...r2.cells],
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

    // 2. X-WING EN COLUMNAS
    const colPositions: { col: number; rows: number[]; cells: number[] }[] = [];

    for (let c = 0; c < 9; c++) {
      const cIndices = getColIndices(c);
      const cellsWithNum = cIndices.filter(
        (idx) => grid[idx] === null && internalCandidates[idx].includes(num),
      );

      if (cellsWithNum.length === 2) {
        colPositions.push({
          col: c,
          rows: [
            Math.floor(cellsWithNum[0] / 9),
            Math.floor(cellsWithNum[1] / 9),
          ],
          cells: cellsWithNum,
        });
      }
    }

    for (let i = 0; i < colPositions.length - 1; i++) {
      for (let j = i + 1; j < colPositions.length; j++) {
        const c1 = colPositions[i];
        const c2 = colPositions[j];

        if (
          c1.rows[0] === c2.rows[0] &&
          c1.rows[1] === c2.rows[1] &&
          Math.floor(c1.col / 3) !== Math.floor(c2.col / 3) &&
          Math.floor(c1.rows[0] / 3) !== Math.floor(c1.rows[1] / 3)
        ) {
          const row1Indices = getRowIndices(c1.rows[0]);
          const row2Indices = getRowIndices(c1.rows[1]);

          const cellsToClear = [...row1Indices, ...row2Indices].filter(
            (idx) =>
              grid[idx] === null &&
              internalCandidates[idx].includes(num) &&
              idx % 9 !== c1.col &&
              idx % 9 !== c2.col,
          );

          if (cellsToClear.length > 0) {
            return {
              found: true,
              type: "X-WING (Columnas)",
              totalSteps: 3,
              steps: [
                {
                  message: `Fíjate en las Columnas ${c1.col + 1} y ${c2.col + 1}. El candidato ${num} solo puede ir en 2 casillas en cada una.`,
                  highlights: {
                    primaryCells: [...c1.cells, ...c2.cells],
                    secondaryCells: [
                      ...getColIndices(c1.col),
                      ...getColIndices(c2.col),
                    ],
                    focusNumber: num,
                  },
                },
                {
                  message: `Esto crea un patrón "X-Wing" vertical. El ${num} ocupará obligatoriamente dos esquinas diagonales cruzadas.`,
                  highlights: {
                    primaryCells: [...c1.cells, ...c2.cells],
                    secondaryCells: [...row1Indices, ...row2Indices],
                    focusNumber: num,
                  },
                },
                {
                  message: `Por lo tanto, expulsa a los demás ${num} del resto de esas dos Filas. ¡Bórralos!`,
                  highlights: {
                    primaryCells: cellsToClear,
                    secondaryCells: [...c1.cells, ...c2.cells],
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
  return null;
};
