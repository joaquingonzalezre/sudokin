import { HintStrategy } from "./types";

const getBoxIndices = (box: number) => {
  const startRow = Math.floor(box / 3) * 3;
  const startCol = (box % 3) * 3;
  return Array.from(
    { length: 9 },
    (_, i) => (startRow + Math.floor(i / 3)) * 9 + (startCol + (i % 3)),
  );
};
const getRowIndices = (row: number) =>
  Array.from({ length: 9 }, (_, i) => row * 9 + i);
const getColIndices = (col: number) =>
  Array.from({ length: 9 }, (_, i) => i * 9 + col);

export const findPointingPairs: HintStrategy = (grid, internalCandidates) => {
  for (let box = 0; box < 9; box++) {
    const boxIndices = getBoxIndices(box);

    for (let num = 1; num <= 9; num++) {
      const possibleCells = boxIndices.filter(
        (idx) => grid[idx] === null && internalCandidates[idx].includes(num),
      );
      if (possibleCells.length < 2 || possibleCells.length > 3) continue;

      // VERIFICACIÓN DE FILA
      const firstRow = Math.floor(possibleCells[0] / 9);
      if (possibleCells.every((idx) => Math.floor(idx / 9) === firstRow)) {
        const rowIndices = getRowIndices(firstRow);
        const affectedCells = rowIndices.filter(
          (idx) =>
            !boxIndices.includes(idx) &&
            grid[idx] === null &&
            internalCandidates[idx].includes(num),
        );

        if (affectedCells.length > 0) {
          return {
            found: true,
            type: "POINTING PAIRS (Fila)",
            totalSteps: 3,
            steps: [
              {
                message: `Fíjate en la Caja ${box + 1}. El número ${num} está alineado.`,
                highlights: {
                  primaryCells: possibleCells,
                  secondaryCells: boxIndices,
                  focusNumber: num,
                },
              },
              {
                message: `Como el ${num} tiene que estar obligatoriamente en esa línea dentro de la caja, "apunta" hacia afuera bloqueando el resto de la Fila ${firstRow + 1}.`,
                highlights: {
                  primaryCells: possibleCells,
                  secondaryCells: rowIndices,
                  focusNumber: num,
                },
              },
              {
                message: `¡Elimina el candidato ${num} del resto de la fila!`,
                highlights: {
                  primaryCells: affectedCells,
                  secondaryCells: possibleCells,
                  focusNumber: num,
                },
              },
            ],
            action: {
              type: "REMOVE_CANDIDATE",
              cells: affectedCells,
              value: num,
            },
          };
        }
      }

      // VERIFICACIÓN DE COLUMNA
      const firstCol = possibleCells[0] % 9;
      if (possibleCells.every((idx) => idx % 9 === firstCol)) {
        const colIndices = getColIndices(firstCol);
        const affectedCells = colIndices.filter(
          (idx) =>
            !boxIndices.includes(idx) &&
            grid[idx] === null &&
            internalCandidates[idx].includes(num),
        );

        if (affectedCells.length > 0) {
          return {
            found: true,
            type: "POINTING PAIRS (Columna)",
            totalSteps: 3,
            steps: [
              {
                message: `Fíjate en la Caja ${box + 1}. El número ${num} está alineado verticalmente.`,
                highlights: {
                  primaryCells: possibleCells,
                  secondaryCells: boxIndices,
                  focusNumber: num,
                },
              },
              {
                message: `Al estar bloqueado en esa columna dentro de la caja, expulsa a los demás ${num} de la Columna ${firstCol + 1}.`,
                highlights: {
                  primaryCells: possibleCells,
                  secondaryCells: colIndices,
                  focusNumber: num,
                },
              },
              {
                message: `¡Elimina el candidato ${num} del resto de la columna!`,
                highlights: {
                  primaryCells: affectedCells,
                  secondaryCells: possibleCells,
                  focusNumber: num,
                },
              },
            ],
            action: {
              type: "REMOVE_CANDIDATE",
              cells: affectedCells,
              value: num,
            },
          };
        }
      }
    }
  }
  return null;
};
