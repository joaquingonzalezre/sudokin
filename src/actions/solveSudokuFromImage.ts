"use server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export type ScanResponse =
  | { success: true; grid: number[] }
  | { success: false; error: string };

export async function scanSudokuImage(
  imagesBase64: string[],
): Promise<ScanResponse> {
  console.log(
    `--> [Server Action] Escaneo NUCLEAR: Procesando ${imagesBase64.length} celdas individuales...`,
  );

  try {
    const messageContent: any[] = [
      {
        type: "text",
        text: `You are receiving 81 small images representing the 81 cells of a Sudoku grid, read row by row (0 to 80).
        
TASK:
Identify the single digit (1-9) in each image.
- If the cell is empty or contains no digit, return 0.
- If the image contains a digit, return that digit.

OUTPUT FORMAT:
Return a JSON object with a single key "grid" containing an array of exactly 81 integers.
Example: { "grid": [5, 3, 0, 0, 7, ... ] }`,
      },
    ];

    // Adjuntamos las 81 imágenes
    imagesBase64.forEach((img) => {
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
          "X-Title": "Sudokin Nuclear",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o", // Usamos el mejor modelo para asegurar que reconozca garabatos
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
    const finalGrid = parsed.grid;

    if (!Array.isArray(finalGrid) || finalGrid.length !== 81) {
      throw new Error(
        `La IA devolvió ${finalGrid?.length || 0} números en lugar de 81.`,
      );
    }

    console.log(`--> Éxito Nuclear. Grid completado.`);
    return { success: true, grid: finalGrid };
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    return { success: false, error: error.message };
  }
}
