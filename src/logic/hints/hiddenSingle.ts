import { HintStrategy } from "./types";

// --- FUNCIONES AUXILIARES PARA OBTENER ÍNDICES ---
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

export const findHiddenSingle: HintStrategy = (grid, candidates) => {
  // Vamos a buscar en los 3 tipos de unidades: 9 Filas, 9 Columnas, 9 Cajas
  const units = [
    { name: "Fila", getter: getRowIndices },
    { name: "Columna", getter: getColIndices },
    { name: "Caja", getter: getBoxIndices },
  ];

  // 1. Iteramos por tipo de unidad (Fila -> Columna -> Caja)
  for (const { name, getter } of units) {
    // 2. Iteramos las 9 unidades de ese tipo (ej: Fila 0 a Fila 8)
    for (let u = 0; u < 9; u++) {
      const cellIndices = getter(u);

      // 3. Probamos cada número del 1 al 9
      for (let num = 1; num <= 9; num++) {
        // Buscamos en cuántas celdas DE ESTA UNIDAD aparece 'num' como candidato
        // (Solo consideramos celdas vacías, grid[idx] === null)
        const possibleCells = cellIndices.filter(
          (idx) => grid[idx] === null && candidates[idx].includes(num),
        );

        // ¡EUREKA! Si solo aparece en UNA celda, es un Hidden Single
        if (possibleCells.length === 1) {
          const targetIdx = possibleCells[0];
          const row = Math.floor(targetIdx / 9) + 1;
          const col = (targetIdx % 9) + 1;

          return {
            type: "Hidden Single",
            cellIdx: targetIdx,
            value: num,
            candidates: [num], // Aunque tenga más candidatos, este es el único válido
            levels: {
              1: `Hay un número que solo tiene una ubicación posible dentro de su ${name}.`,
              2: `Revisa la ${name} ${u + 1}. Hay un número que no cabe en ningún otro lado.`,
              3: `Fíjate en el número ${num}. Dentro de la ${name} ${u + 1}, solo puede ir en una celda.`,
              4: `Aunque esta celda tenga otras notas, es la ÚNICA de la ${name} que puede contener el ${num}.`,
              5: `¡Es un "Hidden Single"! El ${num} debe ir aquí obligatoriamente para completar la ${name}.`,
            },
          };
        }
      }
    }
  }

  return null;
};
