"use client";

import { useState, useEffect, useCallback } from "react";
import { sudokuPuzzles, SudokuGridType } from "../data/sudokuPuzzles";
import {
  CandidateGridType,
  generateEmptyCandidates,
  toggleCandidate,
  calculateAllCandidates,
} from "../logic/candidateManager";

// --- IMPORTAMOS LA NUEVA LÓGICA DE PISTAS ---
import { getHint } from "../logic/hintManager";
// --------------------------------------------

import { useGameHistory } from "../hooks/useGameHistory";
import ControlPad from "./ControlPad";

// --- ICONOS ---
const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);
const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const ReloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);
const EyeOffIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

// --- MODAL ---
const Modal = ({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      backgroundColor: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "fadeIn 0.2s ease-out",
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        width: "90%",
        maxWidth: "400px",
        textAlign: "center",
        border: "4px solid black",
      }}
    >
      {icon && (
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      )}
      <h2
        style={{
          fontSize: "32px",
          fontWeight: "900",
          marginBottom: "20px",
          color: "#111",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  </div>
);

export default function SudokuBoard() {
  const activePuzzleIndex = 0;
  const currentPuzzleData = sudokuPuzzles[activePuzzleIndex];
  const INITIAL_PUZZLE = currentPuzzleData.grid;

  const [grid, setGrid] = useState<SudokuGridType>(
    INITIAL_PUZZLE.map((n) => (n === 0 ? null : n)),
  );
  const [candidatesGrid, setCandidatesGrid] = useState<CandidateGridType>(() =>
    generateEmptyCandidates(INITIAL_PUZZLE.map((n) => (n === 0 ? null : n))),
  );

  const { saveSnapshot, undoLastMove } = useGameHistory(grid, candidatesGrid);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [inputMode, setInputMode] = useState<"normal" | "candidate">("normal");
  const [showCandidates, setShowCandidates] = useState(false);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true);

  // --- LÓGICA DE JUEGO ---
  const handleUndo = useCallback(() => {
    if (isPaused || isGameWon) return;
    const previousState = undoLastMove();
    if (previousState) {
      setGrid(previousState.grid);
      setCandidatesGrid(previousState.candidates);
    }
  }, [undoLastMove, isPaused, isGameWon]);

  const handleAutoCandidates = useCallback(() => {
    if (isPaused || isGameWon) return;
    saveSnapshot(grid, candidatesGrid);
    setCandidatesGrid(calculateAllCandidates(grid));
    setShowCandidates(true);
  }, [grid, candidatesGrid, isPaused, isGameWon, saveSnapshot]);

  const handleInput = useCallback(
    (num: number) => {
      if (isPaused || isGameWon || selectedIdx === null) return;
      if (INITIAL_PUZZLE[selectedIdx] !== 0) return;
      saveSnapshot(grid, candidatesGrid);
      if (inputMode === "normal") {
        const newGrid = [...grid];
        newGrid[selectedIdx] = num;
        setGrid(newGrid);
        const newCandidates = [...candidatesGrid];
        newCandidates[selectedIdx] = [];
        setCandidatesGrid(newCandidates);
      } else {
        if (grid[selectedIdx] === null) {
          const newCandidates = [...candidatesGrid];
          newCandidates[selectedIdx] = toggleCandidate(
            newCandidates[selectedIdx],
            num,
          );
          setCandidatesGrid(newCandidates);
          if (!showCandidates) setShowCandidates(true);
        }
      }
    },
    [
      grid,
      candidatesGrid,
      selectedIdx,
      isPaused,
      isGameWon,
      INITIAL_PUZZLE,
      inputMode,
      saveSnapshot,
      showCandidates,
    ],
  );

  const handleDelete = useCallback(() => {
    if (isPaused || isGameWon || selectedIdx === null) return;
    if (INITIAL_PUZZLE[selectedIdx] !== 0) return;
    saveSnapshot(grid, candidatesGrid);
    const newGrid = [...grid];
    newGrid[selectedIdx] = null;
    setGrid(newGrid);
  }, [
    grid,
    candidatesGrid,
    selectedIdx,
    isPaused,
    isGameWon,
    INITIAL_PUZZLE,
    saveSnapshot,
  ]);

  const handleClearCandidates = useCallback(() => {
    if (isPaused || isGameWon) return;
    saveSnapshot(grid, candidatesGrid);
    // IMPORTANTE: Usamos Array.from para resetear correctamente (referencias independientes)
    const allEmptyCandidates = Array.from({ length: 81 }, () => []);
    setCandidatesGrid(allEmptyCandidates);
  }, [grid, candidatesGrid, isPaused, isGameWon, saveSnapshot]);

  // --- CONEXIÓN DE LA LÓGICA DE PISTAS ---
  const handleHint = useCallback(() => {
    if (isPaused || isGameWon) return;

    // Llamamos a la lógica externa
    const hintMessage = getHint(grid, candidatesGrid);

    // Mostramos el diagnóstico
    alert(hintMessage);
  }, [isPaused, isGameWon, grid, candidatesGrid]);
  // ---------------------------------------

  const handlePauseToggle = () => setIsPaused(!isPaused);

  const handleRestart = () => {
    const initialCleaned = INITIAL_PUZZLE.map((n) => (n === 0 ? null : n));
    setGrid(initialCleaned);
    setCandidatesGrid(generateEmptyCandidates(initialCleaned));
    setTime(0);
    setIsPaused(false);
    setIsGameWon(false);
    setIsRunning(true);
    setSelectedIdx(null);
    setShowCandidates(false);
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAllConflicts = (currentGrid: SudokuGridType) => {
    const conflictSet = new Set<number>();
    for (let i = 0; i < 81; i++) {
      if (!currentGrid[i]) continue;
      const val = currentGrid[i];
      const row = Math.floor(i / 9);
      const col = i % 9;
      const boxRow = Math.floor(row / 3);
      const boxCol = Math.floor(col / 3);
      for (let j = 0; j < 81; j++) {
        if (i === j) continue;
        if (currentGrid[j] !== val) continue;
        const targetRow = Math.floor(j / 9);
        const targetCol = j % 9;
        if (
          row === targetRow ||
          col === targetCol ||
          (Math.floor(targetRow / 3) === boxRow &&
            Math.floor(targetCol / 3) === boxCol)
        )
          conflictSet.add(i);
      }
    }
    return conflictSet;
  };
  const conflicts = getAllConflicts(grid);

  useEffect(() => {
    const isFull = grid.every((cell) => cell !== null);
    const hasNoConflicts = conflicts.size === 0;
    if (isFull && hasNoConflicts && !isGameWon) {
      setIsGameWon(true);
      setIsRunning(false);
    }
  }, [grid, conflicts, isGameWon]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && autoPauseEnabled) setIsPaused(true);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [autoPauseEnabled]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused && !isGameWon)
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, isGameWon]);

  const handleArrowMove = useCallback(
    (key: string) => {
      if (selectedIdx === null) {
        setSelectedIdx(0);
        return;
      }
      if (key === "ArrowRight") setSelectedIdx((prev) => (prev! + 1) % 81);
      if (key === "ArrowLeft") setSelectedIdx((prev) => (prev! - 1 + 81) % 81);
      if (key === "ArrowUp") setSelectedIdx((prev) => (prev! - 9 + 81) % 81);
      if (key === "ArrowDown") setSelectedIdx((prev) => (prev! + 9) % 81);
    },
    [selectedIdx],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPaused || isGameWon) return;
      if (e.key >= "1" && e.key <= "9") handleInput(parseInt(e.key));
      if (e.key === "Backspace" || e.key === "Delete") handleDelete();
      if (e.key.startsWith("Arrow")) {
        e.preventDefault();
        handleArrowMove(e.key);
      }
      if (e.key.toLowerCase() === "c") setInputMode("candidate");
      if (e.key.toLowerCase() === "n") setInputMode("normal");
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      }
      if (e.key === " ") {
        e.preventDefault();
        setInputMode((prev) => (prev === "normal" ? "candidate" : "normal"));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleInput,
    handleDelete,
    handleUndo,
    handleArrowMove,
    isPaused,
    isGameWon,
  ]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#f0f0f0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "60px",
        }}
      >
        {/* TABLERO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, auto)",
            backgroundColor: "gray",
            gap: "4px",
            border: "4px solid black",
            userSelect: "none",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
          }}
        >
          {Array.from({ length: 9 }).map((_, blockIndex) => (
            <div
              key={blockIndex}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 60px)",
                gridTemplateRows: "repeat(3, 60px)",
                backgroundColor: "#b0b0b0",
                gap: "1px",
              }}
            >
              {Array.from({ length: 9 }).map((_, cellIndex) => {
                const globalRow =
                  Math.floor(blockIndex / 3) * 3 + Math.floor(cellIndex / 3);
                const globalCol = (blockIndex % 3) * 3 + (cellIndex % 3);
                const globalIdx = globalRow * 9 + globalCol;
                const val = grid[globalIdx];
                const isSelected = globalIdx === selectedIdx;
                const isInitial = INITIAL_PUZZLE[globalIdx] !== 0;
                const hasConflict = conflicts.has(globalIdx);
                const candidates = candidatesGrid[globalIdx];

                let isPeer = false;
                let isSameValue = false;
                if (selectedIdx !== null && !isSelected) {
                  const sRow = Math.floor(selectedIdx / 9);
                  const sCol = selectedIdx % 9;
                  const sVal = grid[selectedIdx];
                  if (
                    globalRow === sRow ||
                    globalCol === sCol ||
                    (Math.floor(globalRow / 3) === Math.floor(sRow / 3) &&
                      Math.floor(globalCol / 3) === Math.floor(sCol / 3))
                  )
                    isPeer = true;
                  if (sVal !== null && val === sVal) isSameValue = true;
                }

                // LÓGICA DE COLORES PERSONALIZADA (TU DISEÑO)
                // =========================================================================
                let bgColor = "white"; // Base

                // 1. CONFLICTO/ERROR (Siempre prioridad máxima si no es inicial)
                if (hasConflict && !isInitial) {
                  bgColor = "#ffcccc";
                }

                // 2. CELDA SELECCIONADA (fn 1 - Parte A)
                else if (isSelected) {
                  if (isInitial) {
                    bgColor = "#d48200"; // Naranja oscuro si es inicial
                  } else {
                    bgColor = "#fb9b00"; // Naranja brillante si es usuario
                  }
                }

                // 3. MISMO VALOR QUE LA SELECCIONADA (fn 1 - Parte B)
                else if (isSameValue) {
                  if (isInitial) {
                    bgColor = "#e69100"; // Naranja medio si el match es inicial
                  } else {
                    bgColor = "#fec468"; // Naranja suave si el match es usuario
                  }
                }

                // 4. VECINOS / PEERS (fn 2)
                else if (isPeer) {
                  if (isInitial) {
                    bgColor = "#d3c6af"; // Beige oscuro si es inicial
                  } else {
                    bgColor = "#f9eac2"; // Beige claro si es usuario/vacío
                  }
                }

                // 5. ESTADO BASE (Para iniciales no afectadas por selección)
                else if (isInitial) {
                  bgColor = "#dfdfdf";
                }
                // =========================================================================

                // Ajuste de contraste para el texto cuando el fondo es oscuro
                let textColor = hasConflict
                  ? "red"
                  : !isInitial
                    ? "#121212"
                    : "#121212";
                // Si la celda está seleccionada y es inicial (fondo oscuro), ponemos letra blanca para leer mejor
                if (isSelected && isInitial) textColor = "#121212";
                // Si la celda es del mismo valor inicial (fondo medio oscuro), quizás negro esté bien, o blanco.
                // Lo dejamos por defecto negro/azul salvo en selección directa.

                return (
                  <div
                    key={globalIdx}
                    onClick={() =>
                      !isPaused && !isGameWon && setSelectedIdx(globalIdx)
                    }
                    style={{
                      backgroundColor: bgColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "Arial, sans-serif",
                      fontSize: "34px",
                      fontWeight: "700",
                      color: textColor,
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    {val !== null
                      ? val
                      : showCandidates &&
                        candidates.length > 0 && (
                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              width: "100%",
                              height: "100%",
                              padding: "2px",
                            }}
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => (
                              <div
                                key={c}
                                style={{
                                  fontSize: "10px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  color: "#666",
                                  fontWeight: "normal",
                                }}
                              >
                                {candidates.includes(c) ? c : ""}
                              </div>
                            ))}
                          </div>
                        )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* PANEL DE CONTROL */}
        <div className="flex flex-col gap-4">
          <ControlPad
            onNumberClick={handleInput}
            onDeleteClick={handleDelete}
            onUndoClick={handleUndo}
            onCreateCandidates={handleAutoCandidates}
            onHintClick={handleHint}
            onClearCandidatesClick={handleClearCandidates}
            inputMode={inputMode}
            setInputMode={setInputMode}
            showCandidates={showCandidates}
            setShowCandidates={setShowCandidates}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              marginTop: "20px",
              fontFamily: "Arial, sans-serif",
              color: "#666",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "18px",
                fontWeight: "bold",
              }}
            >
              <span>{formatTime(time)}</span>
              <button
                onClick={handlePauseToggle}
                style={{
                  padding: "8px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "#e0e0e0",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Pausar Juego"
              >
                {isPaused ? <PlayIcon /> : <PauseIcon />}
              </button>

              {/* Botón Auto-Pausa */}
              <button
                onClick={() => setAutoPauseEnabled(!autoPauseEnabled)}
                style={{
                  padding: "8px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: autoPauseEnabled ? "#e0e0e0" : "#ccc",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: autoPauseEnabled ? "#333" : "#777",
                }}
                title={
                  autoPauseEnabled
                    ? "Auto-Pausa Activada"
                    : "Auto-Pausa Desactivada"
                }
              >
                {autoPauseEnabled ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>
            {conflicts.size > 0 && (
              <div style={{ color: "red", fontWeight: "bold" }}>
                ⚠️ Errores detectados
              </div>
            )}
          </div>
        </div>
      </div>

      {isPaused && !isGameWon && (
        <Modal
          title="Juego en Pausa"
          icon={
            <div style={{ transform: "scale(2)", color: "#666" }}>
              <PauseIcon />
            </div>
          }
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <p style={{ fontSize: "18px", color: "#666" }}>
              Tu tiempo actual: <strong>{formatTime(time)}</strong>
            </p>
            <button
              onClick={handlePauseToggle}
              style={{
                padding: "15px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "black",
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <PlayIcon /> Reanudar
            </button>
          </div>
        </Modal>
      )}

      {isGameWon && (
        <Modal
          title="¡Felicidades!"
          icon={<div style={{ fontSize: "60px" }}>🏆</div>}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <p style={{ fontSize: "18px", color: "#666" }}>
              ¡Has completado el Sudoku!
            </p>
            <div
              style={{
                backgroundColor: "#f0f0f0",
                padding: "15px",
                borderRadius: "10px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  color: "#666",
                  fontWeight: "bold",
                }}
              >
                Tiempo Final
              </div>
              <div
                style={{ fontSize: "40px", fontWeight: "900", color: "black" }}
              >
                {formatTime(time)}
              </div>
            </div>
            <button
              onClick={handleRestart}
              style={{
                padding: "15px",
                borderRadius: "10px",
                border: "none",
                backgroundColor: "black",
                color: "white",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <ReloadIcon /> Jugar otra vez
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
