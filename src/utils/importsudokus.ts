// src/utils/importsudokus.ts

/**
 * Consulta la base de datos de Vercel para obtener TODOS los sudokus de la comunidad.
 */
export const getImportedSudokusGlobal = async (): Promise<number[][]> => {
  try {
    const res = await fetch("/api/sudokus");
    const data = await res.json();
    return data.sudokus || [];
  } catch (error) {
    console.error("Error conectando con la base de datos global:", error);
    return [];
  }
};

/**
 * Envía un Sudoku recién escaneado a la API.
 * La base de datos (Postgres) se encarga de rechazarlo si ya existe.
 */
export const guardarSudokuImportado = async (
  nuevoGrid: number[],
): Promise<void> => {
  try {
    const res = await fetch("/api/sudokus", {
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
