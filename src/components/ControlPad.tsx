"use client";

import React from "react";

interface ControlPadProps {
  onNumberClick: (num: number) => void;
  onDeleteClick: () => void;
  onUndoClick: () => void;
  onCreateCandidates: () => void;
  onClearCandidatesClick: () => void;
  inputMode: "normal" | "candidate";
  setInputMode: React.Dispatch<React.SetStateAction<"normal" | "candidate">>;
  showCandidates: boolean;
  setShowCandidates: React.Dispatch<React.SetStateAction<boolean>>;
  smartNotesMode: boolean;
  onToggleSmartNotes: () => void;
  completedNumbers: number[];
}

export default function ControlPad({
  onNumberClick,
  onDeleteClick,
  onUndoClick,
  onCreateCandidates,
  onClearCandidatesClick,
  inputMode,
  setInputMode,
  showCandidates,
  setShowCandidates,
  smartNotesMode,
  onToggleSmartNotes,
  completedNumbers,
}: ControlPadProps) {
  // Estilo base para los números
  const numberBtnStyle = {
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "24px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    transition: "all 0.2s",
  };

  // Estilo base gris para acciones (Filas de 2 columnas)
  const actionBtnStyle = {
    backgroundColor: "#e5e7eb",
    border: "none",
    borderRadius: "8px",
    padding: "15px 5px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
  };

  // Estilo un poco más pequeño para la fila de 3 columnas
  const smallActionBtnStyle = {
    ...actionBtnStyle,
    fontSize: "12px", // Letra más pequeña para que encajen los 3
    padding: "15px 2px",
  };

  const autoBtnStyle = {
    ...actionBtnStyle,
    color: "#374151",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
        maxWidth: "320px",
      }}
    >
      {/* 1. TOGGLE SUPERIOR */}
      <div
        style={{
          display: "flex",
          backgroundColor: "white",
          borderRadius: "20px",
          border: "1px solid black",
          overflow: "hidden",
          height: "40px",
        }}
      >
        <button
          onClick={() => setInputMode("normal")}
          style={{
            flex: 1,
            backgroundColor: inputMode === "normal" ? "black" : "white",
            color: inputMode === "normal" ? "white" : "black",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Normal
        </button>
        <button
          onClick={() => setInputMode("candidate")}
          style={{
            flex: 1,
            backgroundColor: inputMode === "candidate" ? "black" : "white",
            color: inputMode === "candidate" ? "white" : "black",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Candidate
        </button>
      </div>

      {/* 2. NUMPAD CON LÓGICA DE COLORES */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const isCompleted = completedNumbers.includes(num);

          return (
            <button
              key={num}
              onClick={() => onNumberClick(num)}
              disabled={isCompleted}
              style={{
                ...numberBtnStyle,
                backgroundColor: isCompleted ? "#e5e7eb" : "white",
                color: isCompleted ? "#9ca3af" : "#1f2937",
                cursor: isCompleted ? "not-allowed" : "pointer",
              }}
              onMouseOver={(e) => {
                if (!isCompleted)
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseOut={(e) => {
                if (!isCompleted)
                  e.currentTarget.style.backgroundColor = "white";
              }}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* 3. BOTONES DE ACCIÓN (DIVIDIDOS EN 3 FILAS INDEPENDIENTES) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {/* FILA 1: Undo y Borrar (2 columnas) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
          }}
        >
          <button onClick={onUndoClick} style={actionBtnStyle}>
            Undo
          </button>
          <button onClick={onDeleteClick} style={actionBtnStyle}>
            Borrar
          </button>
        </div>

        {/* FILA 2: Ver Notas | RRR | SmartNotes (3 columnas) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
          }}
        >
          <button
            onClick={() => setShowCandidates(!showCandidates)}
            style={smallActionBtnStyle}
          >
            {showCandidates ? "Ocultar Notas" : "Ver Notas"}
          </button>

          <button
            onClick={() => alert("¡Botón RRR presionado!")}
            style={smallActionBtnStyle}
          >
            RRR
          </button>

          <button
            onClick={onToggleSmartNotes}
            style={smallActionBtnStyle}
            title="Recalcular notas automáticamente al escribir"
          >
            SmartNotes: {smartNotesMode ? "ON" : "OFF"}
          </button>
        </div>

        {/* FILA 3: Crear Notas y Limpiar Notas (2 columnas) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
          }}
        >
          <button onClick={onCreateCandidates} style={autoBtnStyle}>
            Crear Notas
          </button>
          <button onClick={onClearCandidatesClick} style={actionBtnStyle}>
            Limpiar Notas
          </button>
        </div>
      </div>
    </div>
  );
}
