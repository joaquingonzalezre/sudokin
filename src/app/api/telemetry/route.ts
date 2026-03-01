import { NextResponse } from "next/server";

// 1. Definimos los permisos para que cualquier celular pueda entrar
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Permite cualquier origen (celular o web)
  "Access-Control-Allow-Methods": "POST, OPTIONS", // Permite enviar datos y preguntar permisos
  "Access-Control-Allow-Headers": "Content-Type, Authorization", // Permite enviar JSON
};

// 2. Esta función responde al "saludo" inicial que hace el celular (Preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// 3. Esta función recibe los datos reales del Sudoku
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Aquí es donde verás los datos en la pestaña "Logs" de Vercel
    console.log("✅ Telemetría recibida con éxito:", body.calculatedDifficulty);

    return NextResponse.json(
      { success: true, message: "Recibido" },
      { status: 200, headers: corsHeaders }, // Enviamos los permisos también en la respuesta
    );
  } catch (error) {
    console.error("❌ Error procesando JSON:", error);
    return NextResponse.json(
      { success: false, error: "Formato inválido" },
      { status: 400, headers: corsHeaders },
    );
  }
}
