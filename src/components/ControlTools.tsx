"use client";

import React from "react";
import { HintResult } from "../logic/hints/types";

// 🛑 Ya no necesitamos Difficulty, onNewGame ni onImportProps
interface ControlToolsProps {
  hintState: { active: boolean; currentStep: number; data: HintResult | null };
  onHint: () => void;
  onCancelHint: () => void;
}

export default function ControlTools({
  onHint,
  hintState,
  onCancelHint,
}: ControlToolsProps) {
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
        width: "100%",
        margin: "0 auto",
      }}
    >
      {/* SECCIÓN PISTAS - ÚNICA RESPONSABILIDAD AHORA */}
      <div style={{ position: "relative" }}>
        {isHintActive && (
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: 0,
              right: 0,
              marginBottom: "8px",
              border: "2px solid #f59e0b",
              borderRadius: "8px",
              padding: "16px 12px 12px 12px",
              minHeight: "80px",
              backgroundColor: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0 -4px 12px rgba(0,0,0,0.15), inset 0 2px 4px rgba(0,0,0,0.05)",
              zIndex: 50,
            }}
          >
            <button
              onClick={onCancelHint}
              title="Cancelar Pista"
              style={{
                position: "absolute",
                top: "4px",
                right: "6px",
                background: "transparent",
                border: "none",
                color: "#ef4444",
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
          </div>
        )}

        <button
          onClick={onHint}
          style={{
            ...btnStyle,
            backgroundColor: isHintActive ? "#3b82f6" : "#fef3c7",
            borderColor: isHintActive ? "#2563eb" : "#f59e0b",
            color: isHintActive ? "white" : "#d97706",
            marginBottom: 0,
            padding: "12px",
            fontSize: "16px",
          }}
        >
          {!isHintActive
            ? "💡 Pedir Pista"
            : currentStep + 1 === totalSteps
              ? `✨ Aplicar Jugada (${currentStep + 1}/${totalSteps})`
              : `➡️ Siguiente Paso (${currentStep + 1}/${totalSteps})`}
        </button>
      </div>
    </div>
  );
}
