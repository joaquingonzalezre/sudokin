// src/logic/hints/nakedSingle.ts
import { HintStrategy } from "./types";

export const findNakedSingle: HintStrategy = (grid, internalCandidates) => {
  for (let i = 0; i < 81; i++) {
    // Buscamos una celda vacía que tenga exactamente 1 solo candidato posible
    if (grid[i] === null && internalCandidates[i].length === 1) {
      const val = internalCandidates[i][0];

      return {
        found: true,
        type: "Naked Single",
        totalSteps: 2,
        steps: [
          {
            // NIVEL 1: Llamar la atención solo a la celda ganadora
            message: "Fíjate en esta cuadrilla pintada.",
            highlights: {
              primaryCells: [i],
              secondaryCells: [],
              focusNumber: null,
            },
          },
          {
            // NIVEL 2: Mostrar el candidato correcto sin iluminar el resto del tablero
            message: `Fíjate en los posibles candidatos que pueden entrar. El ${val} es el único número que puede ir aquí.`,
            highlights: {
              primaryCells: [i],
              secondaryCells: [],
              focusNumber: null, // 🛑 AQUÍ ESTÁ LA SOLUCIÓN: Al ponerlo en null, evitamos que los otros números iguales se iluminen
            },
          },
        ],
        action: { type: "PLACE_NUMBER", cells: [i], value: val },
      };
    }
  }
  return null;
};
