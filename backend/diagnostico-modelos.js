const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

async function run() {
  console.log("🔍 Iniciando mapeamento de motores Vertex AI...");
  const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    const models = await client.models.list();
    console.log("\n✅ MODELOS ENCONTRADOS NO SEU PROJETO:");
    
    // Tentando iterar sobre os modelos (ajustado para a estrutura do SDK)
    const list = models.models || (Array.isArray(models) ? models : []);
    
    list.forEach(m => {
      if (m.name.includes('imagen') || m.name.includes('gemini-2.0')) {
        console.log(`- ID: ${m.name} | Métodos: ${JSON.stringify(m.supportedActions)}`);
      }
    });

    if (list.length === 0) {
      console.log("⚠️ Nenhum modelo filtrado encontrado. Mostrando resposta bruta...");
      console.log(JSON.stringify(models).substring(0, 500));
    }
  } catch (e) {
    console.error("❌ Erro ao listar modelos:", e.message);
  }
}

run();
