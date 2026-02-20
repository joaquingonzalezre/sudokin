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
  // --- NUEVO: RECIBIMOS LA LISTA DE NÚMEROS COMPLETADOS ---
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
  completedNumbers, // Lo extraemos aquí
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

  // Estilo base gris para acciones
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
          // Revisamos si el número actual ya está 9 veces en el tablero
          const isCompleted = completedNumbers.includes(num);

          return (
            <button
              key={num}
              onClick={() => onNumberClick(num)}
              disabled={isCompleted} // Desactivamos el botón si ya está completado
              style={{
                ...numberBtnStyle,
                // Si está completado, se vuelve gris opaco; si no, es blanco normal
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

      {/* 3. BOTONES DE ACCIÓN */}
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

        <button
          onClick={() => setShowCandidates(!showCandidates)}
          style={actionBtnStyle}
        >
          {showCandidates ? "Ocultar Notas" : "Ver Notas"}
        </button>
        <button onClick={onClearCandidatesClick} style={actionBtnStyle}>
          Limpiar Candidatos
        </button>

        <button onClick={onCreateCandidates} style={autoBtnStyle}>
          Crear Notas
        </button>

        <button
          onClick={onToggleSmartNotes}
          style={actionBtnStyle}
          title="Recalcular notas automáticamente al escribir"
        >
          SmartNotes: {smartNotesMode ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
}
