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

  // --- LÓGICA DE CONFLICTOS ---
  const getAllConflicts = (currentGrid: (number | null)[]) => {
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

      <div
        className="grid grid-cols-9 bg-white relative shadow-2xl max-w-fit mx-auto select-none overflow-hidden"
        // BORDE EXTERNO: 4 solid black
        style={{ border: "4px solid black" }}
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

          // --- CAMBIO AQUÍ: LÓGICA DE COLOR DE FONDO ---
          // Si es inicial, usamos #dfdfdf. Si no, blanco.
          let forcedBgColor = isInitial ? "#dfdfdf" : "#ffffff";

          let forcedTextColor = isInitial ? "#000000" : "#2563eb";

          // Las selecciones y resaltados tienen prioridad y sobrescriben el color base
          if (isSelected) {
            forcedBgColor = "#e69100";
            forcedTextColor = "#ffffff";
          } else if (isSameValue) {
            forcedBgColor = "#e69100";
            forcedTextColor = "#1e3a8a";
          } else if (isPeer) {
            forcedBgColor = "#f9eac2";
          }

          const hasConflict = !isInitial && conflicts.has(i);

          return (
            <div
              key={i}
              onClick={() => setSelectedIdx(i)}
              style={{
                backgroundColor: forcedBgColor,
                zIndex: isSelected ? 10 : 0,
                position: "relative",
                borderRight: thinBorderRight,
                borderBottom: thinBorderBottom,
              }}
              className={clsx(
                "w-12 h-12 min-w-[48px] min-h-[48px] sm:w-16 sm:h-16 sm:min-w-[64px] sm:min-h-[64px]",
                "flex items-center justify-center cursor-pointer select-none",
                "bg-clip-padding outline-none",
                isInitial ? "font-black" : "font-bold",
              )}
            >
              <span
                style={{
                  color: forcedTextColor,
                  fontSize: "calc(var(--cell-size) * 0.75)",
                  lineHeight: "1",
                  display: "flex",
                }}
                className={clsx(
                  "items-center justify-center w-full h-full [--cell-size:48px] sm:[--cell-size:64px]",
                  "transform translate-y-[5%] sm:translate-y-[4%]",
                )}
              >
                {cellValue}
              </span>

              {hasConflict && (
                <div
                  style={{
                    position: "absolute",
                    width: "12px",
                    height: "12px",
                    backgroundColor: "red",
                    borderRadius: "50%",
                    bottom: "10%",
                    right: "10%",
                    zIndex: 50,
                    boxShadow: "0 0 4px rgba(0,0,0,0.3)",
                  }}
                />
              )}
            </div>
          );
        })}

        {/* --- LÍNEAS GRUESAS GRISES (OVERLAY) --- */}
        {/* AJUSTE FINAL:
            - Grosor: 4 (Igual que el borde negro externo)
            - Color: ##979797 (Gris oscuro para buen contraste)
            - Posición: calc(... - 1.5px) para centrar perfectamente una línea de 3px.
        */}

        {/* Vertical 1 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "4px",
            backgroundColor: "#979797",
            left: "calc(33.333% - 1.5px)",
            pointerEvents: "none",
            zIndex: 40,
          }}
        />

        {/* Vertical 2 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: "4px",
            backgroundColor: "#979797",
            left: "calc(66.666% - 1.5px)",
            pointerEvents: "none",
            zIndex: 40,
          }}
        />

        {/* Horizontal 1 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: "#979797",
            top: "calc(33.333% - 1.5px)",
            pointerEvents: "none",
            zIndex: 40,
          }}
        />

        {/* Horizontal 2 */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: "4px",
            backgroundColor: "#979797",
            top: "calc(66.666% - 1.5px)",
            pointerEvents: "none",
            zIndex: 40,
          }}
        />
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        Tablero estilo Clásico • Bordes Perfectos
      </div>
    </div>
  );
}
