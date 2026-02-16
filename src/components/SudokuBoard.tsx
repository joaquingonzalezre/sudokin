"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

const INITIAL_PUZZLE = [
  8, 0, 1, 0, 9, 0, 0, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 6, 0, 0, 7, 0, 0,
  0, 0, 0, 2, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 7, 3, 0, 0, 2, 7, 0, 0, 9, 0, 1, 5,
  0, 0, 0, 2, 7, 0, 0, 6, 9, 0, 3, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 3, 7, 1, 0,
  0, 5, 0,
];

export default function SudokuBoard() {
  const [grid, setGrid] = useState<(number | null)[]>(
    INITIAL_PUZZLE.map((n) => (n === 0 ? null : n)),
  );
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  let selectedRow: number | null = null;
  let selectedCol: number | null = null;
  let selectedValue: number | null = null;

  if (selectedIdx !== null) {
    selectedRow = Math.floor(selectedIdx / 9);
    selectedCol = selectedIdx % 9;
    selectedValue = grid[selectedIdx];
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIdx === null) return;
      if (INITIAL_PUZZLE[selectedIdx] !== 0) return;

      if (e.key >= "1" && e.key <= "9") {
        const newGrid = [...grid];
        newGrid[selectedIdx] = parseInt(e.key);
        setGrid(newGrid);
      }
      if (e.key === "Backspace" || e.key === "Delete") {
        const newGrid = [...grid];
        newGrid[selectedIdx] = null;
        setGrid(newGrid);
      }
      if (e.key === "ArrowRight") setSelectedIdx((prev) => (prev! + 1) % 81);
      if (e.key === "ArrowLeft")
        setSelectedIdx((prev) => (prev! - 1 + 81) % 81);
      if (e.key === "ArrowUp") setSelectedIdx((prev) => (prev! - 9 + 81) % 81);
      if (e.key === "ArrowDown") setSelectedIdx((prev) => (prev! + 9) % 81);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIdx, grid]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <h1 className="text-4xl font-black mb-8 text-gray-900 font-serif tracking-tight">
        Sudokin
      </h1>

      {/* GRID con tamaño fijo garantizado */}
      <div className="grid grid-cols-9 gap-0 border-t-[3px] border-l-[3px] border-black select-none shadow-2xl max-w-fit mx-auto bg-white overflow-hidden">
        {grid.map((cellValue, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;
          const isInitial = INITIAL_PUZZLE[i] !== 0;

          const isRightBlockEnd = col === 2 || col === 5 || col === 8;
          const isBottomBlockEnd = row === 2 || row === 5 || row === 8;

          let borderClass = "";
          if (isRightBlockEnd) borderClass += " border-r-[3px] border-r-black";
          else borderClass += " border-r border-r-gray-400";

          if (isBottomBlockEnd) borderClass += " border-b-[3px] border-b-black";
          else borderClass += " border-b border-b-gray-400";

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

          let forcedBgColor = "#ffffff";
          let forcedTextColor = isInitial ? "#000000" : "#2563eb";

          if (isSelected) {
            forcedBgColor = "#3b82f6";
            forcedTextColor = "#ffffff";
          } else if (isSameValue) {
            forcedBgColor = "#93c5fd";
            forcedTextColor = "#1e3a8a";
          } else if (isPeer) {
            forcedBgColor = "#e2e8f0";
          }

          let zIndexValue = 0;
          if (isRightBlockEnd || isBottomBlockEnd) zIndexValue = 20;
          else if (isSelected) zIndexValue = 10;

          return (
            <div
              key={i}
              onClick={() => setSelectedIdx(i)}
              style={{
                backgroundColor: forcedBgColor,
                zIndex: zIndexValue,
                position: "relative",
              }}
              className={clsx(
                // Mantenemos el tamaño fijo garantizado
                "w-12 h-12 min-w-[48px] min-h-[48px] sm:w-16 sm:h-16 sm:min-w-[64px] sm:min-h-[64px]",
                "flex items-center justify-center cursor-pointer select-none",
                "border-l-0 border-t-0 border-solid bg-clip-padding outline-none",
                borderClass,
                isInitial ? "font-black" : "font-bold",
              )}
            >
              {/* Contenedor con ajuste fino de centrado */}
              <span
                style={{
                  color: forcedTextColor,
                  fontSize: "calc(var(--cell-size) * 0.75)", // Aumentado ligeramente a 85%
                  lineHeight: "1",
                  display: "flex",
                }}
                className={clsx(
                  "items-center justify-center w-full h-full [--cell-size:48px] sm:[--cell-size:64px]",
                  "transform translate-y-[5%] sm:translate-y-[4%]", // <--- ESTO EMPUJA EL NÚMERO HACIA ABAJO
                )}
              >
                {cellValue}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        Respuesta Instantánea • Máxima Visibilidad
      </div>
    </div>
  );
}
