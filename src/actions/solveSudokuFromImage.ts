"use server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

export type ScanResponse =
  | { success: true; grid: number[] }
  | { success: false; error: string };

// --- FUNCIÓN AUXILIAR (NO EXPORTADA) ---
// Procesa una sola fila (9 imágenes) independientemente
async function processRow(
  images: string[],
  rowIndex: number,
): Promise<number[]> {
  const messageContent: any[] = [
    {
      type: "text",
      text: `Analyze these 9 images which represent ONE ROW of a Sudoku (left to right).
Return an array of exactly 9 integers.
- Use 0 for empty/blank cells.
- Return ONLY the digit you see in the image.
Format: { "row": [n, n, n, n, n, n, n, n, n] }`,
    },
  ];

  // Adjuntar las 9 imágenes de esta fila
  images.forEach((img) => {
    const cleanBase64 = img.includes("base64,") ? img.split("base64,")[1] : img;
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
        "X-Title": "Sudokin Row Processor",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: messageContent }],
      }),
    },
  );

  if (!response.ok)
    throw new Error(`Row ${rowIndex} Error: ${response.status}`);

  const data = await response.json();
  const content = data.choices[0]?.message?.content || "";
  const cleanText = content
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  // Parseo seguro
  let parsed;
  try {
    const jsonStart = cleanText.indexOf("{");
    const jsonEnd = cleanText.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      parsed = JSON.parse(cleanText.substring(jsonStart, jsonEnd + 1));
    } else {
      parsed = JSON.parse(cleanText);
    }
  } catch (e) {
    console.error(`Error parseando fila ${rowIndex}:`, cleanText);
    return Array(9).fill(0); // Retorna ceros si falla el JSON
  }

  // Buscamos la lista de números en varias claves posibles
  const numbers = parsed.row || parsed.grid || parsed.numbers;

  if (!Array.isArray(numbers) || numbers.length !== 9) {
    console.warn(`Row ${rowIndex} devolvió datos incorrectos.`, numbers);
    return Array(9).fill(0);
  }

  return numbers;
}

// --- FUNCIÓN PRINCIPAL (EXPORTADA) ---
// Esta es la que llama SudokuBoard.tsx
export async function scanSudokuImage(
  imagesBase64: string[],
): Promise<ScanResponse> {
  console.log(`--> [Server Action] Escaneo por LOTES (9 filas de 9)...`);

  if (imagesBase64.length !== 81) {
    return { success: false, error: "Se esperaban 81 imágenes." };
  }

  try {
    // Dividimos las 81 imágenes en 9 grupos de 9 (filas)
    const rowPromises = [];
    for (let i = 0; i < 9; i++) {
      const rowImages = imagesBase64.slice(i * 9, (i + 1) * 9);
      // Lanzamos la petición de la fila (En paralelo para velocidad)
      rowPromises.push(processRow(rowImages, i));
    }

    // Esperamos a que terminen las 9 filas
    const results = await Promise.all(rowPromises);

    // Aplanamos el resultado [[9], [9], ...] -> [81]
    const finalGrid = results.flat();

    console.log(`--> Éxito. Grid completado con ${finalGrid.length} celdas.`);
    return { success: true, grid: finalGrid };
  } catch (error: any) {
    console.error("❌ Error Batch:", error.message);
    return { success: false, error: error.message };
  }
}
