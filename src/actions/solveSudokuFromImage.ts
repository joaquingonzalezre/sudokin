"use server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export type ScanResponse =
  | { success: true; grid: number[] }
  | { success: false; error: string };

export async function scanSudokuImage(
  imagesBase64: string[],
): Promise<ScanResponse> {
  console.log(
    `--> [Server Action] Iniciando escaneo MULTI-IMAGEN (${imagesBase64.length} sectores) con Mapeo Correcto...`,
  );

  try {
    // 1. Preparamos el mensaje para GPT-4o
    // Le decimos explícitamente que son 9 sub-grids y que queremos la respuesta estructurada por cajas.
    const messageContent: any[] = [
      {
        type: "text",
        text: `You are a precision Sudoku OCR engine. 
You are receiving 9 separate images.
Each image represents one of the 9 "3x3 boxes" of a standard Sudoku.
The images are ordered: 
Box 1 (Top-Left), Box 2 (Top-Center), Box 3 (Top-Right),
Box 4 (Middle-Left), Box 5 (Center), ... etc.

TASK:
1. Identify the 9 digits in each image (use 0 for empty cells).
2. Be careful with edges: only read numbers that belong to the current 3x3 box.

OUTPUT FORMAT:
Return a JSON object with a key "boxes".
"boxes" must be an array of 9 arrays.
Each inner array must contain EXACTLY 9 integers representing that box's 3x3 grid (read left-to-right, top-to-bottom).

Example:
{
  "boxes": [
    [5, 3, 0, 6, 0, 0, 0, 9, 8], // Content of Box 1
    [0, 7, 0, 1, 9, 5, 0, 0, 0], // Content of Box 2
    ... (7 more arrays)
  ]
}`,
      },
    ];

    // 2. Adjuntamos las 9 imágenes al mensaje
    imagesBase64.forEach((img) => {
      const cleanBase64 = img.includes("base64,")
        ? img.split("base64,")[1]
        : img;
      messageContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${cleanBase64}`,
        },
      });
    });

    // 3. Enviamos la petición
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Sudokin Pro Multi-View",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o", // Usamos el mejor modelo disponible
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: messageContent,
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

    console.log(
      `✅ Respuesta recibida. Iniciando reconstrucción matemática...`,
    );

    // 4. Limpieza del JSON
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

    // Obtenemos las cajas. Si falló el formato, intentamos leer 'grid' plano
    let boxes = parsed.boxes;

    // Fallback: Si la IA devolvió un array plano de 81, lo cortamos nosotros en 9 cajas
    if (!boxes && parsed.grid && parsed.grid.length === 81) {
      console.warn("⚠️ La IA devolvió formato plano. Cortando manualmente...");
      boxes = [];
      for (let i = 0; i < 9; i++) {
        boxes.push(parsed.grid.slice(i * 9, (i + 1) * 9));
      }
    }

    // --- RECONSTRUCCIÓN MATEMÁTICA DEL TABLERO ---
    // Aquí ocurre la magia para arreglar el problema de los números desplazados.

    const finalGrid = Array(81).fill(0);
    let filledCount = 0;

    if (Array.isArray(boxes) && boxes.length === 9) {
      boxes.forEach((boxNumbers: number[], boxIndex: number) => {
        // boxIndex va de 0 a 8 (Las 9 cajas grandes del sudoku)

        // Calculamos la esquina superior izquierda de ESTA caja en el tablero global
        // Fila inicial de la caja: 0, 3 o 6
        const startBoxRow = Math.floor(boxIndex / 3) * 3;
        // Columna inicial de la caja: 0, 3 o 6
        const startBoxCol = (boxIndex % 3) * 3;

        // Ahora recorremos los 9 números DENTRO de esta caja pequeña
        if (Array.isArray(boxNumbers)) {
          boxNumbers.forEach((num, cellInBoxIndex) => {
            // cellInBoxIndex va de 0 a 8

            // Calculamos la posición relativa dentro de la caja (0, 1, 2)
            const rowInBox = Math.floor(cellInBoxIndex / 3);
            const colInBox = cellInBoxIndex % 3;

            // Calculamos la Coordenada Global Exacta
            const globalRow = startBoxRow + rowInBox;
            const globalCol = startBoxCol + colInBox;

            // Convertimos a índice plano (0-80)
            const finalIndex = globalRow * 9 + globalCol;

            if (finalIndex >= 0 && finalIndex < 81) {
              finalGrid[finalIndex] = num;
              if (num !== 0) filledCount++;
            }
          });
        }
      });
    } else {
      throw new Error("La IA no devolvió las 9 cajas esperadas.");
    }

    console.log(
      `--> Reconstrucción completada. Números detectados: ${filledCount}`,
    );

    // Validación final
    if (filledCount < 10) {
      throw new Error("Se detectaron muy pocos números. Verifica la imagen.");
    }

    return { success: true, grid: finalGrid };
  } catch (error: any) {
    console.error("❌ Error Pro:", error.message);
    return { success: false, error: `Error: ${error.message}` };
  }
}
