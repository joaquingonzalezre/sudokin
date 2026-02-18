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
}: ControlPadProps) {
  // Estilo para los números
  const numberBtnStyle = {
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "24px",
    color: "#1f2937",
    height: "60px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  // Estilo base gris para acciones
  const actionBtnStyle = {
    backgroundColor: "#e5e7eb", // Gris claro
    border: "none",
    borderRadius: "8px",
    padding: "15px 5px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151", // Gris oscuro
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  // Estilo específico para "Auto Notas" (texto azul)
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

      {/* 2. NUMPAD */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button
            key={num}
            onClick={() => onNumberClick(num)}
            style={numberBtnStyle}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#f3f4f6")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "white")
            }
          >
            {num}
          </button>
        ))}
      </div>

      {/* 3. BOTONES DE ACCIÓN (ORDEN FINAL CORREGIDO) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
        }}
      >
        {/* FILA 1 */}
        <button onClick={onUndoClick} style={actionBtnStyle}>
          Undo
        </button>
        <button onClick={onDeleteClick} style={actionBtnStyle}>
          Borrar
        </button>

        {/* FILA 2 */}
        <button
          onClick={() => setShowCandidates(!showCandidates)}
          style={actionBtnStyle}
        >
          {showCandidates ? "Ocultar Notas" : "Ver Notas"}
        </button>
        <button onClick={onClearCandidatesClick} style={actionBtnStyle}>
          Limpiar Candidatos
        </button>

        {/* FILA 3 (Intercambiados) */}
        {/* Izquierda: Auto Notas */}
        <button onClick={onCreateCandidates} style={autoBtnStyle}>
          Crear Notas
        </button>

        {/* Derecha: Interruptor */}
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
