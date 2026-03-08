"use client";
import React from "react";
import { CandidateGridType } from "../logic/candidateManager";
import { HintResult, HighlightInstruction } from "../logic/hints/types";
import { getCellBgColor } from "../utils/boardUtils";

interface SudokuGridProps {
  grid: (number | null)[];
  initialPuzzle: number[];
  selectedIdx: number | null;
  setSelectedIdx: (idx: number) => void;
  conflicts: Set<number>;
  candidatesGrid: CandidateGridType;
  showCandidates: boolean;
  hintState: { active: boolean; currentStep: number; data: HintResult | null };
  highlights: HighlightInstruction;
  isPaused: boolean;
  isGameWon: boolean;
  isCandidateHighlightOn: boolean;
}

export default function SudokuGrid({
  grid,
  initialPuzzle,
  selectedIdx,
  setSelectedIdx,
  conflicts,
  candidatesGrid,
  showCandidates,
  hintState,
  highlights,
  isPaused,
  isGameWon,
  isCandidateHighlightOn,
}: SudokuGridProps) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "1/1",
        border: "4px solid black",
        backgroundColor: "#374151",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gap: "2px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
        boxSizing: "border-box",
      }}
    >
      {Array.from({ length: 9 }).map((_, blockIndex) => (
        <div
          key={blockIndex}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: "1px",
            backgroundColor: "#9ca3af",
          }}
        >
          {Array.from({ length: 9 }).map((_, cellIndex) => {
            const globalRow =
              Math.floor(blockIndex / 3) * 3 + Math.floor(cellIndex / 3);
            const globalCol = (blockIndex % 3) * 3 + (cellIndex % 3);
            const globalIdx = globalRow * 9 + globalCol;

            const val = grid[globalIdx];
            const isInitial = initialPuzzle[globalIdx] !== 0;
            const hasConflict = conflicts.has(globalIdx);
            const candidates = candidatesGrid[globalIdx];

            const bgColor = getCellBgColor(
              globalIdx,
              val,
              selectedIdx,
              isInitial,
              hasConflict,
              hintState,
              highlights,
              grid,
            );

            const selectedVal = selectedIdx !== null ? grid[selectedIdx] : null;

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
                  fontSize: "clamp(1.2rem, 6vw, 2.2rem)",
                  fontWeight: "700",
                  color: hasConflict
                    ? "red"
                    : !isInitial
                      ? "#121212"
                      : "#121212",
                  cursor: "pointer",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden", // 🛡️ Evita que el contenido rompa el layout
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
                        gridTemplateRows: "repeat(3, 1fr)",
                        width: "100%",
                        height: "100%",
                        padding: "2px",
                        boxSizing: "border-box",
                        minWidth: 0,
                        minHeight: 0,
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => {
                        const isPresent = candidates.includes(c);
                        const isSelectedCand = isCandidateHighlightOn && isPresent && selectedVal !== null && c === selectedVal;
                        return (
                          <div
                            key={c}
                            style={{
                              fontSize: "clamp(0.4rem, 1.8vw, 0.65rem)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: isSelectedCand ? "#000" : "#666",
                              fontWeight: isSelectedCand ? "900" : "normal",
                              backgroundColor: isSelectedCand ? "#fda4af" : "transparent",
                              borderRadius: "2px",
                              transition: "all 0.1s",
                              width: "100%",
                              height: "100%", // Ocupa su espacio del grid sin empujar
                              boxSizing: "border-box",
                              lineHeight: 1,
                            }}
                          >
                            {isPresent ? c : ""}
                          </div>
                        );
                      })}
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
