// src/logic/hintManager.ts
import { HintResult, HintStrategy } from "./hints/types";
import { findNakedSingle } from "./hints/nakedSingle";
import { findXWing } from "./hints/xWing";
import { findHiddenSingle } from "./hints/hiddenSingle";
import { findPointingPairs } from "./hints/pointingPairs";
import { findNakedPair } from "./hints/nakedPair";
import { findHiddenPair } from "./hints/hiddenPair";

const strategies: HintStrategy[] = [
  findNakedSingle,
  findHiddenSingle,
  findPointingPairs,
  findNakedPair,
  findHiddenPair,
  findXWing,
];

export type { HintResult }; // Exportamos el nuevo tipo

export function getHint(
  grid: (number | null)[],
  internalCandidates: number[][],
  userCandidates: number[][],
): HintResult {
  for (const strategy of strategies) {
    const hint = strategy(grid, internalCandidates, userCandidates);
    if (hint) {
      return hint; // Si encuentra algo, devuelve el resultado completo
    }
  }

  // Si ninguna estrategia encuentra nada, devolvemos un HintResult de tipo "NONE"
  return {
    found: false,
    type: "NONE",
    totalSteps: 1, // Solo un mensaje final
    steps: [
      {
        message:
          "No encuentro jugadas lógicas simples. Revisa tus notas o intenta buscar patrones visualmente.",
        highlights: { primaryCells: [], secondaryCells: [], focusNumber: null },
      },
    ],
  };
}
