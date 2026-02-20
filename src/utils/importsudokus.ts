// src/utils/importsudokus.ts

// Usamos una clave específica para guardar la lista en la memoria del navegador
const STORAGE_KEY = "sudokin_imported_puzzles";

/**
 * Obtiene la lista completa de Sudokus importados previamente.
 */
export const getImportedSudokus = (): number[][] => {
  if (typeof window === "undefined") return []; // Protección para Next.js (SSR)

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error leyendo sudokus importados:", error);
    return [];
  }
};

/**
 * Verifica si el Sudoku escaneado es completamente nuevo.
 * Compara la cuadrícula actual con todas las guardadas previamente.
 */
export const esnuevoestesudoku = (nuevoGrid: number[]): boolean => {
  const sudokusGuardados = getImportedSudokus();

  // Convertimos el array a texto (ej: "0,5,3,0,0,1...") para compararlo fácilmente
  const nuevoGridString = nuevoGrid.join(",");

  // Revisamos si alguno de los guardados es exactamente igual
  const yaExiste = sudokusGuardados.some(
    (gridGuardado) => gridGuardado.join(",") === nuevoGridString,
  );

  return !yaExiste; // Es verdadero (true) si NO existe en la lista
};

/**
 * Recibe un Sudoku recién escaneado, verifica si es nuevo y lo guarda.
 */
export const guardarSudokuImportado = (nuevoGrid: number[]): void => {
  if (typeof window === "undefined") return;

  if (esnuevoestesudoku(nuevoGrid)) {
    const sudokusGuardados = getImportedSudokus();
    sudokusGuardados.push(nuevoGrid); // Añadimos el nuevo a la lista

    // Guardamos la lista actualizada
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sudokusGuardados));
    console.log(
      `💾 ¡Sudoku guardado exitosamente! Ahora tienes ${sudokusGuardados.length} importados.`,
    );
  } else {
    console.log(
      "ℹ️ Este Sudoku ya existe en tu archivo 'importsudokus'. No se duplicará.",
    );
  }
};
