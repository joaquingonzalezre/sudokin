import { useState, useCallback } from "react";
import { SudokuGridType } from "../data/sudokuPuzzles";
import { CandidateGridType } from "../logic/candidateManager";

interface GameStateSnapshot {
  grid: SudokuGridType;
  candidates: CandidateGridType;
}

export function useGameHistory(
  initialGrid: SudokuGridType,
  initialCandidates: CandidateGridType,
) {
  const [history, setHistory] = useState<GameStateSnapshot[]>([]);

  // Guardar una foto del estado actual
  const saveSnapshot = useCallback(
    (currentGrid: SudokuGridType, currentCandidates: CandidateGridType) => {
      const gridCopy = [...currentGrid];
      const candidatesCopy = currentCandidates.map((c) => [...c]); // Copia profunda
      setHistory((prev) => [
        ...prev,
        { grid: gridCopy, candidates: candidatesCopy },
      ]);
    },
    [],
  );

  // Volver al estado anterior
  const undoLastMove = useCallback((): GameStateSnapshot | null => {
    if (history.length === 0) return null;

    const lastSnapshot = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1)); // Eliminar el último de la pila

    return lastSnapshot;
  }, [history]);

  return {
    saveSnapshot,
    undoLastMove,
    canUndo: history.length > 0,
  };
}
