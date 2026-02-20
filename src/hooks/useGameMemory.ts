// src/hooks/useGameMemory.ts
import { useEffect, useRef } from "react";

// Definimos qué datos necesita recibir nuestro Hook
interface MemoryProps {
  initialPuzzle: number[];
  setInitialPuzzle: (p: number[]) => void;
  grid: (number | null)[];
  setGrid: (g: (number | null)[]) => void;
  candidatesGrid: number[][];
  setCandidatesGrid: (c: number[][]) => void;
  time: number;
  setTime: (t: number) => void;
  setIsRunning: (r: boolean) => void;
  autoPauseEnabled: boolean;
  setAutoPauseEnabled: (p: boolean) => void;
  isSmartNotes: boolean;
  setIsSmartNotes: (s: boolean) => void;
  showCandidates: boolean;
  setShowCandidates: (s: boolean) => void;
}

export const useGameMemory = ({
  initialPuzzle,
  setInitialPuzzle,
  grid,
  setGrid,
  candidatesGrid,
  setCandidatesGrid,
  time,
  setTime,
  setIsRunning,
  autoPauseEnabled,
  setAutoPauseEnabled,
  isSmartNotes,
  setIsSmartNotes,
  showCandidates,
  setShowCandidates,
}: MemoryProps) => {
  // Usamos esto para evitar guardar los valores por defecto antes de cargar la partida
  const hasLoaded = useRef(false);

  // 1. CARGAR DATOS AL INICIAR
  useEffect(() => {
    try {
      // Recuperar Preferencias
      const savedAutoPause = localStorage.getItem("sudokin_autoPause");
      if (savedAutoPause !== null)
        setAutoPauseEnabled(JSON.parse(savedAutoPause));

      const savedSmartNotes = localStorage.getItem("sudokin_smartNotes");
      if (savedSmartNotes !== null)
        setIsSmartNotes(JSON.parse(savedSmartNotes));

      const savedShowNotes = localStorage.getItem("sudokin_showNotes");
      if (savedShowNotes !== null)
        setShowCandidates(JSON.parse(savedShowNotes));

      // Recuperar Progreso del Juego
      const savedInitial = localStorage.getItem("sudokin_initialPuzzle");
      const savedGrid = localStorage.getItem("sudokin_grid");
      const savedCandidates = localStorage.getItem("sudokin_candidates");
      const savedTime = localStorage.getItem("sudokin_time");

      // Si hay un juego guardado, lo restauramos
      if (savedInitial && savedGrid && savedCandidates) {
        setInitialPuzzle(JSON.parse(savedInitial));
        setGrid(JSON.parse(savedGrid));
        setCandidatesGrid(JSON.parse(savedCandidates));

        if (savedTime) setTime(JSON.parse(savedTime));
        setIsRunning(true);
      }
    } catch (error) {
      console.error("Error cargando la memoria:", error);
    } finally {
      hasLoaded.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo se ejecuta al abrir la página

  // 2. GUARDAR PREFERENCIAS AL CAMBIAR
  useEffect(() => {
    if (!hasLoaded.current) return;
    localStorage.setItem("sudokin_autoPause", JSON.stringify(autoPauseEnabled));
    localStorage.setItem("sudokin_smartNotes", JSON.stringify(isSmartNotes));
    localStorage.setItem("sudokin_showNotes", JSON.stringify(showCandidates));
  }, [autoPauseEnabled, isSmartNotes, showCandidates]);

  // 3. GUARDAR PROGRESO AL HACER MOVIMIENTOS
  useEffect(() => {
    if (!hasLoaded.current) return;

    // Solo guardamos si hay un juego activo (si no está todo en ceros)
    const isGameActive = initialPuzzle.some((n) => n !== 0);
    if (isGameActive) {
      localStorage.setItem(
        "sudokin_initialPuzzle",
        JSON.stringify(initialPuzzle),
      );
      localStorage.setItem("sudokin_grid", JSON.stringify(grid));
      localStorage.setItem(
        "sudokin_candidates",
        JSON.stringify(candidatesGrid),
      );
      localStorage.setItem("sudokin_time", JSON.stringify(time));
    }
  }, [initialPuzzle, grid, candidatesGrid, time]);
};
