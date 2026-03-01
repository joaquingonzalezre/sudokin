import { NextResponse } from "next/server";

// 🛑 1. EL PERMISO (CORS): Le decimos a Vercel que acepte paquetes desde la App Móvil
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Permite conexiones desde cualquier celular/origen
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 🛑 2. EL SALUDO PREVIO: El celular siempre envía un "OPTIONS" antes del POST para pedir permiso
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// 🛑 3. LA RECEPCIÓN DEL PAQUETE
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { puzzle, historyCount, totalSteps, calculatedDifficulty } = body;

    // Imprimimos en la consola de Vercel para confirmar
    console.log("¡PAQUETE RECIBIDO DESDE EL MÓVIL! 📱");
    console.log("Dificultad calculada:", calculatedDifficulty);
    console.log("Lógicas usadas:", historyCount);

    // Respondemos con éxito y agregamos los permisos CORS a la respuesta
    return NextResponse.json(
      { success: true, message: "Telemetría registrada correctamente" },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error en API Telemetría:", error);
    return NextResponse.json(
      { success: false, message: "Error interno del servidor" },
      { status: 500, headers: corsHeaders },
    );
  }
}
