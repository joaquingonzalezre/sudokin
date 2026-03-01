import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🛑 EL INTERRUPTOR INTELIGENTE:
  // Si detecta que está en Vercel, enciende el servidor (API).
  // Si estás en tu PC local, lo exporta estático para Capacitor.
  output: process.env.VERCEL ? undefined : "export",

  // (Si tenías otras configuraciones aquí como imágenes, déjalas)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
