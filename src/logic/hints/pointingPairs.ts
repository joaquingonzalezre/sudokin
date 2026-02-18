import { HintStrategy } from "./types";

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

const getRowIndices = (row: number) =>
  Array.from({ length: 9 }, (_, i) => row * 9 + i);
const getColIndices = (col: number) =>
  Array.from({ length: 9 }, (_, i) => i * 9 + col);

export const findPointingPairs: HintStrategy = (
  grid,
  internalCandidates,
  userCandidates,
) => {
  // Iteramos por cada CAJA (0 a 8)
  for (let box = 0; box < 9; box++) {
    const boxIndices = getBoxIndices(box);

    // Probamos cada número del 1 al 9
    for (let num = 1; num <= 9; num++) {
      // Buscamos todas las celdas EN ESTA CAJA que pueden contener el número
      // Usamos 'internalCandidates' para la lógica matemática
      const possibleCells = boxIndices.filter(
        (idx) => grid[idx] === null && internalCandidates[idx].includes(num),
      );

      // Necesitamos al menos 2 celdas alineadas para que sea un "Pair" o "Triple"
      if (possibleCells.length < 2 || possibleCells.length > 3) continue;

      // --- VERIFICACIÓN DE FILA ---
      // ¿Están todas las celdas en la misma Fila?
      const firstRow = Math.floor(possibleCells[0] / 9);
      const allInSameRow = possibleCells.every(
        (idx) => Math.floor(idx / 9) === firstRow,
      );

      if (allInSameRow) {
        // ¡ES UN POINTING PAIR EN FILA!
        // Debemos eliminar el 'num' del resto de la fila (fuera de esta caja)

        const rowIndices = getRowIndices(firstRow);

        // Celdas afectadas: Están en la fila, PERO NO en la caja actual
        const affectedCells = rowIndices.filter((idx) => {
          // Si está en la caja actual, NO lo borramos (es parte de la solución)
          if (boxIndices.includes(idx)) return false;
          // Si ya tiene número puesto, ignorar
          if (grid[idx] !== null) return false;
          // ¿Tiene el número candidato?
          return internalCandidates[idx].includes(num);
        });

        // FILTRO VISUAL: ¿Queda algo que el usuario pueda borrar?
        const actionableCells = affectedCells.filter(
          (idx) =>
            userCandidates[idx].length === 0 ||
            userCandidates[idx].includes(num),
        );

        if (actionableCells.length > 0) {
          return {
            type: "Pointing Pairs",
            cellIdx: possibleCells[0], // Foco en una de las celdas del par
            value: null,
            candidates: [num],
            levels: {
              1: `Fíjate en la Caja ${box + 1}. El número ${num} está alineado.`,
              2: `Dentro de la Caja ${box + 1}, el número ${num} solo puede ir en la Fila ${firstRow + 1}.`,
              3: `Como el ${num} tiene que estar obligatoriamente en esa línea dentro de la caja, "apunta" hacia afuera.`,
              4: `Ninguna otra celda de la Fila ${firstRow + 1} (fuera de esta caja) puede contener un ${num}.`,
              5: `¡Elimina el candidato ${num} del resto de la Fila ${firstRow + 1}!`,
            },
          };
        }
      }

      // --- VERIFICACIÓN DE COLUMNA ---
      // ¿Están todas las celdas en la misma Columna?
      const firstCol = possibleCells[0] % 9;
      const allInSameCol = possibleCells.every((idx) => idx % 9 === firstCol);

      if (allInSameCol) {
        // ¡ES UN POINTING PAIR EN COLUMNA!
        const colIndices = getColIndices(firstCol);

        const affectedCells = colIndices.filter((idx) => {
          if (boxIndices.includes(idx)) return false;
          if (grid[idx] !== null) return false;
          return internalCandidates[idx].includes(num);
        });

        const actionableCells = affectedCells.filter(
          (idx) =>
            userCandidates[idx].length === 0 ||
            userCandidates[idx].includes(num),
        );

        if (actionableCells.length > 0) {
          return {
            type: "Pointing Pairs",
            cellIdx: possibleCells[0],
            value: null,
            candidates: [num],
            levels: {
              1: `Fíjate en la Caja ${box + 1}. El número ${num} está alineado verticalmente.`,
              2: `Dentro de la Caja ${box + 1}, el número ${num} solo puede ir en la Columna ${firstCol + 1}.`,
              3: `Como el ${num} está bloqueado en esa columna dentro de la caja, expulsa a los demás.`,
              4: `Ninguna otra celda de la Columna ${firstCol + 1} (fuera de esta caja) puede contener un ${num}.`,
              5: `¡Elimina el candidato ${num} del resto de la Columna ${firstCol + 1}!`,
            },
          };
        }
      }
    }
  }

  return null;
};
