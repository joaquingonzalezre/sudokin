"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CandidateGridType,
  generateEmptyCandidates,
  toggleCandidate,
  calculateAllCandidates,
} from "../logic/candidateManager";
import { getCompletedNumbers } from "../utils/numberTracker";
import { useGameMemory } from "../hooks/useGameMemory";

// --- PISTAS DINÁMICAS ---
import { HintResult, HighlightInstruction } from "../logic/hints/types";
import { getHint } from "../logic/hintManager";

import { useGameHistory } from "../hooks/useGameHistory";
import { getRandomPuzzle, Difficulty } from "../data/puzzles";
import { scanFilteredDigits } from "../services/ocrService";
import {
  sliceImageInto81,
  createSudokuCollage,
  findAndCropSudokuGrid,
  hasInk,
} from "../utils/imageTools";

// --- GUARDADO DE SUDOKUS IMPORTADOS ---
import { guardarSudokuImportado } from "../utils/importsudokus";

// Importamos los paneles
import ControlPad from "./ControlPad";
import ControlTools from "./ControlTools";

type SudokuGridType = (number | null)[];

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

export default function SudokuBoard() {
  const emptyGrid = Array(81).fill(0);

  const [initialPuzzle, setInitialPuzzle] = useState<number[]>(emptyGrid);
  const [grid, setGrid] = useState<SudokuGridType>(
    emptyGrid.map((n) => (n === 0 ? null : n)),
  );
  const [candidatesGrid, setCandidatesGrid] = useState<CandidateGridType>(() =>
    generateEmptyCandidates(emptyGrid),
  );

  const { saveSnapshot, undoLastMove } = useGameHistory(grid, candidatesGrid);

  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameWon, setIsGameWon] = useState(false);
  const [inputMode, setInputMode] = useState<"normal" | "candidate">("normal");
  const [showCandidates, setShowCandidates] = useState(false);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true);
  const [isSmartNotes, setIsSmartNotes] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ==========================================
  // 🧠 ESTADOS DE PISTAS DINÁMICAS
  // ==========================================
  const defaultHighlights: HighlightInstruction = {
    primaryCells: [],
    secondaryCells: [],
    focusNumber: null,
  };
  const [highlights, setHighlights] =
    useState<HighlightInstruction>(defaultHighlights);
  const [hintState, setHintState] = useState<{
    active: boolean;
    currentStep: number;
    data: HintResult | null;
  }>({ active: false, currentStep: 0, data: null });

  const completedNumbers = getCompletedNumbers(grid);

  useGameMemory({
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
  });

  const cancelHint = useCallback(() => {
    setHintState({ active: false, currentStep: 0, data: null });
    setHighlights(defaultHighlights);
  }, []);

  const handleResetCurrent = () => {
    if (!isRunning && initialPuzzle.every((n) => n === 0)) return;
    if (
      !window.confirm(
        "¿Reiniciar este puzzle? Se borrará todo tu progreso actual.",
      )
    )
      return;
    const resetGrid = initialPuzzle.map((n) => (n === 0 ? null : n));
    setGrid(resetGrid);
    setCandidatesGrid(generateEmptyCandidates(resetGrid));
    setTime(0);
    setIsPaused(false);
    setIsGameWon(false);
    setSelectedIdx(null);
    cancelHint();
  };

  const handleNewGame = (difficulty: Difficulty) => {
    const hasNumbers = grid.some((n) => n !== null);
    if (hasNumbers && !isGameWon) {
      if (
        !window.confirm(
          `¿Iniciar nuevo juego nivel ${difficulty.toUpperCase()}? Se perderá el progreso actual.`,
        )
      )
        return;
    }
    const newPuzzleNumbers = getRandomPuzzle(difficulty);
    if (!newPuzzleNumbers.some((n) => n !== 0)) {
      alert(`⚠️ Aún no hay puzzles cargados.`);
      return;
    }

    setInitialPuzzle(newPuzzleNumbers);
    const newGrid = newPuzzleNumbers.map((n) => (n === 0 ? null : n));
    setGrid(newGrid);
    setCandidatesGrid(generateEmptyCandidates(newGrid));
    setTime(0);
    setIsPaused(false);
    setIsGameWon(false);
    setIsRunning(true);
    setSelectedIdx(null);
    setShowCandidates(false);
    cancelHint();
  };

  // ========================================================
  // 🎓 MOTOR DE PISTAS (Con el fix de SmartNotes)
  // ========================================================
  const handleHint = useCallback(() => {
    if (isPaused || isGameWon) return;

    if (!hintState.active || !hintState.data) {
      const mathCandidates = calculateAllCandidates(grid);
      if (mathCandidates.some((c, i) => grid[i] === null && c.length === 0)) {
        alert(
          "⚠️ El tablero tiene un error lógico (una celda vacía se quedó sin posibilidades). Revisa tus movimientos.",
        );
        return;
      }

      const result = getHint(grid, mathCandidates, candidatesGrid);
      if (!result.found) {
        alert(result.steps[0].message);
        return;
      }

      setHintState({ active: true, currentStep: 0, data: result });
      setHighlights(result.steps[0].highlights);
    } else {
      const nextStep = hintState.currentStep + 1;

      if (nextStep < hintState.data.totalSteps) {
        setHintState((prev) => ({ ...prev, currentStep: nextStep }));
        setHighlights(hintState.data!.steps[nextStep].highlights);
      } else {
        const action = hintState.data.action;
        if (action) {
          saveSnapshot(grid, candidatesGrid);

          if (action.type === "PLACE_NUMBER") {
            const newGrid = [...grid];
            let newCandidates = [...candidatesGrid];

            action.cells.forEach((idx) => {
              newGrid[idx] = action.value!;
              newCandidates[idx] = []; // Limpiamos la celda donde escribimos

              if (isSmartNotes) {
                const row = Math.floor(idx / 9);
                const col = idx % 9;
                const boxRow = Math.floor(row / 3) * 3;
                const boxCol = Math.floor(col / 3) * 3;

                for (let i = 0; i < 81; i++) {
                  const r = Math.floor(i / 9);
                  const c = i % 9;
                  if (
                    r === row ||
                    c === col ||
                    (Math.floor(r / 3) * 3 === boxRow &&
                      Math.floor(c / 3) * 3 === boxCol)
                  ) {
                    newCandidates[i] = newCandidates[i].filter(
                      (cand) => cand !== action.value!,
                    );
                  }
                }
              }
            });

            setGrid(newGrid);
            setCandidatesGrid(newCandidates);
          } else if (action.type === "REMOVE_CANDIDATE") {
            const newCandidates = [...candidatesGrid];
            const valuesToRemove = action.values || [action.value!];
            action.cells.forEach((idx) => {
              newCandidates[idx] = newCandidates[idx].filter(
                (c) => !valuesToRemove.includes(c),
              );
            });
            setCandidatesGrid(newCandidates);
            if (!showCandidates) setShowCandidates(true);
          } else if (action.type === "KEEP_CANDIDATES") {
            const newCandidates = [...candidatesGrid];
            const valuesToKeep = action.values!;
            action.cells.forEach((idx) => {
              newCandidates[idx] = newCandidates[idx].filter((c) =>
                valuesToKeep.includes(c),
              );
            });
            setCandidatesGrid(newCandidates);
            if (!showCandidates) setShowCandidates(true);
          }
        }
        cancelHint();
      }
    }
  }, [
    isPaused,
    isGameWon,
    hintState,
    grid,
    candidatesGrid,
    saveSnapshot,
    isSmartNotes,
    showCandidates,
    cancelHint,
  ]);

  // ========================================================
  // 📸 MOTOR OCR (Con Guardado Automático)
  // ========================================================
  const processImageFile = async (file: File) => {
    setIsScanning(true);
    setIsPaused(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
    try {
      const croppedGridBase64 = await findAndCropSudokuGrid(file);
      const allPieces = await sliceImageInto81(croppedGridBase64);
      const finalHybridGrid: number[] = Array(81).fill(0);
      const piecesForAI: string[] = [];
      const originalIndices: number[] = [];

      for (let i = 0; i < 81; i++) {
        if (await hasInk(allPieces[i])) {
          piecesForAI.push(allPieces[i]);
          originalIndices.push(i);
        }
      }
      if (piecesForAI.length === 0)
        throw new Error("No se detectó ningún número.");

      const filteredCollage = await createSudokuCollage(piecesForAI);
      const result = await scanFilteredDigits(
        filteredCollage,
        piecesForAI.length,
      );

      if (result.success && result.grid.length > 0) {
        result.grid.forEach((aiDigit, idx) => {
          finalHybridGrid[originalIndices[idx]] = aiDigit;
        });

        // 💾 GUARDAMOS EN EL ARCHIVO IMPORTADOS
        guardarSudokuImportado(finalHybridGrid);

        setInitialPuzzle(finalHybridGrid);
        const newGrid = finalHybridGrid.map((n: number) =>
          n === 0 ? null : n,
        );
        setGrid(newGrid);
        setCandidatesGrid(generateEmptyCandidates(newGrid));
        setTime(0);
        cancelHint();
        setIsGameWon(false);
        setIsRunning(true);
      } else {
        alert("Error IA: " + (result.error || ""));
      }
    } catch (error: any) {
      alert(error.message || "Error al procesar.");
    } finally {
      setIsScanning(false);
      setIsPaused(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (isScanning) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            processImageFile(file);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isScanning]);

  // --- HANDLERS COMUNES ---
  const handleUndo = useCallback(() => {
    if (isPaused || isGameWon) return;
    const prev = undoLastMove();
    if (prev) {
      setGrid(prev.grid);
      setCandidatesGrid(prev.candidates);
      cancelHint();
    }
  }, [undoLastMove, isPaused, isGameWon, cancelHint]);

  const handleAutoCandidates = useCallback(() => {
    if (isPaused || isGameWon) return;
    saveSnapshot(grid, candidatesGrid);
    setCandidatesGrid(calculateAllCandidates(grid));
    setShowCandidates(true);
    cancelHint();
  }, [grid, candidatesGrid, isPaused, isGameWon, saveSnapshot, cancelHint]);

  // ========================================================
  // ✍️ ENTRADA MANUAL (Con el fix de SmartNotes)
  // ========================================================
  const handleInput = useCallback(
    (num: number) => {
      if (isPaused || isGameWon || selectedIdx === null) return;
      if (initialPuzzle[selectedIdx] !== 0) return;

      saveSnapshot(grid, candidatesGrid);
      cancelHint();

      if (inputMode === "normal") {
        const newGrid = [...grid];
        newGrid[selectedIdx] = num;
        setGrid(newGrid);

        let newCandidates = [...candidatesGrid];
        newCandidates[selectedIdx] = [];

        if (isSmartNotes) {
          const row = Math.floor(selectedIdx / 9);
          const col = selectedIdx % 9;
          const boxRow = Math.floor(row / 3) * 3;
          const boxCol = Math.floor(col / 3) * 3;

          for (let i = 0; i < 81; i++) {
            const r = Math.floor(i / 9);
            const c = i % 9;
            if (
              r === row ||
              c === col ||
              (Math.floor(r / 3) * 3 === boxRow &&
                Math.floor(c / 3) * 3 === boxCol)
            ) {
              newCandidates[i] = newCandidates[i].filter(
                (cand) => cand !== num,
              );
            }
          }
        }
        setCandidatesGrid(newCandidates);
      } else {
        if (grid[selectedIdx] === null) {
          const newC = [...candidatesGrid];
          newC[selectedIdx] = toggleCandidate(newC[selectedIdx], num);
          setCandidatesGrid(newC);
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
      isSmartNotes,
      cancelHint,
    ],
  );

  const handleDelete = useCallback(() => {
    if (isPaused || isGameWon || selectedIdx === null) return;
    if (initialPuzzle[selectedIdx] !== 0) return;
    saveSnapshot(grid, candidatesGrid);
    cancelHint();
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
    cancelHint,
  ]);

  const handleClearCandidates = useCallback(() => {
    if (isPaused || isGameWon) return;
    saveSnapshot(grid, candidatesGrid);
    cancelHint();
    setCandidatesGrid(Array.from({ length: 81 }, () => []));
  }, [grid, candidatesGrid, isPaused, isGameWon, saveSnapshot, cancelHint]);

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
    cancelHint();
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
        const tRow = Math.floor(j / 9);
        const tCol = j % 9;
        if (
          row === tRow ||
          col === tCol ||
          (Math.floor(tRow / 3) === boxRow && Math.floor(tCol / 3) === boxCol)
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
        {/* PANEL IZQUIERDO */}
        <ControlTools
          hintState={hintState as any}
          onNewGame={handleNewGame}
          onHint={handleHint}
          onCancelHint={cancelHint}
          onImportClick={() => fileInputRef.current?.click()}
          isScanning={isScanning}
        />

        {/* TABLERO CENTRAL */}
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

                // --- COLORES AGNÓSTICOS ---
                let bgColor = "white";
                if (highlights.primaryCells.includes(globalIdx))
                  bgColor = "#f472b6";
                else if (highlights.secondaryCells.includes(globalIdx))
                  bgColor = "#fce7f3";
                else if (
                  highlights.focusNumber !== null &&
                  val === highlights.focusNumber
                )
                  bgColor = "#fbcfe8";
                else if (hasConflict && !isInitial) bgColor = "#ffcccc";
                else if (isSelected)
                  bgColor = val !== null ? "#d48200" : "#fb9b00";
                else if (isSameValue) bgColor = "#e69100";
                else if (isPeer) bgColor = isInitial ? "#d3c6af" : "#f9eac2";
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
                          ? "#121212"
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

        {/* PANEL DERECHO */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          <ControlPad
            onNumberClick={handleInput}
            onDeleteClick={handleDelete}
            onUndoClick={handleUndo}
            onCreateCandidates={handleAutoCandidates}
            onClearCandidatesClick={handleClearCandidates}
            inputMode={inputMode}
            setInputMode={setInputMode}
            showCandidates={showCandidates}
            setShowCandidates={setShowCandidates}
            smartNotesMode={isSmartNotes}
            onToggleSmartNotes={() => setIsSmartNotes(!isSmartNotes)}
            completedNumbers={completedNumbers}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              marginTop: "10px",
              borderTop: "1px solid #e5e7eb",
              paddingTop: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  fontFamily: "monospace",
                  color: "#374151",
                }}
              >
                {formatTime(time)}
              </span>
              <button
                onClick={handlePauseToggle}
                style={{
                  padding: "10px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "#e5e7eb",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                {isPaused ? <PlayIcon /> : <PauseIcon />}
              </button>
              <button
                onClick={handleResetCurrent}
                title="Reiniciar este puzzle"
                style={{
                  padding: "10px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: "#e5e7eb",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                <ReloadIcon />
              </button>
              <button
                onClick={() => setAutoPauseEnabled(!autoPauseEnabled)}
                style={{
                  padding: "10px",
                  borderRadius: "50%",
                  border: "none",
                  backgroundColor: autoPauseEnabled ? "#e5e7eb" : "#9ca3af",
                  color: autoPauseEnabled ? "black" : "white",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                {autoPauseEnabled ? <EyeIcon /> : <EyeOffIcon />}
              </button>
            </div>
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
                Escaneando celda por celda (por filas)...
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
