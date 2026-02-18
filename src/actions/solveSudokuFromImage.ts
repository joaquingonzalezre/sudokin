"use server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export type ScanResponse =
  | { success: true; grid: number[] }
  | { success: false; error: string };

export async function scanSudokuImage(
  imagesBase64: string[],
): Promise<ScanResponse> {
  console.log(`--> [Server Action] Escaneo 3x3 con GUÍAS VISUALES...`);

  try {
    const messageContent: any[] = [
      {
        type: "text",
        text: `You are processing a Sudoku split into 9 sub-images (3x3 boxes).
The images are ordered normally from Top-Left to Bottom-Right.

CRITICAL VISUAL AID:
Each image has RED GRID LINES overlayed on it.
These red lines divide the image into exactly 9 cells (3x3).
Use these red lines to determine exactly which cell a number belongs to.

TASK FOR EACH IMAGE:
1. Visualize the small 3x3 grid defined by the RED LINES.
2. Identify visible digits (1-9).
3. Report the position of each digit using LOCAL coordinates (row 0-2, col 0-2) relative to the red lines.
4. Ignore empty cells.

OUTPUT FORMAT:
Return a JSON object with a key "boxes".
"boxes" is an array of 9 arrays (one for each image).
Each inner array contains objects: { "r": 0-2, "c": 0-2, "v": 1-9 }.

Example for a box with '5' in the center:
{
  "boxes": [
    [ { "r": 1, "c": 1, "v": 5 } ], 
    ... (8 more arrays)
  ]
}`,
      },
    ];

    // Adjuntamos las 9 imágenes
    imagesBase64.forEach((img) => {
      // Aseguramos que el base64 esté limpio para el payload
      const cleanBase64 = img.includes("base64,")
        ? img.split("base64,")[1]
        : img;
      messageContent.push({
        type: "image_url",
        image_url: { url: `data:image/jpeg;base64,${cleanBase64}` },
      });
    });

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Sudokin Pro Coordinates",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          response_format: { type: "json_object" },
          messages: [{ role: "user", content: messageContent }],
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenRouter Error (${response.status}): ${err}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    // Limpieza del JSON
    let cleanText = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    if (cleanText.includes("{")) {
      cleanText = cleanText.substring(
        cleanText.indexOf("{"),
        cleanText.lastIndexOf("}") + 1,
      );
    }

    const parsed = JSON.parse(cleanText);
    const boxes = parsed.boxes;

    // --- RECONSTRUCCIÓN CON DOBLE SISTEMA DE COORDENADAS ---
    const finalGrid = Array(81).fill(0);
    let filledCount = 0;

    if (Array.isArray(boxes) && boxes.length === 9) {
      boxes.forEach((boxItems: any[], boxIndex: number) => {
        // 1. Coordenadas Globales de la Caja (0, 3, 6)
        const startBoxRow = Math.floor(boxIndex / 3) * 3;
        const startBoxCol = (boxIndex % 3) * 3;

        // 2. Procesamos los ítems dentro de la caja
        if (Array.isArray(boxItems)) {
          boxItems.forEach((item) => {
            // Coordenadas Locales (0-2) dadas por la IA
            const localR = Number(item.r);
            const localC = Number(item.c);
            const val = Number(item.v);

            if (localR >= 0 && localR <= 2 && localC >= 0 && localC <= 2) {
              // Mapeo: Global = InicioCaja + Local
              const finalRow = startBoxRow + localR;
              const finalCol = startBoxCol + localC;
              const finalIndex = finalRow * 9 + finalCol;

              if (finalIndex >= 0 && finalIndex < 81) {
                finalGrid[finalIndex] = val;
                filledCount++;
              }
            }
          });
        }
      });
    } else {
      throw new Error("La IA no devolvió el formato de cajas esperado.");
    }

    console.log(`--> Éxito. Detectados ${filledCount} números.`);
    return { success: true, grid: finalGrid };
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return { success: false, error: error.message };
  }
}
