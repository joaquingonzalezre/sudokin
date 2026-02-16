"use client";

import React from "react";
import clsx from "clsx";

// Definimos qué funciones necesita este panel para funcionar
interface ControlPadProps {
  onNumberClick: (num: number) => void;
  onDeleteClick: () => void;
  onUndoClick: () => void;
  onCreateCandidates: () => void;
  inputMode: "normal" | "candidate";
  setInputMode: (mode: "normal" | "candidate") => void;
  showCandidates: boolean;
  setShowCandidates: (show: boolean) => void;
}

export default function ControlPad({
  onNumberClick,
  onDeleteClick,
  onUndoClick,
  onCreateCandidates,
  inputMode,
  setInputMode,
  showCandidates,
  setShowCandidates,
}: ControlPadProps) {
  // Estilo base para los números
  const numButtonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    border: "1px solid #ccc",
    fontSize: "32px",
    fontFamily: "Arial, sans-serif",
    color: "#333",
    cursor: "pointer",
    userSelect: "none" as "none",
    height: "70px",
    borderRadius: "5px",
    transition: "background-color 0.1s",
  };

  // Estilo específico para los botones de acción
  const actionButtonStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    border: "none",
    fontSize: "18px",
    fontFamily: "Arial, sans-serif",
    color: "#333",
    cursor: "pointer",
    userSelect: "none" as "none",
    height: "60px",
    borderRadius: "10px",
    fontWeight: "bold",
  };

  const containerStyle = {
    width: "300px",
    display: "flex",
    flexDirection: "column" as "column",
    gap: "20px",
  };

  return (
    <div style={containerStyle}>
      {/* 1. SECCIÓN TOGGLE */}
      <div
        style={{
          display: "flex",
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid #333",
        }}
      >
        <div
          onClick={() => setInputMode("normal")}
          style={{
            flex: 1,
            padding: "12px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: inputMode === "normal" ? "black" : "white",
            color: inputMode === "normal" ? "white" : "black",
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            fontSize: "14px",
          }}
        >
          Normal
        </div>
        <div
          onClick={() => setInputMode("candidate")}
          style={{
            flex: 1,
            padding: "12px",
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: inputMode === "candidate" ? "black" : "white",
            color: inputMode === "candidate" ? "white" : "black",
            fontFamily: "Arial, sans-serif",
            fontWeight: "bold",
            fontSize: "14px",
            borderLeft: "1px solid #333",
          }}
        >
          Candidate
        </div>
      </div>

      {/* 2. TECLADO NUMÉRICO (Grid 3x3) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "8px",
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <div
            key={num}
            onClick={() => onNumberClick(num)}
            style={numButtonStyle}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#e0e0e0")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "white")
            }
          >
            {num}
          </div>
        ))}
      </div>

      {/* 3. SECCIÓN ACCIONES (Grid 2x2) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
        }}
      >
        <button onClick={onUndoClick} style={actionButtonStyle}>
          Undo
        </button>
        <button onClick={onDeleteClick} style={actionButtonStyle}>
          Borrar
        </button>

        {/* Botón de Visibilidad (Toggle Show Candidates) */}
        <button
          onClick={() => setShowCandidates(!showCandidates)}
          style={{ ...actionButtonStyle, fontSize: "14px" }}
        >
          {showCandidates ? "Ocultar Notas" : "Ver Notas"}
        </button>

        {/* Botón de Calcular Candidatos */}
        <button
          onClick={onCreateCandidates}
          style={{ ...actionButtonStyle, fontSize: "14px", color: "#2563eb" }}
        >
          Auto Notas
        </button>
      </div>
    </div>
  );
}
