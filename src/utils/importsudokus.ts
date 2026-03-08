import { sudokusOrdenados } from "../../scripts/sudokus_ordenados";

/**
 * Consulta la base de datos global para obtener TODOS los sudokus.
 * (Ahora es local para modo estático)
 */
export const getImportedSudokusGlobal = async (): Promise<{ id: number, grid: number[] }[]> => {
  try {
    return sudokusOrdenados || [];
  } catch (error) {
    console.error("Error obteniendo los sudokus locales:", error);
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
    // Al ser offline, puedes guardarlo temporalmente si tienes LocalStorage, 
    // o ignorar por ahora si era exclusivo para llenar tu base global
    console.log("🌍 Guardado simulado. Sudoku procesado correctamente.", nuevoGrid);

  } catch (error) {
    console.error("Error guardando el sudoku (offline):", error);
  }
};
