"use server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export type ScanResponse =
  | { success: true; grid: number[] }
  | { success: false; error: string };

// CAMBIO IMPORTANTE: Ahora aceptamos un array de strings (las 9 fotos)
export async function scanSudokuImage(
  imagesBase64: string[],
): Promise<ScanResponse> {
  console.log(
    `--> [Server Action] Iniciando escaneo MULTI-IMAGEN (${imagesBase64.length} sectores)...`,
  );

  try {
    // Construimos el contenido del mensaje.
    // 1. Instrucción de Texto
    const messageContent: any[] = [
      {
        type: "text",
        text: `You are a precision Sudoku OCR engine. 
You are receiving 9 separate images.
Each image represents one of the 9 "boxes" (3x3 subgrids) of a standard Sudoku.
The images are ordered normally: Top-Left, Top-Center, Top-Right, Middle-Left, Middle-Center, etc.

TASK:
1. Read the digits from each of the 9 images in order.
2. Concatenate them to form the full 81-number Sudoku grid.
3. Use 0 for empty cells.

OUTPUT FORMAT:
Return a JSON object with a single key "grid" containing a flat array of 81 integers.
Example: { "grid": [5, 3, 0, 0, 7, ...] }`,
      },
    ];

    // 2. Adjuntamos las 9 imágenes en orden
    imagesBase64.forEach((img) => {
      const cleanBase64 = img.includes("base64,")
        ? img.split("base64,")[1]
        : img;
      messageContent.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${cleanBase64}`,
          // detail: "high" // Opcional: fuerza alta resolución si fuera necesario, pero suele ser automático
        },
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
          "X-Title": "Sudokin Multi-View",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o", // Usamos el Ferrari
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

    console.log(`✅ Respuesta recibida.`);

    // Limpieza estándar del JSON
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
    const numbers = parsed.grid || parsed.numbers;

    // Validación final
    if (!numbers || !Array.isArray(numbers) || numbers.length !== 81) {
      console.error("JSON Recibido:", JSON.stringify(parsed));
      throw new Error(
        `La IA leyó ${numbers?.length || 0} números. Se requieren exactamente 81.`,
      );
    }

    return { success: true, grid: numbers };
  } catch (error: any) {
    console.error("❌ Error Multi-Imagen:", error.message);
    return { success: false, error: `Error: ${error.message}` };
  }
}
