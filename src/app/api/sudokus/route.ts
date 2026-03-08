import { NextResponse } from "next/server";
import { sudokusOrdenados } from "../../../../scripts/sudokus_ordenados";

export const dynamic = "force-static";

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

// 2. RECUPERAR SUDOKUS: Descarga directamente los niveles locales
export async function GET() {
  try {
    // Para simplificar, devolvemos todo el arreglo o una parte al azar, pero
    // devolveremos los primeros 50 o todos, como solía hacer la BDD
    const sudokus = sudokusOrdenados;
    // Si quisieras unos pocos aleatorios, podrías mezclarlos aquí, pero mandaremos todos.

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

// 3. GUARDAR SUDOKU: Ya no hace falta guardar en Neon. 
// Para que la app no tire error, simularemos que fue un éxito.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { grid } = body;

    // Ya no guardaremos nada en Neon, solo recibimos el grid y respondemos 200 OK
    console.log("✅ Sudoku nuevo escaneado. Guardado temporal descartado por ser versión offline.");

    return NextResponse.json(
      { success: true, message: "Simulación de guardado (Offline)" },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("❌ Error guardando sudoku:", error);
    return NextResponse.json(
      { success: false, error: "Fallo procesando el sudoku" },
      { status: 500, headers: corsHeaders },
    );
  }
}
