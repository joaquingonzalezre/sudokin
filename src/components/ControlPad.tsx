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
  onRestoreNotesClick: () => void;
  hasManualNotesBackup: boolean;
  isWeb?: boolean;
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
  onRestoreNotesClick,
  hasManualNotesBackup,
  isWeb = false,
}: ControlPadProps) {
  const numberBtnStyle = {
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: isWeb ? "26px" : "clamp(16px, 5vw, 24px)",
    aspectRatio: isWeb ? "auto" : "1/1",
    height: isWeb ? "64px" : "auto",
    width: "100%",
    padding: "0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    transition: "all 0.2s",
  };

  const actionBtnStyle = {
    backgroundColor: "#e5e7eb",
    border: "none",
    borderRadius: "8px",
    padding: isWeb ? "12px 4px" : "10px 4px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center" as const,
  };

  const smallActionBtnStyle = {
    ...actionBtnStyle,
    fontSize: "11px",
    padding: isWeb ? "12px 2px" : "10px 2px",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: isWeb ? "16px" : "8px",
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* 1. TOGGLE SUPERIOR */}
      <div
        style={{
          display: "flex",
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid black",
          overflow: "hidden",
          height: isWeb ? "48px" : "40px",
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

      {/* 2. NUMPAD DINÁMICO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isWeb ? "repeat(3, 1fr)" : "repeat(9, 1fr)",
          gap: isWeb ? "8px" : "2px",
          width: "100%",
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
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* 3. BOTONES DE ACCIÓN (¡Botón Auto IA Eliminado!) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "8px",
          }}
        >
          <button onClick={onUndoClick} style={actionBtnStyle}>
            Undo
          </button>
          <button onClick={onDeleteClick} style={actionBtnStyle}>
            Borrar
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "6px",
          }}
        >
          <button
            onClick={() => setShowCandidates(!showCandidates)}
            style={smallActionBtnStyle}
          >
            {showCandidates ? "Ocultar Notas" : "Ver Notas"}
          </button>
          <button
            onClick={onRestoreNotesClick}
            style={{
              ...smallActionBtnStyle,
              backgroundColor: hasManualNotesBackup ? "#dbeafe" : "#e5e7eb",
              color: hasManualNotesBackup ? "#1e40af" : "#374151",
            }}
          >
            {hasManualNotesBackup ? "Volver a Mis Notas" : "Mis Notas"}
          </button>
          <button onClick={onToggleSmartNotes} style={smallActionBtnStyle}>
            SmartNotes: {smartNotesMode ? "ON" : "OFF"}
          </button>
        </div>
        {/* Nueva Fila Inferior de 2 Columnas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "6px",
          }}
        >
          <button
            onClick={onCreateCandidates}
            style={{ ...smallActionBtnStyle, color: "#374151" }}
          >
            Crear Notas
          </button>
          <button onClick={onClearCandidatesClick} style={smallActionBtnStyle}>
            Limpiar Notas
          </button>
        </div>
      </div>
    </div>
  );
}
