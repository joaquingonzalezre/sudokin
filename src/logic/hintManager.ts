import { SudokuGridType } from "../data/sudokuPuzzles";
import { CandidateGridType, calculateAllCandidates } from "./candidateManager"; // Importamos la calculadora

export const getHint = (
  grid: SudokuGridType,
  userCandidates: CandidateGridType, // Estas son las notas visuales (sucias)
): string => {
  // PASO 1: GENERAR LA "MATRIZ DE LA VERDAD" (Cálculo Bajo Demanda)
  // Esta matriz es pura y perfecta matemáticamente. Ignora los errores del usuario.
  const trueCandidates = calculateAllCandidates(grid);

  // -----------------------------------------------------------------------
  // NIVEL 1: ANÁLISIS DE ERRORES DE NOTAS (Limpieza)
  // Antes de dar una pista, verificamos si el usuario tiene notas imposibles.
  // -----------------------------------------------------------------------
  for (let i = 0; i < 81; i++) {
    // Si el usuario tiene notas en esta celda
    if (userCandidates[i].length > 0) {
      // Verificamos cada nota del usuario contra la verdad matemática
      for (const userNote of userCandidates[i]) {
        if (!trueCandidates[i].includes(userNote)) {
          const row = Math.floor(i / 9) + 1;
          const col = (i % 9) + 1;
          return `⚠️ Error en tus notas:\nEn la Fila ${row}, Columna ${col}, tienes marcado el ${userNote}, pero eso es imposible según las reglas del Sudoku.\n\n¡Bórralo antes de continuar!`;
        }
      }
    }
  }

  // -----------------------------------------------------------------------
  // NIVEL 2: BÚSQUEDA DE PISTAS (Usando la Matriz de Verdad)
  // Ahora buscamos la jugada lógica basándonos en la matemática, no en el dibujo.
  // -----------------------------------------------------------------------

  // Buscar Naked Single (Solo 1 posibilidad real)
  const nakedSingleIdx = trueCandidates.findIndex(
    (c, idx) => c.length === 1 && grid[idx] === null,
  );

  if (nakedSingleIdx !== -1) {
    const row = Math.floor(nakedSingleIdx / 9) + 1;
    const col = (nakedSingleIdx % 9) + 1;
    const val = trueCandidates[nakedSingleIdx][0];

    // Verificamos si el usuario YA vio esta pista o no
    const userHasItMarked = userCandidates[nakedSingleIdx].includes(val);

    if (userHasItMarked) {
      return `💡 ¡Ya lo tienes casi!\nEn la Fila ${row}, Columna ${col}, tus propias notas dicen que el ${val} es posible.\nDe hecho... ¡es el único número posible ahí!`;
    } else {
      return `💡 Pista Lógica:\nFíjate en la Fila ${row}, Columna ${col}.\nSi analizas las filas y columnas vecinas, verás que solo el ${val} puede ir ahí.`;
    }
  }

  // Si no hay Naked Singles, aquí irían algoritmos más complejos (Hidden Singles, Pairs, etc.)
  // usando siempre 'trueCandidates'.

  return "🤔 El tablero está difícil. No veo 'Naked Singles' obvios. Intenta usar la técnica de 'Auto Notas' para ver todas las posibilidades reales.";
};
