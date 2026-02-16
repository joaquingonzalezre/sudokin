"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

const INITIAL_PUZZLE = [
  8, 0, 1, 0, 9, 0, 0, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 6, 0, 0, 7, 0, 0,
  0, 0, 0, 2, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 7, 3, 0, 0, 2, 7, 0, 0, 9, 2, 1, 5,
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

      <div className="grid grid-cols-9 gap-0 border-t-[3px] border-l-[3px] border-black select-none shadow-2xl max-w-fit mx-auto bg-white">
        {grid.map((cellValue, i) => {
          const row = Math.floor(i / 9);
          const col = i % 9;
          const isInitial = INITIAL_PUZZLE[i] !== 0;

          // Variables de Borde
          const isRightBlockEnd = col === 2 || col === 5 || col === 8;
          const isBottomBlockEnd = row === 2 || row === 5 || row === 8;

          let borderClass = "";

          // Borde DERECHO
          if (isRightBlockEnd) borderClass += " border-r-[3px] border-r-black";
          else borderClass += " border-r border-r-gray-400";

          // Borde INFERIOR
          if (isBottomBlockEnd) borderClass += " border-b-[3px] border-b-black";
          else borderClass += " border-b border-b-gray-400";

          // LÓGICA DE COLORES
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
          let forcedTextColor = undefined;

          if (isSelected) {
            forcedBgColor = "#3b82f6";
            forcedTextColor = "#000000";
          } else if (isSameValue) {
            forcedBgColor = "#93c5fd";
            forcedTextColor = "#1e3a8a";
          } else if (isPeer) {
            forcedBgColor = "#e2e8f0";
            if (!isInitial && cellValue) forcedTextColor = "#2563eb";
          } else {
            if (!isInitial && cellValue) forcedTextColor = "#2563eb";
          }

          // Lógica Z-Index (Mantiene los bordes negros visibles)
          let zIndexValue = 0;
          if (isRightBlockEnd || isBottomBlockEnd) {
            zIndexValue = 20;
          } else if (isSelected) {
            zIndexValue = 10;
          } else {
            zIndexValue = 0;
          }

          return (
            <div
              key={i}
              onClick={() => setSelectedIdx(i)}
              style={{
                backgroundColor: forcedBgColor,
                color: forcedTextColor,
                zIndex: zIndexValue,
                position: "relative",
              }}
              className={clsx(
                // 1. DIMENSIONES DEL CUADRO (No tocar)
                "w-12 h-12 min-w-[48px] min-h-[48px] sm:w-14 sm:h-14 sm:min-w-[56px] sm:min-h-[56px]",

                // 2. TAMAÑO DE LA LETRA (¡AQUÍ ES!)
                // Asegúrate de que diga text-3xl (móvil) y sm:text-4xl (PC)
                "flex items-center justify-center text-3xl sm:text-4xl cursor-pointer select-none",

                // 3. Resto de estilos...
                "border-l-0 border-t-0 border-solid",
                "bg-clip-padding outline-none",
                borderClass,
                isInitial ? "font-black" : "font-bold",
              )}
            >
              {cellValue}
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        Respuesta Instantánea (Sin ghosting)
      </div>
    </div>
  );
}
