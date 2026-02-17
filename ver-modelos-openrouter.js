const OPENROUTER_API_KEY =
  "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";

async function checkOpenRouter() {
  console.log("🔍 Consultando lista oficial de OpenRouter...");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const allModels = data.data;

    console.log(`\n📦 Total modelos encontrados: ${allModels.length}`);
    console.log("---------------------------------------------------");
    console.log("💎 BUSCANDO MODELOS GRATUITOS Y DE VISIÓN:");

    // Filtramos modelos que:
    // 1. Tengan precio de prompt "0" (Gratis)
    // 2. Tengan palabras clave de visión o sean populares
    const freeModels = allModels.filter((m) => {
      const isFree = m.pricing.prompt === "0" || m.pricing.prompt === 0;
      return isFree;
    });

    // Separamos los que parecen de visión
    const visionKeywords = ["vision", "gemini", "flash", "free", "llama-3.2"];
    const freeVision = freeModels.filter((m) =>
      visionKeywords.some((k) => m.id.toLowerCase().includes(k)),
    );

    if (freeVision.length > 0) {
      console.log("\n✅ MODELOS GRATIS (Probables de Visión):");
      freeVision.forEach((m) => {
        console.log(`   👉 ID: ${m.id}`);
      });
    } else {
      console.log(
        "⚠️ No encontré modelos gratis con nombres obvios de visión.",
      );
      console.log("Aquí hay algunos gratis generales:");
      freeModels.slice(0, 10).forEach((m) => console.log(`   • ${m.id}`));
    }

    console.log("---------------------------------------------------");
  } catch (error) {
    console.error("❌ Error al conectar:", error.message);
  }
}

checkOpenRouter();
