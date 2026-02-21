import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

// Conectamos con la base de datos de Neon usando tu variable de entorno
const sql = neon(process.env.DATABASE_URL!);

// 1. OBTENER LOS SUDOKUS GLOBALES (GET)
export async function GET() {
  try {
    // MAGIA SQL: Si la tabla no existe, la crea.
    await sql`
      CREATE TABLE IF NOT EXISTS imported_sudokus (
        id SERIAL PRIMARY KEY,
        grid_string VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Neon devuelve directamente el array de filas (rows)
    const rows =
      await sql`SELECT grid_string FROM imported_sudokus ORDER BY created_at DESC;`;

    // Convertimos los textos (ej: "0,5,3...") de vuelta a arrays de números
    const sudokus = rows.map((row: any) =>
      row.grid_string.split(",").map(Number),
    );

    return NextResponse.json({ sudokus });
  } catch (error) {
    console.error("Error en DB:", error);
    return NextResponse.json(
      { error: "Error obteniendo sudokus" },
      { status: 500 },
    );
  }
}

// 2. GUARDAR UN NUEVO SUDOKU (POST)
export async function POST(request: Request) {
  try {
    const { grid } = await request.json();
    const gridString = grid.join(","); // Lo convertimos a texto

    // 1. PRIMERO ASEGURAMOS QUE LA TABLA EXISTA
    await sql`
      CREATE TABLE IF NOT EXISTS imported_sudokus (
        id SERIAL PRIMARY KEY,
        grid_string VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. LUEGO INSERTAMOS EL SUDOKU
    await sql`
      INSERT INTO imported_sudokus (grid_string)
      VALUES (${gridString})
      ON CONFLICT (grid_string) DO NOTHING;
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error en DB:", error);
    return NextResponse.json(
      { error: "Error guardando sudoku" },
      { status: 500 },
    );
  }
}
