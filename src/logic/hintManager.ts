// src/logic/hintManager.ts
import { HintResult, HintStrategy } from "./hints/types";
import { findNakedSingle } from "./hints/nakedSingle";
import { findHiddenSingle } from "./hints/hiddenSingle";
import { findPointingPairs } from "./hints/pointingPairs";
import { findNakedPair } from "./hints/nakedPair";
import { findHiddenPair } from "./hints/hiddenPair";
import { findXWing } from "./hints/xWing";
import { findHiddenTriple } from "./hints/hiddenTriple";
import { findNakedTriple } from "./hints/nakedTriple";
import { findYWing } from "./hints/yWing";
import { findSwordfish } from "./hints/swordfish";
const strategies: HintStrategy[] = [
  findHiddenSingle, // Nivel 1: Básico (El número solo puede ir en 1 celda de la Fila/Col/Caja)
  findNakedSingle, // Nivel 2:  básico (Falta 1 número en la celda)
  findNakedPair, // Nivel 3: Intermedio (Pares descubiertos)
  findHiddenPair, // Nivel 4: Intermedio (Pares ocultos)
  findPointingPairs, // Nivel 5: Intermedio-Alto (Intersecciones que limpian líneas)
  findNakedTriple, // Nivel 6: Avanzado (Tríos descubiertos)
  findHiddenTriple, // Nivel 7: Avanzado (Tríos ocultos)
  findXWing, // Nivel 8: Experto (Rectángulos 2x2)
  findYWing, // Nivel 9: Experto (Bisagras y Pinzas)
  findSwordfish, // Nivel 10: Maestro (Cuadrículas 3x3)
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
