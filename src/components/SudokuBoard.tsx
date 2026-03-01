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
  const [inputMode, setInputMode] = useState<"normal" | "candidate">("normal");
  const [showCandidates, setShowCandidates] = useState(false);
  const [manualNotesBackup, setManualNotesBackup] =
    useState<CandidateGridType | null>(null);
  const [autoPauseEnabled, setAutoPauseEnabled] = useState(true);
  const [isSmartNotes, setIsSmartNotes] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

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
    setManualNotesBackup(null);
    cancelHint();
    setHintHistory([]); // 🛑 Limpiamos el tracker
  };

  const handleNewGame = (difficulty: Difficulty) => {
    setShowDifficultyModal(false);
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
    setCurrentDifficulty(difficultyTranslations[difficulty]);
    setTime(0);
    setIsPaused(false);
    setIsGameWon(false);
    setIsRunning(true);
    setSelectedIdx(null);
    setShowCandidates(false);
    setManualNotesBackup(null);
    cancelHint();
    setHintHistory([]); // 🛑 Limpiamos el tracker en nuevo juego
  };

  const handleHint = useCallback(() => {
    if (isPaused || isGameWon) return;

    if (!hintState.active || !hintState.data) {
      if (candidatesGrid.some((c, i) => grid[i] === null && c.length === 0)) {
        if (
          window.confirm(
            "⚠️ Tienes celdas vacías sin ninguna nota. Para darte una pista exacta, necesito rellenar las notas básicas. ¿Permites que las auto-rellene?",
          )
        ) {
          const perfect = calculateAllCandidates(grid);
          setCandidatesGrid(perfect);
          if (!showCandidates) setShowCandidates(true);
        }
        return;
      }

      const result = getHint(grid, candidatesGrid, candidatesGrid);

      if (!result.found) {
        if (
          window.confirm(
            "🕵️‍♂️ La IA no encuentra un paso lógico. Es posible que te falten notas o borraras una correcta por accidente. ¿Quieres que la IA auto-restaure las notas para buscar de nuevo?",
          )
        ) {
          const perfect = calculateAllCandidates(grid);
          setCandidatesGrid(perfect);
          if (!showCandidates) setShowCandidates(true);
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
          } else if (act.type.includes("REMOVE")) {
            let newCandidates = [...candidatesGrid];

            if (act.removals && Array.isArray(act.removals)) {
              act.removals.forEach((r: any) => {
                const vals =
                  r.values || (r.value !== undefined ? [r.value] : []);
                if (r.cell !== undefined) {
                  newCandidates[r.cell] = newCandidates[r.cell].filter(
                    (c) => !vals.includes(c),
                  );
                }
              });
            } else if (act.cells || act.cell !== undefined) {
              const valsToRemove =
                act.values || (act.value !== undefined ? [act.value] : []);
              const cellsToUpdate =
                act.cells || (act.cell !== undefined ? [act.cell] : []);

              cellsToUpdate.forEach((idx: number) => {
                newCandidates[idx] = newCandidates[idx].filter(
                  (c) => !valsToRemove.includes(c),
                );
              });
            }

            setCandidatesGrid(newCandidates);
            if (!showCandidates) setShowCandidates(true);
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
        setIsRunning(true);
        setManualNotesBackup(null);
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
    setCandidatesGrid(calculateAllCandidates(grid));
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
    if (!manualNotesBackup) {
      alert("Tus notas actuales ya son 'Mis Notas'.");
      return;
    }
    saveSnapshot(grid, candidatesGrid);
    cancelHint();
    const restored = manualNotesBackup.map((notes, i) =>
      grid[i] !== null ? [] : notes,
    );
    setCandidatesGrid(restored);
    setManualNotesBackup(null);
    if (!showCandidates) setShowCandidates(true);
  }, [
    grid,
    candidatesGrid,
    manualNotesBackup,
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
    setManualNotesBackup(null);
  }, [grid, candidatesGrid, isPaused, isGameWon, saveSnapshot, cancelHint]);

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
    if (isFull && conflicts.size === 0 && !isGameWon) {
      setIsGameWon(true);
      setIsRunning(false);

      if (hintHistory.length > 0) {
        console.log("📡 Procesando telemetría de la partida...");
        const telemetryData = analyzeTelemetry(initialPuzzle, hintHistory);
        console.log("Resumen de partida:", telemetryData);
        saveTelemetryToDB(telemetryData);
      }
    }
  }, [grid, conflicts, isGameWon, initialPuzzle, hintHistory]);

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
      <button style={webBtnStyle} onClick={() => handleNewGame("easy")}>
        Fácil
      </button>
      <button style={webBtnStyle} onClick={() => handleNewGame("medium")}>
        Intermedio
      </button>
      <button style={webBtnStyle} onClick={() => handleNewGame("hard")}>
        Difícil
      </button>
      <button style={webBtnStyle} onClick={() => handleNewGame("expert")}>
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
      />
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
        overflowY: "auto",
        overflowX: "hidden",
        paddingTop: isWeb
          ? "10px"
          : "calc(env(safe-area-inset-top, 20px) + 20px)",
        paddingBottom: "80px",
        width: "100%",
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

      {/* 📊 VISUALIZADOR DEL TRACKER DE PISTAS */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        <div
          style={{
            marginTop: "30px",
            padding: "16px",
            backgroundColor: "#111",
            color: "#10b981",
            fontFamily: "monospace",
            borderRadius: "12px",
            fontSize: "14px",
            border: "1px solid #374151",
          }}
        >
          <span style={{ color: "#fff", fontWeight: "bold" }}>
            📡 HISTORIAL DE TELEMETRÍA:
          </span>
          <br />
          <br />
          {hintHistory.length === 0
            ? "El jugador no ha usado ninguna pista aún."
            : hintHistory.join("  ➔  ")}
        </div>
      </div>

      <GameModals
        showDifficultyModal={showDifficultyModal}
        setShowDifficultyModal={setShowDifficultyModal}
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
      />
    </div>
  );
}
