"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  CandidateGridType,
  generateEmptyCandidates,
  toggleCandidate,
  calculateAllCandidates,
} from "../logic/candidateManager";
// 🧪 Importaciones directas para el Laboratorio de Pruebas
import { findXWing } from "../logic/hints/xWing";
import { findYWing } from "../logic/hints/yWing";
import { findSwordfish } from "../logic/hints/swordfish";
import { findXYChain } from "../logic/hints/xyChain";
import { getCompletedNumbers } from "../utils/numberTracker";
import { useGameMemory } from "../hooks/useGameMemory";
import { HintResult, HighlightInstruction } from "../logic/hints/types";
import { getHint } from "../logic/hintManager";
import { useGameHistory } from "../hooks/useGameHistory";
import { getRandomPuzzle, getPuzzleById, Difficulty } from "../data/puzzles";
import { sudokusOrdenados } from "../../scripts/sudokus_ordenados";
import { scanFilteredDigits } from "../services/ocrService";
import {
  sliceImageInto81,
  createSudokuCollage,
  findAndCropSudokuGrid,
  hasInk,
} from "../utils/imageTools";
import { guardarSudokuImportado } from "../utils/importsudokus";

// 🛑 HERRAMIENTAS DE TELEMETRÍA (El cable a la base de datos)
import { analyzeTelemetry, saveTelemetryToDB } from "../utils/telemetryTools";

// MÓDULOS DE DISEÑO
import { useIsWeb } from "../hooks/useIsWeb";
import ResponsiveLayout from "./ResponsiveLayout";
import ControlPad from "./ControlPad";
import ControlTools from "./ControlTools";
import GameHeader from "./GameHeader";
import SudokuGrid from "./SudokuGrid";
import GameModals from "./GameModals";

type SudokuGridType = (number | null)[];

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

const difficultyTranslations: Record<string, string> = {
  easy: "Fácil",
  medium: "Intermedio",
  hard: "Difícil",
  expert: "Experto",
  importado: "Importado",
};

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
  const [isGameWonPersistent, setIsGameWonPersistent] = useState(false);
  const [inputMode, setInputMode] = useState<"normal" | "candidate">("normal");
  const [showCandidates, setShowCandidates] = useState(false);
  const [manualNotesBackup, setManualNotesBackup] =
    useState<CandidateGridType | null>(null);
  const [aiNotes, setAiNotes] = useState<CandidateGridType | null>(null);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true);
  const [isSmartNotes, setIsSmartNotes] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [isCandidateHighlightOn, setIsCandidateHighlightOn] = useState(false);

  const [modalInitialDifficulty, setModalInitialDifficulty] = useState<Difficulty | null>(null);

  const [currentDifficulty, setCurrentDifficulty] = useState<string | null>(
    null,
  );

  // 📊 TRACKER DE PISTAS (Historial de Lógicas)
  const [hintHistory, setHintHistory] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isWeb = useIsWeb();

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

  useEffect(() => {
    const savedDifficulty = localStorage.getItem("sudoku_saved_difficulty");
    if (savedDifficulty) setCurrentDifficulty(savedDifficulty);

    // 🚫 Deshabilitar scroll en el body y html para "Movimiento Cero"
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.height = "100vh";
    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    return () => {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    if (currentDifficulty)
      localStorage.setItem("sudoku_saved_difficulty", currentDifficulty);
  }, [currentDifficulty]);

  const cancelHint = useCallback(() => {
    setHintState({ active: false, currentStep: 0, data: null });
    setHighlights(defaultHighlights);
  }, []);

  const handleResetCurrent = () => {
    const resetGrid = initialPuzzle.map((n) => (n === 0 ? null : n));
    setGrid(resetGrid);
    setCandidatesGrid(generateEmptyCandidates(resetGrid));
    setTime(0);
    setIsPaused(false);
    setIsGameWon(false);
    setIsGameWonPersistent(false);
    setSelectedIdx(null);
    setManualNotesBackup(null);
    setAiNotes(null);
    cancelHint();
    setHintHistory([]); // 🛑 Limpiamos el tracker
  };

  const handleNewGame = (difficulty: Difficulty, specificId?: number) => {
    setShowDifficultyModal(false);
    const newPuzzleNumbers = specificId
      ? getPuzzleById(specificId)
      : getRandomPuzzle(difficulty);

    if (!newPuzzleNumbers.some((n) => n !== 0)) {
      alert(`⚠️ Aún no hay puzzles cargados.`);
      return;
    }

    setInitialPuzzle(newPuzzleNumbers);
    const newGrid = newPuzzleNumbers.map((n) => (n === 0 ? null : n));
    setGrid(newGrid);
    setCandidatesGrid(generateEmptyCandidates(newGrid));
    setCurrentDifficulty(difficultyTranslations[difficulty]);
    setTime(0);
    setIsPaused(false);
    setIsGameWon(false);
    setIsGameWonPersistent(false);
    setIsRunning(true);
    setSelectedIdx(null);
    setShowCandidates(false);
    setManualNotesBackup(null);
    setAiNotes(calculateAllCandidates(newGrid)); // ✅ Pre-calculate AI notes
    cancelHint();
    setHintHistory([]); // 🛑 Limpiamos el tracker en nuevo juego
  };

  const handleHint = useCallback(() => {
    if (isPaused || isGameWon) return;

    if (!hintState.active || !hintState.data) {
      const isAiNotesActive = aiNotes !== null && manualNotesBackup !== null;
      const result = getHint(grid, candidatesGrid, candidatesGrid, isAiNotesActive);

      if (!result.found) {
        if (!isAiNotesActive) {
          alert("🕵️‍♂️ Actualmente con tus notas no se encuentran posibles pistas, intenta usando las notas IA");
        } else {
          alert("🕵️‍♂️ Actualmente no se encuentran posibles pistas ni con el motor avanzado de la IA. ¡Revisa si hay errores!");
        }
        return;
      }

      setHintState({ active: true, currentStep: 0, data: result });
      setHighlights(result.steps[0].highlights);
      setSelectedIdx(null);
    } else {
      const nextStep = hintState.currentStep + 1;
      if (nextStep < hintState.data.totalSteps) {
        setHintState((prev) => ({ ...prev, currentStep: nextStep }));
        setHighlights(hintState.data!.steps[nextStep].highlights);
      } else {
        const action = hintState.data.action;
        if (action) {
          saveSnapshot(grid, candidatesGrid);

          // 📊 REGISTRAMOS LA PISTA USADA EN EL TRACKER DE TELEMETRÍA
          setHintHistory((prev) => [...prev, hintState.data!.type]);

          const act = action as any;

          if (act.type === "PLACE_NUMBER" || act.type === "PLACE") {
            const newGrid = [...grid];
            let newCandidates = [...candidatesGrid];

            const cellsToUpdate =
              act.cells || (act.cell !== undefined ? [act.cell] : []);

            cellsToUpdate.forEach((idx: number) => {
              newGrid[idx] = act.value!;
              newCandidates[idx] = [];
              if (isSmartNotes) {
                const row = Math.floor(idx / 9),
                  col = idx % 9,
                  boxRow = Math.floor(row / 3) * 3,
                  boxCol = Math.floor(col / 3) * 3;
                for (let i = 0; i < 81; i++) {
                  const r = Math.floor(i / 9),
                    c = i % 9;
                  if (
                    r === row ||
                    c === col ||
                    (Math.floor(r / 3) * 3 === boxRow &&
                      Math.floor(c / 3) * 3 === boxCol)
                  ) {
                    newCandidates[i] = newCandidates[i].filter(
                      (cand) => cand !== act.value!,
                    );
                  }
                }
              }
            });
            setGrid(newGrid);
            setCandidatesGrid(newCandidates);

            // ✅ PÉGALO EXACTAMENTE ASÍ
          } else if (act.type.includes("REMOVE")) {
            let newCandidates = [...candidatesGrid];

            const valsToRemove =
              act.values || (act.value !== undefined ? [act.value] : []);
            const cellsToUpdate =
              act.cells || (act.cell !== undefined ? [act.cell] : []);

            cellsToUpdate.forEach((idx: number) => {
              newCandidates[idx] = newCandidates[idx].filter(
                (c) => !valsToRemove.includes(c),
              );
            });

            setCandidatesGrid(newCandidates);
            if (!showCandidates) setShowCandidates(true);
            // ✅ HASTA AQUÍ
          } else if (act.type.includes("KEEP")) {
            let newCandidates = [...candidatesGrid];
            const valuesToKeep =
              act.values || (act.value !== undefined ? [act.value] : []);
            const cellsToUpdate =
              act.cells || (act.cell !== undefined ? [act.cell] : []);

            cellsToUpdate.forEach((idx: number) => {
              newCandidates[idx] = newCandidates[idx].filter((c) =>
                valuesToKeep.includes(c),
              );
            });
            setCandidatesGrid(newCandidates);
            if (!showCandidates) setShowCandidates(true);
          }

          // ✅ FIX: Sincronizar Notas AI si la pista colocó un número
          if ((act.type === "PLACE_NUMBER" || act.type === "PLACE") && aiNotes) {
            // Reconstruimos el grid temporalmente para el cálculo, ya que el state aún no se actualiza
            const tempGrid = [...grid];
            const cellsToUpdate = act.cells || (act.cell !== undefined ? [act.cell] : []);
            cellsToUpdate.forEach((idx: number) => {
              tempGrid[idx] = act.value!;
            });
            setAiNotes(calculateAllCandidates(tempGrid));
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
        guardarSudokuImportado(finalHybridGrid);
        setInitialPuzzle(finalHybridGrid);
        const newGrid = finalHybridGrid.map((n: number) =>
          n === 0 ? null : n,
        );
        setGrid(newGrid);
        setCandidatesGrid(generateEmptyCandidates(newGrid));
        setCurrentDifficulty(difficultyTranslations["importado"]);
        setTime(0);
        cancelHint();
        setIsGameWon(false);
        setIsGameWonPersistent(false);
        setIsRunning(true);
        setManualNotesBackup(null);
        setAiNotes(calculateAllCandidates(newGrid)); // ✅ Pre-calculate AI notes
        setHintHistory([]);
      } else {
        alert("Error IA: " + (result.error || ""));
      }
    } catch (error: any) {
      alert(error.message || "Error al procesar.");
    } finally {
      setIsScanning(false);
      setIsPaused(false);
      setShowDifficultyModal(false);
    }
  };



  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

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
    if (!manualNotesBackup) setManualNotesBackup([...candidatesGrid]);

    // Al usar el botón 'Crear Notas', generamos nuevas notas IA o limpiamos si ya estaban generadas (esto actualiza aiNotes persistente)
    const newNotes = calculateAllCandidates(grid);
    setAiNotes(newNotes);
    setCandidatesGrid(newNotes);
    setShowCandidates(true);
    cancelHint();
  }, [
    grid,
    candidatesGrid,
    isPaused,
    isGameWon,
    saveSnapshot,
    cancelHint,
    manualNotesBackup,
  ]);

  const handleRestoreNotes = useCallback(() => {
    if (isPaused || isGameWon) return;
    saveSnapshot(grid, candidatesGrid);
    cancelHint();

    if (!manualNotesBackup) {
      setManualNotesBackup([...candidatesGrid]);

      // Usa las aiNotes si ya existen, sino calcúlalas de nuevo.
      const notesToUse = aiNotes ? [...aiNotes] : calculateAllCandidates(grid);
      const filteredNotes = notesToUse.map((notes, i) => grid[i] !== null ? [] : notes);
      setAiNotes(filteredNotes);

      setCandidatesGrid(filteredNotes);
      if (!showCandidates) setShowCandidates(true);
    } else {
      setAiNotes([...candidatesGrid]);
      const restored = manualNotesBackup.map((notes, i) =>
        grid[i] !== null ? [] : notes,
      );
      setCandidatesGrid(restored);
      setManualNotesBackup(null);
      if (!showCandidates) setShowCandidates(true);
    }
  }, [
    grid,
    candidatesGrid,
    manualNotesBackup,
    aiNotes,
    isPaused,
    isGameWon,
    saveSnapshot,
    showCandidates,
    cancelHint,
  ]);

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
          const row = Math.floor(selectedIdx / 9),
            col = selectedIdx % 9,
            boxRow = Math.floor(row / 3) * 3,
            boxCol = Math.floor(col / 3) * 3;
          for (let i = 0; i < 81; i++) {
            const r = Math.floor(i / 9),
              c = i % 9;
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

        // ✅ FIX: Sincronizar Notas AI en segundo plano si existen
        if (aiNotes) {
          setAiNotes(calculateAllCandidates(newGrid));
        }
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

    // ✅ FIX: Sincronizar Notas AI en segundo plano si existen
    if (aiNotes) {
      setAiNotes(calculateAllCandidates(newGrid));
    }
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
    setManualNotesBackup(null);
    setAiNotes(null); // ✅ Reset AI notes
  }, [grid, candidatesGrid, isPaused, isGameWon, saveSnapshot, cancelHint]);

  // Navegación con teclado (Flechas)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está escribiendo en algún input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault(); // Evita que la pantalla haga scroll al usarlas

        if (selectedIdx === null) {
          // Si no hay celda seleccionada, empezamos en el centro
          setSelectedIdx(40);
          return;
        }

        let newIdx = selectedIdx;
        if (e.key === "ArrowUp") {
          newIdx = selectedIdx - 9 >= 0 ? selectedIdx - 9 : selectedIdx;
        } else if (e.key === "ArrowDown") {
          newIdx = selectedIdx + 9 < 81 ? selectedIdx + 9 : selectedIdx;
        } else if (e.key === "ArrowLeft") {
          newIdx = selectedIdx % 9 > 0 ? selectedIdx - 1 : selectedIdx;
        } else if (e.key === "ArrowRight") {
          newIdx = selectedIdx % 9 < 8 ? selectedIdx + 1 : selectedIdx;
        }
        setSelectedIdx(newIdx);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIdx]);

  const handlePauseToggle = () => setIsPaused(!isPaused);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getAllConflicts = (currentGrid: SudokuGridType) => {
    const conflictSet = new Set<number>();
    for (let i = 0; i < 81; i++) {
      if (!currentGrid[i]) continue;
      const val = currentGrid[i],
        row = Math.floor(i / 9),
        col = i % 9,
        boxRow = Math.floor(row / 3),
        boxCol = Math.floor(col / 3);
      for (let j = 0; j < 81; j++) {
        if (i === j || currentGrid[j] !== val) continue;
        const tRow = Math.floor(j / 9),
          tCol = j % 9;
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

  // 🛑 EL CABLE FINAL: ENVIAR TELEMETRÍA AL GANAR
  useEffect(() => {
    const isFull = grid.every((cell) => cell !== null);
    if (isFull && conflicts.size === 0 && !isGameWonPersistent) {
      setIsGameWon(true);
      setIsGameWonPersistent(true);
      setIsRunning(false);

      console.log("🏆 ¡Sudoku completado!");

      if (hintHistory.length > 0) {
        console.log("📡 Procesando telemetría de la partida...");
        const telemetryData = analyzeTelemetry(initialPuzzle, hintHistory);
        console.log("Resumen de partida:", telemetryData);
        saveTelemetryToDB(telemetryData);
      }
    }
  }, [grid, conflicts, isGameWonPersistent, initialPuzzle, hintHistory]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && autoPauseEnabled) setIsPaused(true);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [autoPauseEnabled]);

  useEffect(() => {
    if (aiNotes === null && grid.some(n => n !== null)) {
      setAiNotes(calculateAllCandidates(grid));
    }
  }, [grid, aiNotes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && !isPaused && !isGameWon)
      interval = setInterval(() => setTime((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, isGameWon]);

  // =========================================================================
  // 🧩 CONSTRUCCIÓN DE LAS PIEZAS DE LEGO
  // =========================================================================

  const webBtnStyle = {
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontWeight: "bold",
    backgroundColor: "white",
    cursor: "pointer",
    width: "100%",
    color: "#374151",
    transition: "all 0.2s",
  };

  const centerPanelNode = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        width: "100%",
      }}
    >
      {isWeb && (
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: currentDifficulty ? "space-between" : "flex-end",
            minHeight: "56px",
          }}
        >
          {currentDifficulty && (
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "900",
                color: "#111",
                textTransform: "uppercase",
                letterSpacing: "4px",
                margin: 0,
                fontFamily: "Arial, sans-serif",
              }}
            >
              {currentDifficulty}
            </h2>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "10px 16px",
              backgroundColor: "white",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
            }}
          >
            <span
              style={{
                fontSize: "24px",
                fontWeight: "900",
                fontFamily: "monospace",
                color: "#1f2937",
                letterSpacing: "1px",
              }}
            >
              {formatTime(time)}
            </span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handlePauseToggle}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#f3f4f6",
                  cursor: "pointer",
                  display: "flex",
                  color: "#4b5563",
                }}
              >
                {isPaused ? <PlayIcon /> : <PauseIcon />}
              </button>
              <button
                onClick={handleResetCurrent}
                style={{
                  padding: "10px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#f3f4f6",
                  cursor: "pointer",
                  display: "flex",
                  color: "#4b5563",
                }}
              >
                <ReloadIcon />
              </button>
            </div>
          </div>
        </div>
      )}
      <SudokuGrid
        grid={grid}
        initialPuzzle={initialPuzzle}
        selectedIdx={selectedIdx}
        setSelectedIdx={setSelectedIdx}
        conflicts={conflicts}
        candidatesGrid={candidatesGrid}
        showCandidates={showCandidates}
        hintState={hintState}
        highlights={highlights}
        isPaused={isPaused}
        isGameWon={isGameWon}
        isCandidateHighlightOn={isCandidateHighlightOn}
      />
    </div>
  );

  const mobileHeaderNode = (
    <GameHeader
      timeFormatted={formatTime(time)}
      isPaused={isPaused}
      onPauseToggle={handlePauseToggle}
      onResetCurrent={handleResetCurrent}
      onNewGameClick={() => setShowDifficultyModal(true)}
      currentDifficulty={currentDifficulty}
    />
  );

  const mobileFooterNode = (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
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
        onRestoreNotesClick={handleRestoreNotes}
        hasManualNotesBackup={manualNotesBackup !== null}
        isWeb={isWeb}
        isCandidateHighlightOn={isCandidateHighlightOn}
        onToggleCandidateHighlight={() => setIsCandidateHighlightOn(!isCandidateHighlightOn)}
      />
      <ControlTools
        hintState={hintState as any}
        onHint={handleHint}
        onCancelHint={cancelHint}
      />
    </div>
  );

  const webLeftPanelNode = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "100%",
        marginTop: "72px",
      }}
    >
      <h3
        style={{
          fontSize: "16px",
          fontWeight: "900",
          color: "#111",
          marginBottom: "4px",
        }}
      >
        Nuevo Sudoku
      </h3>
      <button style={webBtnStyle} onClick={() => { setModalInitialDifficulty("easy"); setShowDifficultyModal(true); }}>
        Fácil
      </button>
      <button style={webBtnStyle} onClick={() => { setModalInitialDifficulty("medium"); setShowDifficultyModal(true); }}>
        Intermedio
      </button>
      <button style={webBtnStyle} onClick={() => { setModalInitialDifficulty("hard"); setShowDifficultyModal(true); }}>
        Difícil
      </button>
      <button style={webBtnStyle} onClick={() => { setModalInitialDifficulty("expert"); setShowDifficultyModal(true); }}>
        Experto
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        style={{
          ...webBtnStyle,
          color: isScanning ? "#b45309" : "#1d4ed8",
          borderColor: isScanning ? "#f59e0b" : "#bfdbfe",
          backgroundColor: isScanning ? "#fcd34d" : "#eff6ff",
          marginTop: "8px",
        }}
      >
        {isScanning ? "Escaneando... ⏳" : "Importar Sudoku 📸"}
      </button>


      <div style={{ marginTop: "16px" }}>
        <ControlTools
          hintState={hintState as any}
          onHint={handleHint}
          onCancelHint={cancelHint}
        />
      </div>

    </div>
  );

  const webRightPanelNode = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
        marginTop: "72px",
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
        onRestoreNotesClick={handleRestoreNotes}
        hasManualNotesBackup={manualNotesBackup !== null}
        isWeb={isWeb}
        isCandidateHighlightOn={isCandidateHighlightOn}
        onToggleCandidateHighlight={() => setIsCandidateHighlightOn(!isCandidateHighlightOn)}
      />
    </div>
  );

  return (
    <div
      style={{
        position: "fixed", // 🔒 Fija la aplicación al viewport para "Movimiento Cero"
        inset: 0,
        height: "100dvh",
        width: "100vw",
        backgroundColor: "#f0f0f0",
        overflow: "hidden", // 🚫 Elimina cualquier barra de desplazamiento
        display: "flex",
        flexDirection: "column",
        paddingTop: isWeb
          ? "10px"
          : "calc(env(safe-area-inset-top, 20px) + 20px)",
        paddingBottom: "20px",
        boxSizing: "border-box",
      }}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageUpload}
        style={{ display: "none" }}
      />

      <ResponsiveLayout
        isWeb={isWeb}
        leftPanelWeb={webLeftPanelNode}
        centerPanel={centerPanelNode}
        rightPanelWeb={webRightPanelNode}
        mobileHeader={mobileHeaderNode}
        mobileFooter={mobileFooterNode}
      />

      <GameModals
        showDifficultyModal={showDifficultyModal}
        setShowDifficultyModal={(show) => {
          setShowDifficultyModal(show);
          if (!show) setModalInitialDifficulty(null);
        }}
        handleNewGame={handleNewGame}
        fileInputRef={fileInputRef}
        isScanning={isScanning}
        isPaused={isPaused}
        isGameWon={isGameWon}
        timeFormatted={formatTime(time)}
        handlePauseToggle={handlePauseToggle}
        autoPauseEnabled={autoPauseEnabled}
        setAutoPauseEnabled={setAutoPauseEnabled}
        handleRestart={handleResetCurrent}
        onToggleWinModal={() => setIsGameWon(false)}
        totalSudokusCount={sudokusOrdenados.length}
        initialDifficulty={modalInitialDifficulty}
      />
    </div>
  );
}
