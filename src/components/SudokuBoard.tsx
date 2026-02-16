"use client";

import { useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import { sudokuPuzzles, SudokuGridType } from "../data/sudokuPuzzles";
import {
  CandidateGridType,
  generateEmptyCandidates,
  toggleCandidate,
  calculateAllCandidates,
} from "../logic/candidateManager";
import { useGameHistory } from "../hooks/useGameHistory";
import ControlPad from "./ControlPad";

// --- ICONOS ---
const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
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
    width="24"
    height="24"
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

  // --- LÓGICA ---
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
    const newCandidates = calculateAllCandidates(grid);
    setCandidatesGrid(newCandidates);
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
      if (e.key.startsWith("Arrow")) handleArrowMove(e.key);
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
    handleArrowMove,
    handleUndo,
    isPaused,
    isGameWon,
  ]);

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
        const isSameRow = row === targetRow;
        const isSameCol = col === targetCol;
        const isSameBox =
          Math.floor(targetRow / 3) === boxRow &&
          Math.floor(targetCol / 3) === boxCol;
        if (isSameRow || isSameCol || isSameBox) conflictSet.add(i);
      }
    }
    return conflictSet;
  };
  const conflicts = getAllConflicts(grid);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused && !isGameWon) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused, isGameWon]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) setIsPaused(true);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    const isFull = grid.every((cell) => cell !== null);
    const hasNoConflicts = conflicts.size === 0;
    if (isFull && hasNoConflicts && !isGameWon) {
      setIsGameWon(true);
      setIsRunning(false);
    }
  }, [grid, conflicts, isGameWon]);

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

  let selectedRow: number | null = null;
  let selectedCol: number | null = null;
  let selectedValue: number | null = null;
  if (selectedIdx !== null) {
    selectedRow = Math.floor(selectedIdx / 9);
    selectedCol = selectedIdx % 9;
    selectedValue = grid[selectedIdx];
  }

  const Modal = ({
    title,
    children,
    icon,
  }: {
    title: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={clsx(
          "rounded-xl shadow-2xl text-center relative border-4 border-gray-900 flex flex-col justify-center items-center",
          "w-[600px] max-w-[95vw] min-h-[400px] p-8",
        )}
        style={{ backgroundColor: "#ffffff", opacity: 1 }}
      >
        {icon && <div className="mb-6 transform scale-125">{icon}</div>}
        <h2 className="text-4xl font-black text-gray-900 mb-6 uppercase tracking-widest">
          {title}
        </h2>
        <div className="w-full">{children}</div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      {/* HEADER */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 px-4">
        <h1 className="text-4xl font-black text-gray-900 font-serif tracking-tight">
          Sudokin
        </h1>
        <div className="flex items-center space-x-4 text-gray-600 font-medium">
          <span className="text-sm uppercase tracking-wider text-gray-500 hidden sm:inline">
            Dificultad: {currentPuzzleData.difficulty}
          </span>
          <div className="flex items-center space-x-2 bg-gray-200 px-3 py-1 rounded-full">
            <span className="tabular-nums w-12 text-center">
              {formatTime(time)}
            </span>
            <button
              onClick={handlePauseToggle}
              disabled={isGameWon}
              className="hover:text-black focus:outline-none transition-colors disabled:opacity-50"
              title={isPaused ? "Reanudar" : "Pausar"}
            >
              {isPaused ? <PlayIcon /> : <PauseIcon />}
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================
          LAYOUT PRINCIPAL - SOLUCIÓN "HARDCODED"
          Usamos style={{ gap: '80px' }} para forzar la separación física.
          Usamos flex-wrap para que no se compriman en pantallas pequeñas.
          =================================================================== */}
      <div
        className="flex flex-row flex-wrap items-start justify-center w-full max-w-7xl pb-8 pl-4 pr-4"
        style={{ gap: "80px" }}
      >
        {/* TABLERO (LADO IZQUIERDO) */}
        <div className="relative shadow-2xl select-none shrink-0">
          <div
            className="grid grid-cols-9 bg-white overflow-hidden"
            style={{ border: "3px solid black" }}
          >
            {grid.map((cellValue, i) => {
              const row = Math.floor(i / 9);
              const col = i % 9;
              const isInitial = INITIAL_PUZZLE[i] !== 0;
              const thinBorderRight = col !== 8 ? "1px solid #b0b0b0" : "none";
              const thinBorderBottom = row !== 8 ? "1px solid #b0b0b0" : "none";
              const isSelected = i === selectedIdx;

              let isPeer = false;
              let isSameValue = false;
              if (selectedIdx !== null && !isSelected) {
                const isSameRow = row === selectedRow;
                const isSameCol = col === selectedCol;
                const isSameBox =
                  Math.floor(row / 3) === Math.floor(selectedRow! / 3) &&
                  Math.floor(col / 3) === Math.floor(selectedCol! / 3);
                if (isSameRow || isSameCol || isSameBox) isPeer = true;
                if (selectedValue !== null && cellValue === selectedValue)
                  isSameValue = true;
              }

              let forcedBgColor = isInitial ? "#dfdfdf" : "#ffffff";
              let forcedTextColor = isInitial ? "#000000" : "#2563eb";
              if (isSelected) {
                forcedBgColor = "#d48200";
                forcedTextColor = "#ffffff";
              } else if (isSameValue) {
                forcedBgColor = "#e69100";
                forcedTextColor = "#1e3a8a";
              } else if (isPeer) {
                forcedBgColor = "#f9eac2";
              }

              const hasConflict = !isInitial && conflicts.has(i);
              const cellCandidates = candidatesGrid[i];

              return (
                <div
                  key={i}
                  onClick={() => !isPaused && !isGameWon && setSelectedIdx(i)}
                  style={{
                    backgroundColor: forcedBgColor,
                    zIndex: isSelected ? 10 : 0,
                    position: "relative",
                    borderRight: thinBorderRight,
                    borderBottom: thinBorderBottom,
                  }}
                  className={clsx(
                    "w-12 h-12 min-w-[48px] min-h-[48px]",
                    "flex items-center justify-center cursor-pointer select-none bg-clip-padding outline-none",
                    isInitial ? "font-black" : "font-bold",
                  )}
                >
                  {cellValue !== null ? (
                    <span
                      style={{
                        color: forcedTextColor,
                        fontSize: "28px",
                        lineHeight: "1",
                      }}
                      className="flex items-center justify-center w-full h-full transform translate-y-[5%]"
                    >
                      {cellValue}
                    </span>
                  ) : (
                    showCandidates && (
                      <div className="grid grid-cols-3 grid-rows-3 w-full h-full p-[2px] pointer-events-none">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                          const hasCandidate = cellCandidates.includes(num);
                          return (
                            <span
                              key={num}
                              className={clsx(
                                "flex items-center justify-center leading-none font-medium text-gray-500 text-[10px]",
                              )}
                            >
                              {hasCandidate ? num : ""}
                            </span>
                          );
                        })}
                      </div>
                    )
                  )}
                  {hasConflict && !isPaused && !isGameWon && (
                    <div
                      style={{
                        position: "absolute",
                        width: "10px",
                        height: "10px",
                        backgroundColor: "red",
                        borderRadius: "50%",
                        bottom: "2px",
                        right: "2px",
                        zIndex: 50,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Lineas gruesas del tablero */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "3px",
              backgroundColor: "#404040",
              left: "calc(33.333% - 1.5px)",
              pointerEvents: "none",
              zIndex: 40,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "3px",
              backgroundColor: "#404040",
              left: "calc(66.666% - 1.5px)",
              pointerEvents: "none",
              zIndex: 40,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "3px",
              backgroundColor: "#404040",
              top: "calc(33.333% - 1.5px)",
              pointerEvents: "none",
              zIndex: 40,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: "3px",
              backgroundColor: "#404040",
              top: "calc(66.666% - 1.5px)",
              pointerEvents: "none",
              zIndex: 40,
            }}
          />
        </div>

        {/* PANEL DE CONTROL (LADO DERECHO) */}
        {/* Aquí es donde forzamos la independencia del bloque */}
        <div className="shrink-0 flex flex-col gap-4">
          <ControlPad
            onNumberClick={handleInput}
            onDeleteClick={handleDelete}
            onCreateCandidates={handleAutoCandidates}
            onUndoClick={handleUndo}
            inputMode={inputMode}
            setInputMode={setInputMode}
            showCandidates={showCandidates}
            setShowCandidates={setShowCandidates}
          />
          <div className="mt-2 flex flex-col items-center space-y-2 text-xs text-gray-400">
            <span>Sudokin • Edición Profesional</span>
            {conflicts.size > 0 && !isGameWon && (
              <div className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full animate-pulse">
                ⚠️ Hay {conflicts.size} error{conflicts.size > 1 ? "es" : ""} en
                el tablero
              </div>
            )}
          </div>
        </div>
      </div>

      {isPaused && !isGameWon && (
        <Modal
          title="Juego en Pausa"
          icon={
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-800 shadow-sm border-2 border-gray-200">
              <PauseIcon />
            </div>
          }
        >
          <div className="space-y-6">
            <p className="text-gray-500 font-medium text-lg">
              Tu tiempo actual es:
              <br />
              <span className="text-gray-900 font-black text-3xl">
                {formatTime(time)}
              </span>
            </p>
            <button
              onClick={handlePauseToggle}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-xl hover:bg-gray-800 transition-transform active:scale-[0.98] shadow-lg flex items-center justify-center space-x-2"
            >
              <PlayIcon />
              <span>Reanudar Partida</span>
            </button>
          </div>
        </Modal>
      )}

      {isGameWon && (
        <Modal
          title="¡Felicidades!"
          icon={<div className="text-7xl mb-2">🏆</div>}
        >
          <div className="space-y-6">
            <p className="text-gray-600 text-lg">
              Has completado el Sudoku correctamente.
            </p>
            <div className="bg-gray-50 py-4 px-6 rounded-xl border-2 border-gray-100 inline-block w-full">
              <span className="text-gray-500 text-sm uppercase tracking-wider font-bold">
                Tiempo final
              </span>
              <br />
              <span className="font-black text-5xl text-gray-900 tracking-tight">
                {formatTime(time)}
              </span>
            </div>
            <button
              onClick={handleRestart}
              className="w-full bg-black text-white py-4 rounded-xl font-bold text-xl hover:bg-gray-800 transition-transform active:scale-[0.98] shadow-lg flex items-center justify-center space-x-2"
            >
              <ReloadIcon />
              <span>Jugar otra vez</span>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
