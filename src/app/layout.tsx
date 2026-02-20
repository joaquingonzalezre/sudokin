import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SudoKin",
  description: "Un Sudoku moderno inspirado en KIN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>{/* ... tus metadatos ... */}</head>
      <body className={inter.className}>
        {children}
        {/* AGREGA ESTA LÍNEA AL FINAL ANTES DE CERRAR BODY */}
      </body>
    </html>
  );
}
