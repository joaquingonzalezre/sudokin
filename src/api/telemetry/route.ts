import { NextResponse } from "next/server";

// Cabeceras de seguridad para que el celular tenga permiso total
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// 🛑 IMPORTANTE: El celular siempre pregunta primero con OPTIONS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Aquí puedes ver los datos en los logs de Vercel
    console.log("✅ Telemetría recibida desde la App Móvil");
    console.log("Dificultad:", body.calculatedDifficulty);

    return NextResponse.json(
      { success: true, message: "Datos guardados" },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("❌ Error en el servidor:", error);
    return NextResponse.json(
      { success: false },
      { status: 500, headers: corsHeaders },
    );
  }
}
