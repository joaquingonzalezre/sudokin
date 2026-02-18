// src/logic/hints/types.ts

export type HintLevel = 1 | 2 | 3 | 4 | 5;

export interface HintData {
  type: string;
  cellIdx: number | null;
  value: number | null;
  candidates: number[];
  levels: Record<HintLevel, string>;
}

// AQUÍ ESTÁ LA SOLUCIÓN:
// Actualizamos la definición para que acepte los 3 argumentos
export type HintStrategy = (
  grid: (number | null)[], // 1. El tablero con números grandes
  internalCandidates: number[][], // 2. La lógica matemática pura
  userCandidates: number[][], // 3. Las notas visuales del usuario
) => HintData | null;
