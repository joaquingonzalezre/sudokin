"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { sudokuPuzzles, SudokuGridType } from "../data/sudokuPuzzles";
import {
  CandidateGridType,
  generateEmptyCandidates,
  toggleCandidate,
  calculateAllCandidates,
} from "../logic/candidateManager";
import { getHint, HintData } from "../logic/hintManager";
import { useGameHistory } from "../hooks/useGameHistory";
import ControlPad from "./ControlPad";
import { scanSudokuImage, ScanResponse } from "../actions/solveSudokuFromImage";

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
const CameraIcon = () => (
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
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
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

type VisualHintType = {
  mode: "none" | "row" | "col" | "box" | "cell" | "value";
  indexOrValue: number | null;
};

const sliceImageInto9 = (file: File): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const pieces: string[] = [];
        // Cortamos un poquito más grande para que se vean los bordes negros (overlap)
        const w = img.width / 3;
        const h = img.height / 3;

        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              // 1. Dibujar la imagen del sector
              ctx.drawImage(img, col * w, row * h, w, h, 0, 0, w, h);

              // 2. DIBUJAR GUÍAS VISUALES (La Magia) 🪄
              // Dibujamos líneas semitransparentes para dividir este sector de 3x3 en 9 celdas
              ctx.strokeStyle = "rgba(255, 0, 0, 0.5)"; // Líneas Rojas
              ctx.lineWidth = Math.max(2, w / 100); // Grosor dinámico

              // Líneas Verticales (a 1/3 y 2/3 del ancho)
              ctx.beginPath();
              ctx.moveTo(w / 3, 0);
              ctx.lineTo(w / 3, h);
              ctx.moveTo((w / 3) * 2, 0);
              ctx.lineTo((w / 3) * 2, h);
              ctx.stroke();

              // Líneas Horizontales (a 1/3 y 2/3 del alto)
              ctx.beginPath();
              ctx.moveTo(0, h / 3);
              ctx.lineTo(w, h / 3);
              ctx.moveTo(0, (h / 3) * 2);
              ctx.lineTo(w, (h / 3) * 2);
              ctx.stroke();

              pieces.push(canvas.toDataURL("image/jpeg", 0.9));
            }
          }
        }
        resolve(pieces);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function SudokuBoard() {
  const activePuzzleIndex = 0;
  const currentPuzzleData = sudokuPuzzles[activePuzzleIndex];

  const [initialPuzzle, setInitialPuzzle] = useState<number[]>(
    currentPuzzleData.grid,
  );
  const [grid, setGrid] = useState<SudokuGridType>(
    initialPuzzle.map((n) => (n === 0 ? null : n)),
  );
  const [candidatesGrid, setCandidatesGrid] = useState<CandidateGridType>(() =>
    generateEmptyCandidates(initialPuzzle.map((n) => (n === 0 ? null : n))),
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
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hintTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [hintState, setHintState] = useState<{
    active: boolean;
    level: number;
    data: HintData | null;
  }>({ active: false, level: 0, data: null });
  const [visualHint, setVisualHint] = useState<VisualHintType>({
    mode: "none",
    indexOrValue: null,
  });

  const triggerVisualHint = (
    mode: VisualHintType["mode"],
    indexOrValue: number,
  ) => {
    if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    setVisualHint({ mode, indexOrValue });
    hintTimeoutRef.current = setTimeout(() => {
      setVisualHint({ mode: "none", indexOrValue: null });
    }, 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setIsPaused(true);

    try {
      // 1. CORTAMOS LA IMAGEN EN 9 PARTES (Estrategia 3x3)
      console.log("✂️ Cortando imagen en 9 sectores...");
      const pieces = await sliceImageInto9(file);

      // 2. ENVIAMOS LAS 9 PIEZAS AL SERVIDOR
      const result: ScanResponse = await scanSudokuImage(pieces);

      if (result.success) {
        const newPuzzleNumbers = result.grid;
        setInitialPuzzle(newPuzzleNumbers);
        const newGrid = newPuzzleNumbers.map((n: number) =>
          n === 0 ? null : n,
        );
        setGrid(newGrid);
        setCandidatesGrid(generateEmptyCandidates(newGrid));
        setTime(0);
        setHintState({ active: false, level: 0, data: null });
        setIsGameWon(false);
        setVisualHint({ mode: "none", indexOrValue: null });
        alert("¡Sudoku escaneado con éxito!");
      } else {
        console.error("Server Error:", result.error);
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Client Error:", error);
      alert("Ocurrió un error inesperado.");
    } finally {
      setIsScanning(false);
      setIsPaused(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // --- RESTO DE FUNCIONES DEL JUEGO (Sin cambios) ---
  const handleUndo = useCallback(() => {
    if (isPaused || isGameWon) return;
    const previousState = undoLastMove();
    if (previousState) {
      setGrid(previousState.grid);
      setCandidatesGrid(previousState.candidates);
      setHintState({ active: false, level: 0, data: null });
      setVisualHint({ mode: "none", indexOrValue: null });
    }
  }, [undoLastMove, isPaused, isGameWon]);

  const handleAutoCandidates = useCallback(() => {
    if (isPaused || isGameWon) return;
    saveSnapshot(grid, candidatesGrid);
    setCandidatesGrid(calculateAllCandidates(grid));
    setShowCandidates(true);
    setHintState({ active: false, level: 0, data: null });
  }, [grid, candidatesGrid, isPaused, isGameWon, saveSnapshot]);

  const handleInput = useCallback(
    (num: number) => {
      if (isPaused || isGameWon || selectedIdx === null) return;
      if (initialPuzzle[selectedIdx] !== 0) return;
      saveSnapshot(grid, candidatesGrid);
      setHintState({ active: false, level: 0, data: null });
      setVisualHint({ mode: "none", indexOrValue: null });
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
      initialPuzzle,
      inputMode,
      saveSnapshot,
      showCandidates,
    ],
  );

  const handleDelete = useCallback(() => {
    if (isPaused || isGameWon || selectedIdx === null) return;
    if (initialPuzzle[selectedIdx] !== 0) return;
    saveSnapshot(grid, candidatesGrid);
    setHintState({ active: false, level: 0, data: null });
    setVisualHint({ mode: "none", indexOrValue: null });
    const newGrid = [...grid];
    newGrid[selectedIdx] = null;
    setGrid(newGrid);
  }, [
    grid,
    candidatesGrid,
    selectedIdx,
    isPaused,
    isGameWon,
    initialPuzzle,
    saveSnapshot,
  ]);

  const handleClearCandidates = useCallback(() => {
    if (isPaused || isGameWon) return;
    saveSnapshot(grid, candidatesGrid);
    setCandidatesGrid(Array.from({ length: 81 }, () => []));
    setHintState({ active: false, level: 0, data: null });
  }, [grid, candidatesGrid, isPaused, isGameWon, saveSnapshot]);

  const handlePauseToggle = () => setIsPaused(!isPaused);

  const handleRestart = () => {
    const initialCleaned = initialPuzzle.map((n) => (n === 0 ? null : n));
    setGrid(initialCleaned);
    setCandidatesGrid(generateEmptyCandidates(initialCleaned));
    setTime(0);
    setIsPaused(false);
    setIsGameWon(false);
    setIsRunning(true);
    setSelectedIdx(null);
    setShowCandidates(false);
    setHintState({ active: false, level: 0, data: null });
    setVisualHint({ mode: "none", indexOrValue: null });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleHint = useCallback(() => {
    if (isPaused || isGameWon) return;
    let currentData = hintState.data;
    let nextLevel = hintState.level + 1;
    if (!hintState.active || !currentData) {
      currentData = getHint(grid, candidatesGrid);
      nextLevel = 1;
      if (currentData.type === "none") {
        alert("🤔 No veo jugadas lógicas.");
        return;
      }
      if (currentData.type === "error") {
        alert(`⚠️ ERROR: ${currentData.levels[1]}`);
        return;
      }
      setHintState({ active: true, level: 1, data: currentData });
    } else {
      if (nextLevel > 5) {
        alert("💡 ¡Esa fue la última pista!");
        setHintState({ active: false, level: 0, data: null });
        setVisualHint({ mode: "none", indexOrValue: null });
        return;
      }
      setHintState((prev) => ({ ...prev, level: nextLevel }));
    }
    if (currentData.cellIdx !== null && currentData.value !== null) {
      const rowIdx = Math.floor(currentData.cellIdx / 9);
      const colIdx = currentData.cellIdx % 9;
      const boxRow = Math.floor(rowIdx / 3);
      const boxCol = Math.floor(colIdx / 3);
      switch (nextLevel) {
        case 1:
          triggerVisualHint("value", currentData.value);
          break;
        case 2:
          triggerVisualHint("row", rowIdx);
          break;
        case 3:
          triggerVisualHint("box", boxRow * 3 + boxCol);
          break;
        case 4:
          triggerVisualHint("cell", currentData.cellIdx);
          setSelectedIdx(currentData.cellIdx);
          break;
        case 5:
          triggerVisualHint("cell", currentData.cellIdx);
          break;
      }
    }
  }, [isPaused, isGameWon, grid, candidatesGrid, hintState]);

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
    if (isFull && conflicts.size === 0 && !isGameWon) {
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
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />
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
                const isInitial = initialPuzzle[globalIdx] !== 0;
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
                let bgColor = "white";
                let isVisualHintActive = false;
                if (visualHint.mode !== "none") {
                  if (
                    visualHint.mode === "cell" &&
                    visualHint.indexOrValue === globalIdx
                  )
                    isVisualHintActive = true;
                  else if (
                    visualHint.mode === "row" &&
                    visualHint.indexOrValue === globalRow
                  )
                    isVisualHintActive = true;
                  else if (
                    visualHint.mode === "col" &&
                    visualHint.indexOrValue === globalCol
                  )
                    isVisualHintActive = true;
                  else if (visualHint.mode === "box") {
                    if (
                      visualHint.indexOrValue ===
                      Math.floor(globalRow / 3) * 3 + Math.floor(globalCol / 3)
                    )
                      isVisualHintActive = true;
                  } else if (visualHint.mode === "value") {
                    if (val === visualHint.indexOrValue)
                      isVisualHintActive = true;
                  }
                }
                if (isVisualHintActive) bgColor = "#f9a8d4";
                else if (hasConflict && !isInitial) bgColor = "#ffcccc";
                else if (isSelected)
                  bgColor = val !== null ? "#fbbf24" : "#bbdefb";
                else if (isSameValue) bgColor = "#fbbf24";
                else if (isPeer) bgColor = isInitial ? "#c8d6e5" : "#f1f5f9";
                else if (isInitial) bgColor = "#e0e0e0";

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
                      color: hasConflict
                        ? "red"
                        : !isInitial
                          ? "#2563eb"
                          : "#121212",
                      cursor: "pointer",
                      position: "relative",
                      transition: "background-color 0.2s",
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

          <div className="flex flex-col items-center gap-4 mt-5 font-sans text-gray-500">
            <div className="flex items-center gap-3 text-lg font-bold">
              <span>{formatTime(time)}</span>
              <button
                onClick={handlePauseToggle}
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
              >
                {isPaused ? <PlayIcon /> : <PauseIcon />}
              </button>
              <button
                onClick={() => setAutoPauseEnabled(!autoPauseEnabled)}
                className={`p-2 rounded-full ${autoPauseEnabled ? "bg-gray-200" : "bg-gray-400"}`}
              >
                {autoPauseEnabled ? <EyeIcon /> : <EyeOffIcon />}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-full ${isScanning ? "bg-yellow-300 animate-pulse" : "bg-gray-200"}`}
                disabled={isScanning}
                title="Escanear Sudoku"
              >
                <CameraIcon />
              </button>
            </div>

            {/* SECCIÓN DE HINT */}
            {hintState.active && (
              <div className="mt-2 mx-auto w-full max-w-[320px] text-center animate-in fade-in duration-500">
                <p className="bg-yellow-50 border-2 border-yellow-200 text-yellow-800 text-xs font-bold px-4 py-3 rounded-xl shadow-sm break-words whitespace-normal leading-relaxed">
                  {hintState.data?.levels[hintState.level as 1 | 2 | 3 | 4 | 5]}
                </p>
              </div>
            )}

            {isScanning && (
              <div className="text-orange-600 font-bold">
                Analizando 9 sectores... 🤖
              </div>
            )}
            {conflicts.size > 0 && (
              <div className="text-red-500 font-bold">
                ⚠️ Errores detectados
              </div>
            )}
          </div>
        </div>
      </div>

      {isPaused && !isGameWon && (
        <Modal
          title={isScanning ? "Procesando Imagen..." : "Juego en Pausa"}
          icon={
            <div className="scale-150 text-gray-500">
              {isScanning ? <CameraIcon /> : <PauseIcon />}
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            {isScanning ? (
              <p className="text-lg text-gray-500">
                La IA está leyendo tu sudoku sector por sector...
              </p>
            ) : (
              <>
                <p className="text-lg text-gray-500">
                  Tu tiempo actual: <strong>{formatTime(time)}</strong>
                </p>
                <button
                  onClick={handlePauseToggle}
                  className="flex items-center justify-center gap-2 p-4 bg-black text-white rounded-xl font-bold text-lg"
                >
                  <PlayIcon /> Reanudar
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      {isGameWon && (
        <Modal title="¡Felicidades!" icon={<div className="text-6xl">🏆</div>}>
          <div className="flex flex-col gap-4">
            <p className="text-lg text-gray-500">¡Has completado el Sudoku!</p>
            <div className="bg-gray-100 p-4 rounded-xl">
              <div className="text-xs uppercase text-gray-500 font-bold">
                Tiempo Final
              </div>
              <div className="text-4xl font-black text-black">
                {formatTime(time)}
              </div>
            </div>
            <button
              onClick={handleRestart}
              className="flex items-center justify-center gap-2 p-4 bg-black text-white rounded-xl font-bold text-lg"
            >
              <ReloadIcon /> Jugar otra vez
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
