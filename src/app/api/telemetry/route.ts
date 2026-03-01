import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

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
    // 1. Verificamos la conexión a Neon
    if (!process.env.DATABASE_URL) {
      throw new Error("Falta la variable DATABASE_URL");
    }
    const sql = neon(process.env.DATABASE_URL);

    // 2. Recibimos el paquete del SudokuBoard
    const body = await request.json();
    const { puzzle, historyCount, totalSteps, calculatedDifficulty } = body;

    // 3. Preparamos los datos
    // Convertimos el grid inicial [4,0,0...] a texto "4,0,0..."
    const puzzleString = puzzle.join(",");

    // Convertimos el historial de lógicas a un string JSON seguro para Neon
    const logicHistoryJson = JSON.stringify(historyCount);

    // 4. Guardamos en la base de datos
    await sql`
      INSERT INTO telemetry_stats (puzzle_string, difficulty, total_steps, logic_history) 
      VALUES (${puzzleString}, ${calculatedDifficulty}, ${totalSteps}, ${logicHistoryJson}::jsonb)
    `;

    console.log(
      `✅ Telemetría guardada en Neon: ${calculatedDifficulty} (${totalSteps} pasos)`,
    );

    return NextResponse.json(
      { success: true, message: "Datos de partida guardados en Neon" },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("❌ Error guardando telemetría en Neon:", error);
    return NextResponse.json(
      { success: false, error: "Fallo en la base de datos" },
      { status: 500, headers: corsHeaders },
    );
  }
}
