// src/logic/hints/xWing.ts
import { HintStrategy, HintResult } from "./types";

// --- HELPERS ---
const getRowIndices = (row: number) =>
  Array.from({ length: 9 }, (_, i) => row * 9 + i);
const getColIndices = (col: number) =>
  Array.from({ length: 9 }, (_, i) => i * 9 + col);

export const findXWing: HintStrategy = (
  grid,
  internalCandidates,
  userCandidates,
) => {
  // FASE 1: X-Wing en FILAS (Elimina en Columnas)
  for (let num = 1; num <= 9; num++) {
    const possibleRows: { rowIndex: number; cols: number[] }[] = [];

    // 1. Buscamos filas donde el número aparece exactamente 2 veces
    for (let r = 0; r < 9; r++) {
      const rowIndices = getRowIndices(r);
      const colsWithNum = rowIndices
        .map((idx) => idx % 9)
        .filter((c) => {
          const idx = r * 9 + c;
          return grid[idx] === null && internalCandidates[idx].includes(num);
        });

      if (colsWithNum.length === 2) {
        possibleRows.push({ rowIndex: r, cols: colsWithNum });
      }
    }

    // 2. Buscamos dos filas que compartan las mismas columnas
    for (let i = 0; i < possibleRows.length; i++) {
      for (let j = i + 1; j < possibleRows.length; j++) {
        const rowA = possibleRows[i];
        const rowB = possibleRows[j];

        if (rowA.cols[0] === rowB.cols[0] && rowA.cols[1] === rowB.cols[1]) {
          const col1 = rowA.cols[0];
          const col2 = rowA.cols[1];

          // 3. Verificamos si podemos eliminar algo en esas columnas
          let candidatesToEliminate: number[] = [];

          [col1, col2].forEach((c) => {
            const colIndices = getColIndices(c);
            colIndices.forEach((idx) => {
              const r = Math.floor(idx / 9);
              if (r !== rowA.rowIndex && r !== rowB.rowIndex) {
                if (
                  grid[idx] === null &&
                  internalCandidates[idx].includes(num)
                ) {
                  candidatesToEliminate.push(idx);
                }
              }
            });
          });

          // Si encontramos celdas para limpiar, ¡Armamos la pista de 4 pasos!
          if (candidatesToEliminate.length > 0) {
            const rA = rowA.rowIndex;
            const rB = rowB.rowIndex;
            const cA = col1;
            const cB = col2;

            // Las 4 esquinas del rectángulo del X-Wing
            const corners = [
              rA * 9 + cA,
              rA * 9 + cB,
              rB * 9 + cA,
              rB * 9 + cB,
            ];

            // Celdas de apoyo para pintar
            const rowCells = [...getRowIndices(rA), ...getRowIndices(rB)];
            const affectedCols = Array.from(
              new Set([...getColIndices(cA), ...getColIndices(cB)]),
            ).filter((idx) => !corners.includes(idx)); // Quitamos las esquinas para no sobreescribir colores

            return {
              found: true,
              type: "X-WING (Filas)",
              totalSteps: 4, // <-- Nuestra variable dinámica de pasos
              steps: [
                {
                  message: `He detectado un patrón "X-Wing" con el número ${num}.`,
                  highlights: {
                    primaryCells: corners,
                    secondaryCells: [],
                    focusNumber: num,
                  },
                },
                {
                  message: `Mira las filas ${rA + 1} y ${rB + 1}. El número ${num} solo aparece dos veces en cada una y están perfectamente alineados.`,
                  highlights: {
                    primaryCells: corners,
                    secondaryCells: rowCells,
                    focusNumber: num,
                  },
                },
                {
                  message: `Esto significa que el ${num} formará una 'X' cruzada. Ninguna OTRA celda en esas dos columnas puede tener un ${num}.`,
                  highlights: {
                    primaryCells: corners,
                    secondaryCells: affectedCols,
                    focusNumber: num,
                  },
                },
                {
                  message: `¡Elimina el candidato ${num} de las celdas resaltadas en esas columnas!`,
                  highlights: {
                    primaryCells: candidatesToEliminate,
                    secondaryCells: corners,
                    focusNumber: num,
                  },
                },
              ],
              action: {
                type: "REMOVE_CANDIDATE",
                cells: candidatesToEliminate,
                value: num,
              },
            };
          }
        }
      }
    }
  }

  // FASE 2: X-Wing en COLUMNAS (Elimina en Filas)
  for (let num = 1; num <= 9; num++) {
    const possibleCols: { colIndex: number; rows: number[] }[] = [];

    for (let c = 0; c < 9; c++) {
      const colIndices = getColIndices(c);
      const rowsWithNum = colIndices
        .map((idx) => Math.floor(idx / 9))
        .filter((r) => {
          const idx = r * 9 + c;
          return grid[idx] === null && internalCandidates[idx].includes(num);
        });

      if (rowsWithNum.length === 2) {
        possibleCols.push({ colIndex: c, rows: rowsWithNum });
      }
    }

    for (let i = 0; i < possibleCols.length; i++) {
      for (let j = i + 1; j < possibleCols.length; j++) {
        const colA = possibleCols[i];
        const colB = possibleCols[j];

        if (colA.rows[0] === colB.rows[0] && colA.rows[1] === colB.rows[1]) {
          const row1 = colA.rows[0];
          const row2 = colA.rows[1];

          let candidatesToEliminate: number[] = [];

          [row1, row2].forEach((r) => {
            const rowIndices = getRowIndices(r);
            rowIndices.forEach((idx) => {
              const c = idx % 9;
              if (c !== colA.colIndex && c !== colB.colIndex) {
                if (
                  grid[idx] === null &&
                  internalCandidates[idx].includes(num)
                ) {
                  candidatesToEliminate.push(idx);
                }
              }
            });
          });

          if (candidatesToEliminate.length > 0) {
            const cA = colA.colIndex;
            const cB = colB.colIndex;
            const rA = row1;
            const rB = row2;

            const corners = [
              rA * 9 + cA,
              rA * 9 + cB,
              rB * 9 + cA,
              rB * 9 + cB,
            ];
            const colCells = [...getColIndices(cA), ...getColIndices(cB)];
            const affectedRows = Array.from(
              new Set([...getRowIndices(rA), ...getRowIndices(rB)]),
            ).filter((idx) => !corners.includes(idx));

            return {
              found: true,
              type: "X-WING (Columnas)",
              totalSteps: 4,
              steps: [
                {
                  message: `He detectado un patrón "X-Wing" vertical con el número ${num}.`,
                  highlights: {
                    primaryCells: corners,
                    secondaryCells: [],
                    focusNumber: num,
                  },
                },
                {
                  message: `Mira las columnas ${cA + 1} y ${cB + 1}. El número ${num} solo aparece dos veces en cada una y están alineados.`,
                  highlights: {
                    primaryCells: corners,
                    secondaryCells: colCells,
                    focusNumber: num,
                  },
                },
                {
                  message: `El ${num} debe estar en una de esas intersecciones, bloqueando el resto de las celdas en esas filas horizontales.`,
                  highlights: {
                    primaryCells: corners,
                    secondaryCells: affectedRows,
                    focusNumber: num,
                  },
                },
                {
                  message: `¡Elimina el candidato ${num} de las celdas resaltadas en esas filas!`,
                  highlights: {
                    primaryCells: candidatesToEliminate,
                    secondaryCells: corners,
                    focusNumber: num,
                  },
                },
              ],
              action: {
                type: "REMOVE_CANDIDATE",
                cells: candidatesToEliminate,
                value: num,
              },
            };
          }
        }
      }
    }
  }

  // Si no encontró nada, devuelve null y el manager pasará a la siguiente técnica
  return null;
};
