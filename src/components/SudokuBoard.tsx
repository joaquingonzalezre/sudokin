"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";

// 1. DEFINIMOS EL PUZZLE AQUÍ MISMO PARA EVITAR PROBLEMAS DE IMPORTACIÓN
const INITIAL_PUZZLE = [
  8, 0, 1, 0, 9, 0, 0, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 6, 0, 0, 7, 0, 0,
  0, 0, 0, 2, 5, 0, 0, 0, 0, 0, 5, 0, 0, 0, 7, 3, 0, 0, 2, 7, 0, 0, 9, 2, 1, 5,
  0, 0, 0, 2, 7, 0, 0, 6, 9, 0, 3, 0, 0, 0, 0, 0, 0, 6, 0, 0, 0, 0, 3, 7, 1, 0,
  0, 5, 0,
];

export default function SudokuBoard() {
  // Estado del Grid
  const [grid, setGrid] = useState<(number | null)[]>(
    INITIAL_PUZZLE.map((n) => (n === 0 ? null : n)),
  );
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  // --- NUEVA LÓGICA DE DETECCIÓN DE CONFLICTOS (INFALIBLE) ---
  // Esta función se ejecuta en CADA renderizado y calcula TODOS los errores
  const getAllConflicts = (currentGrid: (number | null)[]) => {
    const conflictSet = new Set<number>();

    for (let i = 0; i < 81; i++) {
      if (!currentGrid[i]) continue; // Si está vacío, saltar

      const val = currentGrid[i];
      const row = Math.floor(i / 9);
      const col = i % 9;
      const boxRow = Math.floor(row / 3);
      const boxCol = Math.floor(col / 3);

      // Comparamos contra todas las otras celdas
      for (let j = 0; j < 81; j++) {
        if (i === j) continue; // No compararse consigo mismo
        if (currentGrid[j] !== val) continue; // Solo nos importan los números iguales

        const targetRow = Math.floor(j / 9);
        const targetCol = j % 9;

        // Verificamos si chocan en Fila, Columna o Caja
        const isSameRow = row === targetRow;
        const isSameCol = col === targetCol;
        const isSameBox =
          Math.floor(targetRow / 3) === boxRow &&
          Math.floor(targetCol / 3) === boxCol;

        if (isSameRow || isSameCol || isSameBox) {
          conflictSet.add(i); // Marcamos la celda 'i' como conflictiva
        }
      }
    }
    return conflictSet;
  };

  // Calculamos los conflictos actuales
  const conflicts = getAllConflicts(grid);
  // -------------------------------------------------------------

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

          // --- VERIFICACIÓN DE ERROR FINAL ---
          // Simplemente preguntamos: ¿Está este índice en la lista negra de conflictos?
          // Y nos aseguramos de no marcar las pistas iniciales (opcional, si quieres ver error en pistas quita el !isInitial)
          const hasConflict = !isInitial && conflicts.has(i);

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
                "w-12 h-12 min-w-[48px] min-h-[48px] sm:w-16 sm:h-16 sm:min-w-[64px] sm:min-h-[64px]",
                "flex items-center justify-center cursor-pointer select-none",
                "border-l-0 border-t-0 border-solid bg-clip-padding outline-none",
                borderClass,
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

              {/* --- PUNTO ROJO DE ERROR (FORZADO) --- */}
              {/* Usamos estilos directos para que nada lo oculte */}
              {hasConflict && (
                <div
                  style={{
                    position: "absolute",
                    width: "12px", // Tamaño fijo visible
                    height: "12px",
                    backgroundColor: "red", // Rojo puro estándar
                    borderRadius: "50%",
                    bottom: "10%",
                    right: "10%",
                    zIndex: 50, // Z-index muy alto para que flote sobre todo
                    boxShadow: "0 0 4px rgba(0,0,0,0.3)", // Sombrita para contraste
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        Sistema de Errores Activo
      </div>
    </div>
  );
}
