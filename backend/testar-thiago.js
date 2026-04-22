const { PredictionServiceClient } = require('@google-cloud/aiplatform').v1;
const { helpers } = require('@google-cloud/aiplatform');
const fs = require('fs');
require('dotenv').config();

// ESPELHO DO CÓDIGO DO THIAGO (index (1).js)
const buildPrompt = (themeId, customTheme, gender) => {
  const genero = gender === 'feminino' ? 'woman' : 'man';
  const baseGuard = `
[CRITICAL IDENTITY RULES]
- PERFECT FACIAL CLONE: You must perfectly clone the exact face from the reference image [$1].
- ACCESSORIES: If the person in the reference photo [$1] wears glasses, you MUST include identical glasses.
- FACIAL HAIR: Preserve the EXACT facial hair (beard, mustache, goatee, or clean-shaven) as seen in reference [$1]. 
- TEXTURE: High-end DSLR photography. Photorealistic human skin with natural pores and subtle imperfections.
- AVOID: ABSOLUTELY NO 3D render, NO CGI, NO plastic skin, NO video game look, NO illustration.
[/END IDENTITY RULES]
`;
  const branding = "Sleek minimalist aesthetic. Professional color grading with deep blacks, elegant gold accents, and subtle purple undertones.";
  const themes = {
    executivo: `A ultra-realistic high-end executive portrait of [$1] in a luxury corporate penthouse. 
                ${baseGuard}
                Style: 85mm lens, f/1.8, Rembrandt lighting, ${branding}.`
  };
  return themes[themeId] || themes['executivo'];
};

async function testarCodigoThiago() {
  const project = process.env.GOOGLE_PROJECT_ID;
  const location = process.env.GOOGLE_LOCATION;
  const endpoint = `projects/${project}/locations/${location}/publishers/google/models/imagen-3.0-generate-001`;
  const client = new PredictionServiceClient({ apiEndpoint: `${location}-aiplatform.googleapis.com` });

  const imgPath = 'c:/Users/User/OneDrive/Desktop/Meu projeto/meu-projeto/vyxfotos-ia/backend/uploads/WhatsApp Image 2026-04-06 at 13.53.21.jpeg';
  const base64Image = fs.readFileSync(imgPath).toString('base64');
  
  const promptTexto = buildPrompt('executivo', '', 'masculino');

  // ESTRUTURA SNAKE_CASE DO THIAGO
  const instance = {
    prompt: promptTexto,
    reference_images: [
      {
        reference_id: 1,
        reference_type: 'CHARACTER',
        image: {
          bytes_base_64_encoded: base64Image
        }
      }
    ]
  };

  const parameters = {
    sampleCount: 1,
    aspectRatio: '1:1',
    guidanceScale: 21,
    personGeneration: 'ALLOW_ADULT'
  };

  try {
    console.log("🏛️ Testando novo código do Thiago (Fidelidade Ativada)...");
    const [response] = await client.predict({
      endpoint,
      instances: [helpers.toValue(instance)],
      parameters: helpers.toValue(parameters),
    });

    const prediction = response.predictions[0];
    const generatedImageBase64 = prediction?.structValue?.fields?.bytesBase64Encoded?.stringValue;

    if (generatedImageBase64) {
      const outputPath = 'c:/Users/User/OneDrive/Desktop/Meu projeto/meu-projeto/vyxfotos-ia/backend/resultado_thiago_v1.png';
      fs.writeFileSync(outputPath, Buffer.from(generatedImageBase64, 'base64'));
      console.log("✅ SUCESSO! Foto gerada com seu código: " + outputPath);
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

testarCodigoThiago();
