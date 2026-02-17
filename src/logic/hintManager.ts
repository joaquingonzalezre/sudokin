// src/logic/hintManager.ts

import { SudokuGridType } from "../data/sudokuPuzzles";
import { CandidateGridType } from "./candidateManager";

/**
 * Función principal que orquesta la búsqueda de pistas.
 * Recibe el estado actual del juego y devuelve una sugerencia o acción.
 */
export const getHint = (
  grid: SudokuGridType,
  candidates: CandidateGridType,
): string => {
  // 1. Análisis Básico de Datos (Diagnostic Test)

  // Contar celdas vacías
  const emptyCells = grid.filter((cell) => cell === null).length;

  // Contar cuántos candidatos hay anotados en total
  const totalCandidates = candidates.reduce(
    (acc, cellCandidates) => acc + cellCandidates.length,
    0,
  );

  // Buscar si hay alguna celda con un solo candidato (Naked Single)
  // Esto es una lógica real de Sudoku muy básica
  let singleCandidateMsg = "";
  const singleCandidateIdx = candidates.findIndex(
    (c) => c.length === 1 && grid[candidates.indexOf(c)] === null,
  );

  if (singleCandidateIdx !== -1) {
    const row = Math.floor(singleCandidateIdx / 9);
    const col = singleCandidateIdx % 9;
    const val = candidates[singleCandidateIdx][0];
    singleCandidateMsg = `\n¡Pista Real!: En la fila ${row + 1}, columna ${col + 1} solo puede ir el número ${val}.`;
  }

  // Retornamos un string de prueba para confirmar que recibimos los datos
  return `Conexión Exitosa con el Módulo de Pistas.
  - Celdas vacías restantes: ${emptyCells}
  - Total de notas anotadas: ${totalCandidates}
  ${singleCandidateMsg || "- No se detectaron 'Naked Singles' obvios en las notas actuales."}`;
};
