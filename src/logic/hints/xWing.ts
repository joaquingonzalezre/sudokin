import { HintStrategy } from "./types";

// --- HELPERS (Reutilizamos los mismos) ---
const getRowIndices = (row: number) =>
  Array.from({ length: 9 }, (_, i) => row * 9 + i);
const getColIndices = (col: number) =>
  Array.from({ length: 9 }, (_, i) => i * 9 + col);

export const findXWing: HintStrategy = (grid, candidates) => {
  // El X-Wing puede formarse tomando como base FILAS o COLUMNAS.
  // Vamos a probar primero buscando X-Wings basados en FILAS (para eliminar en Columnas).
  // Luego, si no encontramos nada, podríamos buscar en COLUMNAS (para eliminar en Filas).

  // FASE 1: X-Wing en FILAS (Elimina en Columnas)
  for (let num = 1; num <= 9; num++) {
    // 1. Buscamos en qué filas el número 'num' aparece EXACTAMENTE 2 veces.
    const possibleRows: { rowIndex: number; cols: number[] }[] = [];

    for (let r = 0; r < 9; r++) {
      const rowIndices = getRowIndices(r);
      // Filtramos celdas vacías que tengan el candidato 'num'
      const colsWithNum = rowIndices
        .map((idx) => idx % 9) // Nos quedamos solo con el índice de columna (0-8)
        .filter((c) => {
          const idx = r * 9 + c;
          return grid[idx] === null && candidates[idx].includes(num);
        });

      if (colsWithNum.length === 2) {
        possibleRows.push({ rowIndex: r, cols: colsWithNum });
      }
    }

    // 2. Buscamos dos filas que tengan el candidato en las MISMAS dos columnas
    for (let i = 0; i < possibleRows.length; i++) {
      for (let j = i + 1; j < possibleRows.length; j++) {
        const rowA = possibleRows[i];
        const rowB = possibleRows[j];

        // ¿Están alineados? (Las columnas deben ser idénticas)
        if (rowA.cols[0] === rowB.cols[0] && rowA.cols[1] === rowB.cols[1]) {
          const col1 = rowA.cols[0];
          const col2 = rowA.cols[1];

          // 3. VERIFICACIÓN: ¿Podemos eliminar algo en esas columnas?
          // (Buscamos en las columnas col1 y col2, pero NO en las filas rowA y rowB)
          let candidatesToEliminate: number[] = [];

          // Recorremos las dos columnas afectadas
          [col1, col2].forEach((c) => {
            const colIndices = getColIndices(c);
            colIndices.forEach((idx) => {
              const r = Math.floor(idx / 9);
              // Si NO es una de las filas base del X-Wing
              if (r !== rowA.rowIndex && r !== rowB.rowIndex) {
                if (grid[idx] === null && candidates[idx].includes(num)) {
                  candidatesToEliminate.push(idx);
                }
              }
            });
          });

          if (candidatesToEliminate.length > 0) {
            const rA = rowA.rowIndex + 1;
            const rB = rowB.rowIndex + 1;
            const cA = col1 + 1;
            const cB = col2 + 1;

            return {
              type: "X-Wing",
              cellIdx: rowA.rowIndex * 9 + col1, // Foco en la esquina superior izquierda
              value: null,
              candidates: [num],
              levels: {
                1: `He detectado un patrón "X-Wing" con el número ${num}.`,
                2: `Mira las filas ${rA} y ${rB}. El número ${num} solo aparece dos veces en cada una y están alineados.`,
                3: `El ${num} debe ir obligatoriamente en una de las esquinas de este rectángulo (C${cA} o C${cB}).`,
                4: `Esto significa que ninguna OTRA celda de las columnas ${cA} y ${cB} puede tener un ${num}.`,
                5: `¡Elimina el candidato ${num} de todas las celdas de las columnas ${cA} y ${cB} (excepto las del rectángulo)!`,
              },
            };
          }
        }
      }
    }
  }

  // FASE 2: X-Wing en COLUMNAS (Elimina en Filas)
  // (La lógica es simétrica, pero invertimos filas por columnas)
  for (let num = 1; num <= 9; num++) {
    const possibleCols: { colIndex: number; rows: number[] }[] = [];

    for (let c = 0; c < 9; c++) {
      const colIndices = getColIndices(c);
      const rowsWithNum = colIndices
        .map((idx) => Math.floor(idx / 9))
        .filter((r) => {
          const idx = r * 9 + c;
          return grid[idx] === null && candidates[idx].includes(num);
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
                if (grid[idx] === null && candidates[idx].includes(num)) {
                  candidatesToEliminate.push(idx);
                }
              }
            });
          });

          if (candidatesToEliminate.length > 0) {
            return {
              type: "X-Wing",
              cellIdx: row1 * 9 + colA.colIndex,
              value: null,
              candidates: [num],
              levels: {
                1: `He detectado un patrón "X-Wing" (Vertical) con el número ${num}.`,
                2: `Mira las columnas ${colA.colIndex + 1} y ${colB.colIndex + 1}.`,
                3: `El ${num} está alineado en las filas ${row1 + 1} y ${row2 + 1}.`,
                4: `El ${num} debe estar en una de esas intersecciones, bloqueando el resto de las filas.`,
                5: `¡Elimina el candidato ${num} del resto de las filas ${row1 + 1} y ${row2 + 1}!`,
              },
            };
          }
        }
      }
    }
  }

  return null;
};
