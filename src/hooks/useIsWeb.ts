"use client";
import { useState, useEffect } from "react";

export function useIsWeb() {
  const [isWeb, setIsWeb] = useState(false);
  // Añadimos un estado para saber si la app ya cargó (Evita errores de Next.js)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Confirma que ya estamos en el navegador del cliente

    const checkScreenSize = () => {
      // 🛑 BAJAMOS EL LÍMITE A 850px (Así saltará a Web más fácilmente)
      setIsWeb(window.innerWidth >= 850);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Si la página no ha terminado de montar, mostramos modo móvil por defecto
  if (!isMounted) return false;

  return isWeb;
}
