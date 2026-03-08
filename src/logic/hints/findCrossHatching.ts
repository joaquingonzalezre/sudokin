import { HintStrategy } from "./types";

// Retorna los 9 índices de un bloque (caja) 3x3 del 0 al 8
const getBoxIndices = (box: number) => {
    const startRow = Math.floor(box / 3) * 3;
    const startCol = (box % 3) * 3;
    return Array.from(
        { length: 9 },
        (_, i) => (startRow + Math.floor(i / 3)) * 9 + (startCol + (i % 3)),
    );
};

// Retorna los índices de una fila
const getRowIndices = (row: number) =>
    Array.from({ length: 9 }, (_, i) => row * 9 + i);

// Retorna los índices de una columna
const getColIndices = (col: number) =>
    Array.from({ length: 9 }, (_, i) => i * 9 + col);

// Retorna la fila y columna de un índice dado (0-80)
const getRowCol = (idx: number) => ({
    row: Math.floor(idx / 9),
    col: idx % 9,
});

export const findCrossHatching: HintStrategy = (grid) => {
    // Evaluamos en cada una de las 9 cajas
    for (let box = 0; box < 9; box++) {
        const boxIndices = getBoxIndices(box);

        // Evaluamos cada número del 1 al 9
        for (let num = 1; num <= 9; num++) {
            // 1. ¿El número ya está puesto en esta caja? Si es así, saltamos.
            const isAlreadyInBox = boxIndices.some((idx) => grid[idx] === num);
            if (isAlreadyInBox) continue;

            // 2. Filtramos qué celdas vacías en la caja aún pueden recibir este número.
            // Criterio de Cross-Hatching: Ver si la fila o columna de la celda es "atacada" por el número N desde otra parte.

            const unattackedCells = boxIndices.filter((idx) => {
                if (grid[idx] !== null) return false; // Celda ocupada

                const { row, col } = getRowCol(idx);

                // Revisamos si la fila cruzada desde afuera rompe esta posibilidad
                const isRowAttacked = getRowIndices(row).some((rIdx) => grid[rIdx] === num);
                if (isRowAttacked) return false;

                // Revisamos si la columna cruzada desde afuera rompe esta posibilidad
                const isColAttacked = getColIndices(col).some((cIdx) => grid[cIdx] === num);
                if (isColAttacked) return false;

                return true;
            });

            // 3. Si por el cruce de filas y columnas de OTROS bloques solo queda 1 celda sin atacar en esta caja...
            if (unattackedCells.length === 1) {
                const targetIdx = unattackedCells[0];
                const { row, col } = getRowCol(targetIdx);

                // Identifiquemos de dónde vienen los "disparos" (los números que atacan) para visualizarlos como secondaryCells
                const attackingCells: number[] = [];

                // Disparos en filas que afectaban a las OTRAS celdas vacías de esta caja
                boxIndices.forEach(idx => {
                    if (grid[idx] !== null || idx === targetIdx) return;

                    const r = Math.floor(idx / 9);
                    const c = idx % 9;

                    // Buscar el tirador en la fila
                    getRowIndices(r).forEach(rIdx => {
                        if (grid[rIdx] === num) attackingCells.push(rIdx);
                    });
                    // Buscar el tirador en la columna
                    getColIndices(c).forEach(cIdx => {
                        if (grid[cIdx] === num) attackingCells.push(cIdx);
                    });
                });

                const uniqueAttackingCells = Array.from(new Set(attackingCells));
                const blocksBoxName = `Bloque ${box + 1}`;

                return {
                    found: true,
                    type: `BARRIDO / CROSS-HATCHING (${blocksBoxName})`,
                    totalSteps: 2,
                    steps: [
                        {
                            message: `¡Es un "Barrido" o "Cross-hatching"! Mira el número ${num} resaltado. Fíjate cómo "ataca" o bloquea las otras casillas vacías de este bloque de 3x3.`,
                            highlights: {
                                primaryCells: [],
                                secondaryCells: uniqueAttackingCells,
                                focusNumber: num,
                            },
                        },
                        {
                            message: `Debido a esos cruces, el único lugar libre para poner el ${num} en este bloque es la casilla seleccionada.`,
                            highlights: {
                                primaryCells: [targetIdx],
                                secondaryCells: uniqueAttackingCells,
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

    return null;
};
