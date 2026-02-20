// src/logic/hints/types.ts

// La instrucción visual que el tablero entiende
export interface HighlightInstruction {
  primaryCells: number[]; // Celdas clave (ej. rojo/rosa fuerte). Ej: Las celdas del X-Wing.
  secondaryCells: number[]; // Celdas de apoyo (ej. rosa claro). Ej: La fila que las conecta.
  focusNumber: number | null; // Número a resaltar (ej. todos los 5).
}

// Cada paso individual de una pista
export interface HintStep {
  message: string; // Lo que lee el usuario en este paso
  highlights: HighlightInstruction; // Qué celdas se iluminan en este paso
}

// El resultado final de una técnica
export interface HintResult {
  found: boolean;
  type: string;
  totalSteps: number;
  steps: HintStep[];
  action?: {
    // 👇 AQUÍ ESTÁ LA MAGIA: Agregamos KEEP_CANDIDATES a la lista permitida
    type: "PLACE_NUMBER" | "REMOVE_CANDIDATE" | "KEEP_CANDIDATES";

    // 👇 Asegúrate de que esto diga 'cells' (plural) y sea un array de números
    cells: number[];

    value?: number; // Opcional: Para cuando es un solo número (Naked Single)
    values?: number[]; // Opcional: Para cuando son varios números (Pairs)
  };
}

// La firma de las estrategias
export type HintStrategy = (
  grid: (number | null)[],
  internalCandidates: number[][],
  userCandidates: number[][],
) => HintResult | null;
