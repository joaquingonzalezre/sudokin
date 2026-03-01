"use client";
import React from "react";

interface ResponsiveLayoutProps {
  isWeb: boolean;
  // Las "piezas de Lego" que este layout va a acomodar:
  leftPanelWeb: React.ReactNode; // Dificultades y pistas (Para Web)
  centerPanel: React.ReactNode; // El Tablero (Para Web y Móvil)
  rightPanelWeb: React.ReactNode; // Teclado y Tiempo (Para Web)
  mobileHeader: React.ReactNode; // Header compacto (Para Móvil)
  mobileFooter: React.ReactNode; // Controles apilados (Para Móvil)
}

export default function ResponsiveLayout({
  isWeb,
  leftPanelWeb,
  centerPanel,
  rightPanelWeb,
  mobileHeader,
  mobileFooter,
}: ResponsiveLayoutProps) {
  // 💻 SI EL RADAR DETECTA UNA PC (DISEÑO DE 3 COLUMNAS)
  if (isWeb) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: "40px",
          padding: "40px",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Columna Izquierda (250px) */}
        <div
          style={{
            width: "250px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {leftPanelWeb}
        </div>

        {/* Columna Central (Tablero) */}
        <div style={{ width: "500px", flexShrink: 0 }}>{centerPanel}</div>

        {/* Columna Derecha (250px) */}
        <div
          style={{
            width: "250px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {rightPanelWeb}
        </div>
      </div>
    );
  }

  // 📱 SI EL RADAR DETECTA UN CELULAR (DISEÑO APILADO ORIGINAL)
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        width: "calc(100% - 4px)",
        maxWidth: "450px",
        margin: "0 auto",
      }}
    >
      {mobileHeader}
      {centerPanel}
      {mobileFooter}
    </div>
  );
}
