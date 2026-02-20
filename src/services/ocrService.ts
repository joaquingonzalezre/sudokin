"use server";

export interface ScanResponse {
  success: boolean;
  grid: number[];
  error?: string;
}

/**
 * FUNCIÓN HÍBRIDA: Solo escanea los dígitos filtrados por el algoritmo matemático.
 * Recibe el collage solo con las casillas llenas y la cantidad esperada de dígitos.
 */
export const scanFilteredDigits = async (
  collageBase64: string,
  expectedCount: number,
): Promise<ScanResponse> => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { success: false, grid: [], error: "Falta API Key" };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "openai/gpt-4o",
          temperature: 0.0,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  // --- EL TRUCO MAESTRO: EXIGIR COMAS ---
                  text: `Eres un OCR numérico de alta precisión. Te envío un collage con exactamente ${expectedCount} dígitos.
Tu tarea es leerlos en orden (izquierda a derecha, arriba a abajo).

REGLAS ESTRICTAS:
1. Devuelve EXACTAMENTE ${expectedCount} números.
2. DEBES SEPARAR CADA NÚMERO CON UNA COMA (sin espacios).
3. Si un dígito es ilegible, usa '?'.
4. NUNCA devuelvas texto conversacional ni saltos de línea.
Ejemplo de respuesta si se esperan 5 dígitos: 5,3,9,1,2`,
                },
                { type: "image_url", image_url: { url: collageBase64 } },
              ],
            },
          ],
        }),
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`💥 Detalles exactos del error:`, errorText);
      throw new Error(`Rechazo de OpenRouter: ${errorText}`);
    }

    const data = await response.json();
    let aiAnswer = data.choices[0].message.content.trim();

    // 1. Limpiamos todo lo que NO sea un número, un '?' o una COMA
    aiAnswer = aiAnswer.replace(/[^0-9?,]/g, "");

    console.log(`🤖 IA Respondió: "${aiAnswer}" (Esperados: ${expectedCount})`);

    // 2. AHORA CORTAMOS USANDO LA COMA EN LUGAR DE CORTAR LETRA POR LETRA
    const digitsArray = aiAnswer.split(",");

    if (digitsArray.length !== expectedCount) {
      console.warn(
        `⚠️ Longitud incorrecta. Se esperaban ${expectedCount}, llegaron ${digitsArray.length}`,
      );
    }

    const digits = digitsArray.map((char: string) =>
      char === "?" || char === "" ? 0 : parseInt(char, 10),
    );
    const safeDigits = digits.map((d: number) => (isNaN(d) ? 0 : d));

    return { success: true, grid: safeDigits };
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("Fallo OCR Híbrido:", error);
    return {
      success: false,
      grid: [],
      error: error.message || "Error al leer dígitos.",
    };
  }
};
