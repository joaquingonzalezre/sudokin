import { HintStrategy } from "./types";

const getRowIndices = (row: number) =>
  Array.from({ length: 9 }, (_, i) => row * 9 + i);
const getColIndices = (col: number) =>
  Array.from({ length: 9 }, (_, i) => i * 9 + col);
const getBoxIndices = (box: number) => {
  const startRow = Math.floor(box / 3) * 3;
  const startCol = (box % 3) * 3;
  return Array.from(
    { length: 9 },
    (_, i) => (startRow + Math.floor(i / 3)) * 9 + (startCol + (i % 3)),
  );
};

export const findHiddenSingle: HintStrategy = (grid, internalCandidates) => {
  const units = [
    { name: "Fila", getter: getRowIndices },
    { name: "Columna", getter: getColIndices },
    { name: "Caja", getter: getBoxIndices },
  ];

  for (const { name, getter } of units) {
    for (let u = 0; u < 9; u++) {
      const cellIndices = getter(u);

      for (let num = 1; num <= 9; num++) {
        // 🛑 LA REGLA DE SENTIDO COMÚN (EL FIX):
        // ¿Este número ya está puesto como número GRANDE en esta Fila/Col/Caja?
        // Si ya está puesto, lo ignoramos por completo.
        const isAlreadyPlaced = cellIndices.some((idx) => grid[idx] === num);
        if (isAlreadyPlaced) continue;

        // Si no está puesto, buscamos en qué celdas vacías tiene candidato
        const possibleCells = cellIndices.filter(
          (idx) => grid[idx] === null && internalCandidates[idx].includes(num),
        );

        if (possibleCells.length === 1) {
          const targetIdx = possibleCells[0];
          return {
            found: true,
            type: `HIDDEN SINGLE (${name})`,
            totalSteps: 2,
            steps: [
              {
                message: `¡Es un "Hidden Single"! Revisa esta ${name}. El número ${num} solo tiene una casilla posible en sus notas.`,
                highlights: {
                  primaryCells: [],
                  secondaryCells: cellIndices,
                  focusNumber: num,
                },
              },
              {
                message: `Aunque esa celda tenga otras notas, el ${num} debe ir ahí obligatoriamente para completar la ${name}.`,
                highlights: {
                  primaryCells: [targetIdx],
                  secondaryCells: cellIndices,
                  focusNumber: num,
                },
              },
            ],
            action: {
              type: "PLACE_NUMBER",
              cells: [targetIdx],
              value: num,
            },
          };
        }
      }
    }
  }
  return null;
};
