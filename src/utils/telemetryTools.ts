// src/utils/telemetryTools.ts

// 🛑 LA BRÚJULA: Apuntamos al servidor real de Vercel, no al localhost del teléfono
const BACKEND_URL = "https://sudokin.vercel.app";

export interface TelemetryStats {
  puzzle: number[];
  historyCount: Record<string, number>;
  totalSteps: number;
  calculatedDifficulty: string;
}

export const analyzeTelemetry = (
  initialPuzzle: number[],
  hintHistory: string[],
): TelemetryStats => {
  const stats: Record<string, number> = {};

  // 1. Limpiar y contar las lógicas usadas
  hintHistory.forEach((step) => {
    // Convierte "HIDDEN SINGLE (Fila)" en "HIDDEN SINGLE"
    const cleanName = step.split("(")[0].trim().toUpperCase();
    stats[cleanName] = (stats[cleanName] || 0) + 1;
  });

  // 2. Algoritmo de Dificultad Basado en Pesos
  let difficulty = "Fácil";

  if (stats["POINTING PAIRS"]) difficulty = "Intermedio";
  if (stats["NAKED PAIR"] || stats["HIDDEN PAIR"]) difficulty = "Difícil";
  if (stats["X-WING"] || stats["Y-WING"] || stats["SWORDFISH"])
    difficulty = "Experto";

  return {
    puzzle: initialPuzzle,
    historyCount: stats,
    totalSteps: hintHistory.length,
    calculatedDifficulty: difficulty,
  };
};

/**
 * Función para enviar desde el celular a tu API de Vercel
 */
export const saveTelemetryToDB = async (telemetryData: TelemetryStats) => {
  try {
    // 🛑 USAMOS BACKEND_URL PARA SALIR DEL CELULAR E IR A INTERNET
    const res = await fetch(`${BACKEND_URL}/api/telemetry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(telemetryData),
    });

    if (res.ok) {
      console.log("🌍 Telemetría enviada a la nube exitosamente.");
    } else {
      console.warn("⚠️ El servidor recibió la petición pero hubo un error.");
    }
  } catch (error) {
    console.error("❌ Error de red al enviar telemetría:", error);
  }
};
