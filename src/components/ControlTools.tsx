"use client";

import React from "react";
import { HintData } from "../logic/hintManager";
import { Difficulty } from "../data/puzzles";

// Re-introducimos el icono para el botón pequeño
const BulbIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

interface ControlToolsProps {
  hintState: { active: boolean; level: number; data: HintData | null };
  onNewGame: (difficulty: Difficulty) => void;
  onHint: () => void; // <--- NUEVA PROP: Recibimos la función de pista
}

export default function ControlTools({
  hintState,
  onNewGame,
  onHint,
}: ControlToolsProps) {
  const diffBtnStyle = {
    backgroundColor: "white",
    border: "1px solid #9ca3af",
    borderRadius: "6px",
    padding: "10px",
    fontSize: "16px",
    fontWeight: "500",
    color: "#000",
    cursor: "pointer",
    transition: "background 0.2s",
    textAlign: "center" as const,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  };

  // Cálculo del progreso visual
  const progressPercent = hintState.active ? (hintState.level / 5) * 100 : 0;
  const progressColor = "linear-gradient(90deg, #fffbeb 0%, #fcd34d 100%)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        width: "100%",
        maxWidth: "320px",
        marginTop: "10px",
      }}
    >
      {/* SECCIÓN SUPERIOR: CREAR NUEVO SUDOKU */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: "#000",
            textAlign: "center",
            marginBottom: "5px",
          }}
        >
          Crear nuevo Sudoku
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
          }}
        >
          <button style={diffBtnStyle} onClick={() => onNewGame("easy")}>
            facil
          </button>
          <button style={diffBtnStyle} onClick={() => onNewGame("medium")}>
            intermedio
          </button>
          <button style={diffBtnStyle} onClick={() => onNewGame("hard")}>
            dificil
          </button>
          <button style={diffBtnStyle} onClick={() => onNewGame("expert")}>
            experto
          </button>
          <button style={diffBtnStyle} onClick={() => onNewGame("dailies")}>
            dailies
          </button>
          <button style={diffBtnStyle} onClick={() => onNewGame("nightmare")}>
            nightmare
          </button>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: CAJA DE HINTS */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "5px",
          marginTop: "20px",
        }}
      >
        {/* --- AQUÍ ESTÁ EL CAMBIO: TÍTULO + BOTÓN --- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "5px",
          }}
        >
          {/* NUEVO BOTÓN DE HINT (Pequeño y Naranja) */}
          <button
            onClick={onHint}
            title="Pedir Pista"
            style={{
              backgroundColor: "#d97706",
              color: "white",
              border: "none",
              borderRadius: "50%", // Redondo
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              transition: "transform 0.1s",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.9)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <BulbIcon />
          </button>

          {/* TEXTO DE ESTADO */}
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#d97706",
              margin: 0,
            }}
          >
            Hints ({hintState.active ? hintState.level : 0}/5)
          </h3>
        </div>
        {/* ------------------------------------------- */}

        {/* CAJA DE TEXTO (Igual que antes) */}
        <div
          style={{
            position: "relative",
            backgroundColor: "white",
            border: "2px solid #d97706",
            borderRadius: "8px",
            minHeight: "150px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          {/* BARRA DE PROGRESO */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: `${progressPercent}%`,
              background: progressColor,
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 0,
              borderRight: progressPercent > 0 ? "2px solid #d97706" : "none",
            }}
          />

          {/* CONTENIDO TEXTO */}
          <div
            style={{
              position: "relative",
              zIndex: 10,
              padding: "20px",
              textAlign: "center",
              color: "#1f2937",
              fontSize: "14px",
              lineHeight: "1.5",
              width: "100%",
            }}
          >
            {hintState.active && hintState.data ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <p
                  style={{
                    marginBottom: "10px",
                    fontWeight: "600",
                    fontSize: "15px",
                  }}
                >
                  📦 Pista Nivel {hintState.level}:
                </p>
                <p>
                  {hintState.data.levels[hintState.level as 1 | 2 | 3 | 4 | 5]}
                </p>
              </div>
            ) : (
              <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                (Presiona el foco o el botón Hint para recibir ayuda)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
