import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// 🛡️ SALVOCONDUCTO PARA LA APP MÓVIL
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// 1. EL SALUDO: Para que el celular sepa que es bienvenido
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// 2. RECUPERAR SUDOKUS: Se activa cuando la app pide descargar los niveles
export async function GET() {
  try {
    if (!process.env.DATABASE_URL)
      throw new Error("No hay conexión a la base de datos");

    // Conectamos a Neon
    const sql = neon(process.env.DATABASE_URL);

    // Traemos los últimos 50 sudokus guardados
    const rows =
      await sql`SELECT grid_string FROM imported_sudokus ORDER BY created_at DESC LIMIT 50`;

    // Transformamos el texto (ej: "4,0,0,6...") de vuelta a un arreglo de números
    const sudokus = rows.map((row) => row.grid_string.split(",").map(Number));

    return NextResponse.json(
      { success: true, sudokus },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error al obtener sudokus:", error);
    return NextResponse.json(
      { success: false, sudokus: [] },
      { status: 500, headers: corsHeaders },
    );
  }
}

// 3. GUARDAR SUDOKU: Se activa cuando terminas de escanear la foto
export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL)
      throw new Error("No hay conexión a la base de datos");
    const sql = neon(process.env.DATABASE_URL);

    const body = await request.json();
    const { grid } = body;

    // Convertimos el arreglo (ej: [4, 0, 0, 6...]) a texto ("4,0,0,6...") para Neon
    const gridString = grid.join(",");

    // Insertamos en la tabla
    await sql`INSERT INTO imported_sudokus (grid_string) VALUES (${gridString})`;

    console.log("✅ Sudoku importado guardado en Neon.");

    return NextResponse.json(
      { success: true, message: "Guardado en la nube" },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("❌ Error guardando sudoku:", error);
    return NextResponse.json(
      { success: false, error: "Fallo en la base de datos" },
      { status: 500, headers: corsHeaders },
    );
  }
}
