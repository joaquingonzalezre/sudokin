"use server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export type ScanResponse =
  | { success: true; grid: number[] }
  | { success: false; error: string };

export async function scanSudokuImage(
  imageBase64: string,
): Promise<ScanResponse> {
  console.log(
    "--> [Server Action] Iniciando escaneo PRO (Estrategia Coordenadas)...",
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
          "X-Title": "Sudokin Pro",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  // --- LA ESTRATEGIA DE COORDENADAS ---
                  text: `You are a precision Sudoku OCR engine.
Task: Identify ONLY the visible digits (1-9) in the grid.
Output Format: A JSON object with a key "cells".
"cells" must be an array of objects, where each object represents a detected digit:
{ "r": row_index (0-8), "c": col_index (0-8), "v": value (1-9) }

Rules:
1. Rows (r) go from 0 (top) to 8 (bottom).
2. Columns (c) go from 0 (left) to 8 (right).
3. Ignore empty cells (do not include them in the list).
4. Double-check the coordinates. For example, the top-left cell is r:0, c:0.

Example Output:
{
  "cells": [
    { "r": 0, "c": 2, "v": 7 },
    { "r": 0, "c": 3, "v": 8 },
    { "r": 1, "c": 4, "v": 2 }
  ]
}`,
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
        throw new Error("¡Se acabaron los créditos!");
      throw new Error(`OpenRouter Error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    console.log(`✅ Respuesta recibida (Coordenadas). Procesando...`);

    // Limpieza
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

    // --- RECONSTRUCCIÓN DEL SUDOKU ---
    // 1. Creamos un tablero vacío de 81 ceros
    const finalGrid = Array(81).fill(0);

    // 2. Rellenamos solo donde la IA vio números
    let filledCount = 0;
    if (Array.isArray(cells)) {
      cells.forEach((item: any) => {
        const r = Number(item.r);
        const c = Number(item.c);
        const v = Number(item.v);

        // Validación de seguridad para no salirnos del array
        if (r >= 0 && r <= 8 && c >= 0 && c <= 8 && v >= 1 && v <= 9) {
          const index = r * 9 + c; // Convertimos coordenadas (fila, col) a índice plano (0-80)
          finalGrid[index] = v;
          filledCount++;
        }
      });
    }

    console.log(
      `--> Reconstruido tablero con ${filledCount} números detectados.`,
    );

    if (filledCount < 5) {
      // Si detectó muy pocos números, algo falló gravemente
      throw new Error(
        "La IA detectó muy pocos números. Intenta mejorar la iluminación.",
      );
    }

    return { success: true, grid: finalGrid };
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return { success: false, error: `Error: ${error.message}` };
  }
}
