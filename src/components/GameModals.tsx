import React, { RefObject, useState, useMemo } from "react";
import { Difficulty } from "../data/puzzles";

// --- ÍCONOS EXCLUSIVOS DE LOS MODALES ---
// (No cambian...)
const PauseIcon = () => (
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
    <rect x="6" y="4" width="4" height="16" />
    <rect x="14" y="4" width="4" height="16" />
  </svg>
);
const PlayIcon = () => (
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
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const ReloadIcon = () => (
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
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);
const CameraIcon = () => (
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
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
    <circle cx="12" cy="13" r="4"></circle>
  </svg>
);

// --- CÁSCARA DEL MODAL REUTILIZABLE ---
const Modal = ({
  title,
  children,
  icon,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
}) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 100,
      backgroundColor: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      animation: "fadeIn 0.2s ease-out",
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        width: "90%",
        maxWidth: "400px",
        textAlign: "center",
        border: "4px solid black",
        position: "relative",
      }}
    >
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "15px",
            background: "none",
            border: "none",
            fontSize: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            color: "gray",
          }}
        >
          ✖
        </button>
      )}
      {icon && (
        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
      )}
      <h2
        style={{
          fontSize: "32px",
          fontWeight: "900",
          marginBottom: "20px",
          color: "#111",
          fontFamily: "Arial, sans-serif",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  </div>
);

// --- PROPS QUE NECESITA EL ORQUESTADOR ---
interface GameModalsProps {
  showDifficultyModal: boolean;
  setShowDifficultyModal: (show: boolean) => void;
  handleNewGame: (difficulty: Difficulty, specificId?: number) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isScanning: boolean;
  isPaused: boolean;
  isGameWon: boolean;
  timeFormatted: string;
  handlePauseToggle: () => void;
  autoPauseEnabled: boolean;
  setAutoPauseEnabled: (enabled: boolean) => void;
  handleRestart: () => void;
  onToggleWinModal: () => void;
  totalSudokusCount: number;
}

export default function GameModals({
  showDifficultyModal,
  setShowDifficultyModal,
  handleNewGame,
  fileInputRef,
  isScanning,
  isPaused,
  isGameWon,
  timeFormatted,
  handlePauseToggle,
  autoPauseEnabled,
  setAutoPauseEnabled,
  handleRestart,
  onToggleWinModal,
  totalSudokusCount,
}: GameModalsProps) {
  const [tempDifficulty, setTempDifficulty] = useState<Difficulty | null>(null);
  const [selectedId, setSelectedId] = useState<number>(1);

  const quadrantRanges = useMemo(() => {
    const q = Math.floor(totalSudokusCount / 4);
    return {
      easy: { min: 1, max: q },
      medium: { min: q + 1, max: q * 2 },
      hard: { min: q * 2 + 1, max: q * 3 },
      expert: { min: q * 3 + 1, max: totalSudokusCount },
    };
  }, [totalSudokusCount]);

  const handleDifficultySelect = (diff: Difficulty) => {
    setTempDifficulty(diff);
    if (diff !== "importado") {
      setSelectedId(quadrantRanges[diff].min);
    }
  };

  const closeModal = () => {
    setShowDifficultyModal(false);
    setTempDifficulty(null);
  };

  return (
    <>
      {/* 1. MODAL DE DIFICULTAD */}
      {showDifficultyModal && (
        <Modal
          title={!tempDifficulty ? "Elige Dificultad" : "Selecciona Nivel"} // <-- TEXTO DEL TÍTULO DE LAS VENTANAS
          onClose={closeModal}
        >
          {!tempDifficulty ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
              }}
            >
              {(["easy", "medium", "hard", "expert"] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  style={{
                    padding: "16px",
                    border: "2px solid #e5e7eb",
                    borderRadius: "12px",
                    fontWeight: "900",
                    backgroundColor: "white",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    fontSize: "14px",
                    letterSpacing: "1px",
                  }}
                  onClick={() => handleDifficultySelect(diff)}
                >
                  {diff === "easy" ? "Fácil" : diff === "medium" ? "Intermedio" : diff === "hard" ? "Difícil" : "Experto"}
                </button>
              ))}

              <button
                onClick={() => {
                  setShowDifficultyModal(false);
                  fileInputRef.current?.click();
                }}
                disabled={isScanning}
                style={{
                  gridColumn: "span 2",
                  padding: "16px",
                  border: "2px solid #3b82f6",
                  borderRadius: "12px",
                  fontWeight: "bold",
                  backgroundColor: isScanning ? "#fcd34d" : "#eff6ff",
                  borderColor: "#3b82f6",
                  color: "#1d4ed8",
                  cursor: isScanning ? "wait" : "pointer",
                  marginTop: "10px",
                }}
              >
                {isScanning ? "Escaneando..." : "Importar Sudoku 📸"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div
                style={{
                  backgroundColor: "#fef3c7",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "2px solid #f59e0b",
                  fontWeight: "900",
                  textTransform: "uppercase",
                  color: "#d97706",
                }}
              >
                {tempDifficulty === "easy" ? "Fácil" : tempDifficulty === "medium" ? "Intermedio" : tempDifficulty === "hard" ? "Difícil" : "Experto"} {/* <-- TEXTO DE LA DIFICULTAD SELECCIONADA */}
              </div>

              <div style={{ padding: "0 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center" }}>
                  <span style={{ fontWeight: "bold", color: "#6b7280", fontSize: "12px" }}>+fácil</span>
                  <span style={{ fontWeight: "900", color: "#ef4444", fontSize: "18px" }}>Sudoku {selectedId}</span>
                  <span style={{ fontWeight: "bold", color: "#6b7280", fontSize: "12px" }}>+difícil</span>
                </div>

                <input
                  type="range"
                  min={quadrantRanges[tempDifficulty as keyof typeof quadrantRanges].min}
                  max={quadrantRanges[tempDifficulty as keyof typeof quadrantRanges].max}
                  value={selectedId}
                  onChange={(e) => setSelectedId(parseInt(e.target.value))}
                  style={{
                    width: "100%",
                    cursor: "pointer",
                    height: "8px",
                    accentColor: "black"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <button
                  style={{
                    padding: "14px",
                    border: "2px solid #d1d5db",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    backgroundColor: "white",
                    cursor: "pointer",
                  }}
                  onClick={() => setTempDifficulty(null)}
                >
                  Atrás {/* <-- TEXTO BOTÓN VOLVER */}
                </button>
                <button
                  style={{
                    padding: "14px",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "900",
                    backgroundColor: "black",
                    color: "white",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                  onClick={() => {
                    handleNewGame(tempDifficulty, selectedId);
                    setTempDifficulty(null);
                  }}
                >
                  ¡Jugar! {/* <-- TEXTO BOTÓN CONFIRMAR */}
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* 2. MODAL DE PAUSA / ESCÁNER */}
      {isPaused && !isGameWon && (
        <Modal
          title={isScanning ? "Procesando Imagen..." : "Juego en Pausa"}
          icon={
            <div style={{ transform: "scale(1.5)", color: "gray" }}>
              {isScanning ? <CameraIcon /> : <PauseIcon />}
            </div>
          }
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {isScanning ? (
              <p style={{ fontSize: "18px", color: "gray" }}>
                Escaneando celda por celda...
              </p>
            ) : (
              <>
                <p style={{ fontSize: "18px", color: "gray" }}>
                  Tu tiempo actual: <strong>{timeFormatted}</strong>
                </p>
                <button
                  onClick={handlePauseToggle}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "16px",
                    backgroundColor: "black",
                    color: "white",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    fontSize: "18px",
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  <PlayIcon /> Reanudar
                </button>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    alignSelf: "flex-start",
                    marginTop: "8px",
                  }}
                >
                  <input
                    type="checkbox"
                    id="autoPauseCheck"
                    checked={autoPauseEnabled}
                    onChange={() => setAutoPauseEnabled(!autoPauseEnabled)}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <label
                    htmlFor="autoPauseCheck"
                    style={{
                      fontSize: "14px",
                      cursor: "pointer",
                      color: "#4b5563",
                    }}
                  >
                    Pausa automática
                  </label>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* 3. MODAL DE VICTORIA */}
      {isGameWon && (
        <Modal
          title="¡Felicidades!"
          icon={<div style={{ fontSize: "60px" }}>🏆</div>}
          onClose={onToggleWinModal}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <p style={{ fontSize: "18px", color: "gray" }}>
              ¡Has completado el Sudoku!
            </p>
            <div
              style={{
                backgroundColor: "#f3f4f6",
                padding: "16px",
                borderRadius: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  color: "gray",
                  fontWeight: "bold",
                }}
              >
                Tiempo Final
              </div>
              <div
                style={{ fontSize: "36px", fontWeight: "900", color: "black" }}
              >
                {timeFormatted}
              </div>
            </div>
            <button
              onClick={handleRestart}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                padding: "16px",
                backgroundColor: "black",
                color: "white",
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "18px",
                border: "none",
                cursor: "pointer",
              }}
            >
              <ReloadIcon /> Jugar otra vez
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
