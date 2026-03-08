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
import { findXYChain } from "./hints/xyChain";
import { findCrossHatching } from "./hints/findCrossHatching";

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
  findXYChain, // Nivel 11 Maestro
];

export type { HintResult }; // Exportamos el nuevo tipo

export const getHint = (
  grid: (number | null)[],
  internalCandidates: number[][],
  userCandidates?: number[][],
  isAiNotesActive: boolean = true
) => {
  // 1. Abrimos un grupo en la consola para agrupar todo este análisis
  console.groupCollapsed("🧠 [MOTOR DE IA] Análisis de Sudoku Iniciado");

  const candidatesToUse = isAiNotesActive ? internalCandidates : (userCandidates || internalCandidates);

  let activeStrategies = strategies;

  if (!isAiNotesActive) {
    activeStrategies = [
      findCrossHatching, // 🥇 Nivel 0 (Especial usuario): Deducción visual pura 3x3 sin notas.
      findHiddenSingle,
      findNakedSingle,
      findNakedPair,
      findHiddenPair,
      findPointingPairs,
      findNakedTriple,
      findHiddenTriple,
      findXWing,
      findYWing,
      findSwordfish,
      findXYChain,
    ];
  }

  // 2. Recorremos las estrategias usando un índice para saber el "Nivel"
  for (let i = 0; i < activeStrategies.length; i++) {
    const strategy = activeStrategies[i];
    const nivel = i + 1; // Para que empiece en Nivel 1 en vez de 0

    console.log(`🔎 [Nivel ${nivel}] Evaluando técnica: ${strategy.name}...`);

    try {
      const result = strategy(grid, internalCandidates, candidatesToUse);

      if (result) {
        // 3. Si encuentra algo, cerramos el ciclo con un mensaje de ÉXITO
        console.log(
          `✅ ¡BINGO! La IA eligió el Nivel ${nivel}: ${result.type}`,
        );
        console.log("👉 Acción que enviará al tablero:", result.action);
        console.groupEnd(); // Cerramos el grupo de la consola
        return result;
      } else {
        // 4. Si no encuentra nada, lo reportamos y seguimos
        console.log(
          `❌ ${strategy.name} descartada. No se encontró el patrón.`,
        );
      }
    } catch (error) {
      console.error(
        `💥 ERROR CRÍTICO en Nivel ${nivel} (${strategy.name}):`,
        error,
      );
    }
  }

  // 5. Si pasamos por los 10 niveles y ninguno devolvió nada
  console.warn(
    "🛑 LA IA SE RINDIÓ: Ninguna de las lógicas encontró una jugada.",
  );
  console.groupEnd(); // Cerramos el grupo de la consola

  return {
    found: false,
    type: "Ninguna",
    totalSteps: 0,
    steps: [],
  };
};
