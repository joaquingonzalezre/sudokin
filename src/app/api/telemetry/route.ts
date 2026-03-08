import { NextResponse } from "next/server";

export const dynamic = "force-static"; // Forzamos static para Capacitor

// 🛡️ SALVOCONDUCTO PARA LA APP MÓVIL (CORS)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { puzzle, historyCount, totalSteps, calculatedDifficulty } = body;

    // Solo hacemos log local en la consola temporalmente.
    console.log(
      `✅ Telemetría leída en modo Offline: Dificultad Evaluada ${calculatedDifficulty} (${totalSteps} pasos)`,
    );

    return NextResponse.json(
      { success: true, message: "Telemetría simulada (Offline)" },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("❌ Error leyendo telemetría:", error);
    return NextResponse.json(
      { success: false, error: "Fallo leyendo el request" },
      { status: 500, headers: corsHeaders },
    );
  }
}
