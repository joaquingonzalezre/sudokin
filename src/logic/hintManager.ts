import { HintData, HintStrategy } from "./hints/types";
import { findNakedSingle } from "./hints/nakedSingle";
import { findHiddenSingle } from "./hints/hiddenSingle";
import { findPointingPairs } from "./hints/pointingPairs";
import { findNakedPair } from "./hints/nakedPair";
import { findHiddenPair } from "./hints/hiddenPair";
import { findXWing } from "./hints/xWing";

const strategies: HintStrategy[] = [
  findNakedSingle,
  findHiddenSingle,
  findPointingPairs,
  findNakedPair,
  findHiddenPair,
  findXWing,
];

export type { HintData };

// CAMBIO 1: La función ahora acepta el tercer argumento
export function getHint(
  grid: (number | null)[],
  internalCandidates: number[][],
  userCandidates: number[][], // <--- AGREGADO
): HintData {
  for (const strategy of strategies) {
    // CAMBIO 2: Pasamos los 3 argumentos a la estrategia
    const hint = strategy(grid, internalCandidates, userCandidates);
    if (hint) {
      return hint;
    }
  }

  return {
    type: "none",
    cellIdx: null,
    value: null,
    candidates: [],
    levels: {
      1: "No veo jugadas lógicas simples disponibles.",
      2: "Intenta revisar tus notas o llenar más candidatos.",
      3: "Asegúrate de haber calculado todos los candidatos posibles (Auto Notas).",
      4: "Si ya revisaste todo, verifica que no haya errores previos en el tablero.",
      5: "Lo siento, no encuentro el siguiente paso lógico con las técnicas actuales.",
    },
  };
}
