// src/utils/importsudokus.ts

// 🛑 IMPORTANTE: Reemplaza esta URL por el dominio real de tu proyecto en Vercel
const BACKEND_URL = "https://tu-proyecto-sudokin.vercel.app";

/**
 * Consulta la base de datos global para obtener TODOS los sudokus.
 */
export const getImportedSudokusGlobal = async (): Promise<number[][]> => {
  try {
    // 🛑 Ahora el celular apunta directamente a Vercel
    const res = await fetch(`${BACKEND_URL}/api/sudokus`);
    const data = await res.json();
    return data.sudokus || [];
  } catch (error) {
    console.error("Error conectando con la base de datos global:", error);
    return [];
  }
};

/**
 * Envía un Sudoku recién escaneado a la API.
 */
export const guardarSudokuImportado = async (
  nuevoGrid: number[],
): Promise<void> => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/sudokus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grid: nuevoGrid }),
    });

    if (res.ok) {
      console.log(
        "🌍 Sudoku enviado a la nube. (Postgres ignorará si es duplicado).",
      );
    }
  } catch (error) {
    console.error("Error guardando en la base de datos global:", error);
  }
};
