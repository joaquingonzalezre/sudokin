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
                              fontSize: "clamp(0.5rem, 2vw, 0.7rem)",
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
  );
}
