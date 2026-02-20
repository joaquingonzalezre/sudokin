"use client";

import React from "react";
import { Difficulty } from "../data/puzzles";
import { HintResult } from "../logic/hints/types";

interface ControlToolsProps {
  hintState: { active: boolean; currentStep: number; data: HintResult | null };
  onNewGame: (difficulty: Difficulty) => void;
  onHint: () => void;
  onCancelHint: () => void;
  onImportClick: () => void;
  isScanning: boolean;
}

export default function ControlTools({
  onNewGame,
  onHint,
  hintState,
  onCancelHint,
  onImportClick,
  isScanning,
}: ControlToolsProps) {
  // Estilo base para los botones
  const btnStyle = {
    backgroundColor: "white",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "10px",
    fontSize: "14px",
    fontWeight: "bold",
    cursor: "pointer",
    color: "#374151",
    width: "100%",
    marginBottom: "8px",
    transition: "all 0.2s",
  };

  const isHintActive = hintState.active && hintState.data;
  const currentStep = hintState.currentStep;
  const totalSteps = hintState.data?.totalSteps || 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "220px",
      }}
    >
      {/* SECCIÓN NUEVO JUEGO */}
      <div>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: "900",
            marginBottom: "10px",
            color: "#111",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Nuevo Sudoku
        </h3>
        <button style={btnStyle} onClick={() => onNewGame("easy")}>
          Fácil
        </button>
        <button style={btnStyle} onClick={() => onNewGame("medium")}>
          Intermedio
        </button>
        <button style={btnStyle} onClick={() => onNewGame("hard")}>
          Difícil
        </button>
        <button style={btnStyle} onClick={() => onNewGame("expert")}>
          Experto
        </button>
        <button style={btnStyle} onClick={() => onNewGame("nightmare")}>
          Nightmare
        </button>

        <button
          onClick={onImportClick}
          disabled={isScanning}
          style={{
            ...btnStyle,
            backgroundColor: isScanning ? "#fcd34d" : "#eff6ff",
            borderColor: isScanning ? "#f59e0b" : "#3b82f6",
            color: isScanning ? "#b45309" : "#1d4ed8",
            cursor: isScanning ? "wait" : "pointer",
            marginTop: "4px",
          }}
        >
          {isScanning ? "Escaneando... ☢️" : "Importar Sudoku 📸"}
        </button>
      </div>

      {/* SECCIÓN PISTAS */}
      <div>
        {/* Botón Principal de Pistas con el CONTADOR INTEGRADO */}
        <button
          onClick={onHint}
          style={{
            ...btnStyle,
            backgroundColor: isHintActive ? "#3b82f6" : "#fef3c7",
            borderColor: isHintActive ? "#2563eb" : "#f59e0b",
            color: isHintActive ? "white" : "#d97706",
            marginBottom: "8px",
          }}
        >
          {!isHintActive
            ? "💡 Pedir Pista"
            : currentStep + 1 === totalSteps
              ? `✨ Aplicar Jugada (${currentStep + 1}/${totalSteps})`
              : `➡️ Siguiente Paso (${currentStep + 1}/${totalSteps})`}
        </button>

        {/* CAJA DE TEXTO FIJA (Con la X incrustada) */}
        <div
          style={{
            border: "2px solid #f59e0b",
            borderRadius: "8px",
            padding: "16px 12px 12px 12px", // Un poco más de espacio arriba para la X
            minHeight: "100px",
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)",
            position: "relative", // <-- CLAVE: Permite poner la X en la esquina
          }}
        >
          {/* EL BOTÓN DE LA X EN LA ESQUINA SUPERIOR DERECHA */}
          {isHintActive && (
            <button
              onClick={onCancelHint}
              title="Cancelar Pista"
              style={{
                position: "absolute",
                top: "4px",
                right: "6px",
                background: "transparent",
                border: "none",
                color: "#ef4444", // Rojo
                fontSize: "14px",
                fontWeight: "900",
                cursor: "pointer",
                padding: "2px",
                lineHeight: "1",
                fontFamily: "Arial, sans-serif",
              }}
            >
              ✖
            </button>
          )}

          {isHintActive ? (
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#1e3a8a",
                lineHeight: "1.4",
                fontWeight: "bold",
              }}
            >
              {hintState.data!.steps[currentStep].message}
            </p>
          ) : (
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                color: "#9ca3af",
                fontStyle: "italic",
              }}
            >
              (Presiona el botón "Pedir Pista" para recibir ayuda)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
