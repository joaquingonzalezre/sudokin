"use client";
import React from "react";

const PauseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);
const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const ReloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
// 🛑 NUEVO ÍCONO DE "MÁS" PARA EL BOTÓN DIVIDIDO
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

interface GameHeaderProps {
  timeFormatted: string;
  isPaused: boolean;
  onPauseToggle: () => void;
  onResetCurrent: () => void;
  onNewGameClick: () => void;
  currentDifficulty: string | null; // 🛑 NUEVA PROP: Recibe la dificultad actual
}

export default function GameHeader({
  timeFormatted,
  isPaused,
  onPauseToggle,
  onResetCurrent,
  onNewGameClick,
  currentDifficulty,
}: GameHeaderProps) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
      }}
    >
      {/* 🛑 PANEL IZQUIERDO: LÓGICA DE BOTÓN DINÁMICO */}
      {currentDifficulty ? (
        // DISEÑO 2: Botón Dividido (Juego Cargado)
        <div
          style={{
            height: "48px",
            display: "flex",
            borderRadius: "14px",
            border: "2px solid #111",
            overflow: "hidden",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <button
            onClick={onNewGameClick}
            title="Nuevo Juego"
            style={{
              backgroundColor: "#111",
              color: "white",
              border: "none",
              padding: "0 14px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PlusIcon />
          </button>
          <div
            style={{
              backgroundColor: "white",
              color: "#111",
              padding: "0 14px",
              fontWeight: "900",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            {currentDifficulty}
          </div>
        </div>
      ) : (
        // DISEÑO 1: Botón Clásico (Tablero Vacío)
        <button
          onClick={onNewGameClick}
          style={{
            height: "48px",
            padding: "0 18px",
            backgroundColor: "#111",
            color: "white",
            borderRadius: "14px",
            border: "none",
            fontWeight: "bold",
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          🎮 Nuevo Juego
        </button>
      )}

      {/* PANEL DERECHO: Tiempo + Controles */}
      <div
        style={{
          height: "48px",
          display: "flex",
          alignItems: "center",
          padding: "0 10px 0 16px",
          backgroundColor: "white",
          borderRadius: "14px",
          border: "1px solid #d1d5db",
          boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        }}
      >
        <span
          style={{
            fontSize: "22px",
            fontWeight: "900",
            fontFamily: "monospace",
            color: "#1f2937",
            letterSpacing: "1px",
          }}
        >
          {timeFormatted}
        </span>
        <div
          style={{
            width: "1px",
            height: "24px",
            backgroundColor: "#e5e7eb",
            margin: "0 12px",
          }}
        ></div>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={onPauseToggle}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              display: "flex",
              color: "#6b7280",
            }}
          >
            {isPaused ? <PlayIcon /> : <PauseIcon />}
          </button>
          <button
            onClick={onResetCurrent}
            style={{
              padding: "8px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              display: "flex",
              color: "#6b7280",
            }}
          >
            <ReloadIcon />
          </button>
        </div>
      </div>
    </div>
  );
}
