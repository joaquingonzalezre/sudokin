import type { Metadata } from "next";
import "./globals.css"; // <--- Verifica que esta línea exista

export const metadata: Metadata = {
  title: "Sudokin",
  description: "Un Sudoku moderno inspirado en KIN",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
