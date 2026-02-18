"use server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export type ScanResponse =
  | { success: true; grid: number[] }
  | { success: false; error: string };

export async function scanSudokuImage(
  imageBase64: string,
): Promise<ScanResponse> {
  console.log(
    "--> [Server Action] Iniciando escaneo ULTRAPRO (GPT-4o + Coordenadas)...",
  );

  try {
    const base64Data = imageBase64.includes("base64,")
      ? imageBase64.split("base64,")[1]
      : imageBase64;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Sudokin Ultra",
        },
        body: JSON.stringify({
          // 1. CAMBIO DE MOTOR: Usamos el "Ferrari" real (sin 'mini')
          // Esto consumirá un poco más de saldo, pero la precisión es máxima.
          model: "openai/gpt-4o",

          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  // 2. CAMBIO DE LÓGICA: Pedimos COORDENADAS (r, c, v)
                  // Esto evita que se "salte" los ceros y desplace los números.
                  text: `You are a visionary Sudoku OCR engine. 
Task: Identify ONLY the visible digits (1-9) in the grid.
Output Format: A JSON object with a key "cells".
"cells" must be an array of objects: { "r": row_index (0-8), "c": col_index (0-8), "v": value (1-9) }

Rules:
- Row 0 is the top row. Row 8 is the bottom.
- Col 0 is the left column. Col 8 is the right.
- IGNORE empty cells. Do not guess.
- Example: If top-left is 5, output { "r": 0, "c": 0, "v": 5 }.
- Double check alignment. Accuracy is more important than speed.`,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Data}`,
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errText = await response.text();
      if (response.status === 402)
        throw new Error("¡Saldo insuficiente en OpenRouter!");
      throw new Error(`OpenRouter Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    console.log(`✅ Respuesta recibida. Reconstruyendo tablero...`);

    // Limpieza estándar
    let cleanText = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const firstBracket = cleanText.indexOf("{");
    const lastBracket = cleanText.lastIndexOf("}");
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanText = cleanText.substring(firstBracket, lastBracket + 1);
    }

    const parsed = JSON.parse(cleanText);
    const cells = parsed.cells || parsed.digits || [];

    // --- RECONSTRUCCIÓN INFALIBLE ---
    // 1. Creamos un tablero vacío de 81 ceros (limpio)
    const finalGrid = Array(81).fill(0);

    // 2. Insertamos quirúrgicamente cada número en su lugar exacto
    let filledCount = 0;
    if (Array.isArray(cells)) {
      cells.forEach((item: any) => {
        const r = Number(item.r);
        const c = Number(item.c);
        const v = Number(item.v);

        // Solo aceptamos coordenadas válidas
        if (r >= 0 && r <= 8 && c >= 0 && c <= 8 && v >= 1 && v <= 9) {
          const index = r * 9 + c;
          finalGrid[index] = v;
          filledCount++;
        }
      });
    }

    console.log(`--> Tablero reconstruido con ${filledCount} números.`);

    if (filledCount < 10) {
      throw new Error(
        "La imagen parece borrosa o no es un Sudoku. Detecté muy pocos números.",
      );
    }

    return { success: true, grid: finalGrid };
  } catch (error: any) {
    console.error("❌ Error Ultra:", error.message);
    return { success: false, error: `Error: ${error.message}` };
  }
}
