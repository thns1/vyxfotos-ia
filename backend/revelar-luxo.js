const { PredictionServiceClient } = require('@google-cloud/aiplatform').v1;
const { helpers } = require('@google-cloud/aiplatform');
const fs = require('fs');
require('dotenv').config();

async function revelarLuxoOrganico() {
  const project = process.env.GOOGLE_PROJECT_ID;
  const location = process.env.GOOGLE_LOCATION;
  const endpoint = `projects/${project}/locations/${location}/publishers/google/models/imagen-3.0-generate-001`;
  
  const client = new PredictionServiceClient({
    apiEndpoint: `${location}-aiplatform.googleapis.com`
  });

  const imgPath = 'c:/Users/User/OneDrive/Desktop/Meu projeto/meu-projeto/vyxfotos-ia/backend/uploads/WhatsApp Image 2026-04-06 at 13.53.21.jpeg';
  const base64Image = fs.readFileSync(imgPath).toString('base64');

  // PROMPT COM LENTE 50mm (MAIS NATURAL)
  const prompt = `A ultra-realistic high-end corporate executive portrait of [1] in a luxury modern office penthouse. 

[CRITICAL AND UNBREAKABLE IDENTITY RULES]
- Maintain absolute facial bone structure from [1].
- Keep identical eye shape, nose proportion, and jawline definition.
- Preserve natural skin texture, including pores and subtle imperfections for realism.
- Lock the exact facial hair style (mustache and goatee strictly preserved, NO full bushy generic beards) as seen in [1].
- Do not interpret or change the person's identity.
- ABSOLUTELY NO 3D render, NO CGI, NO plastic skin, NO illustration, NO artificial smoothing, NO video game engine look.
[/END IDENTITY RULES]

Outfit: tailored dark suit and tie. Lighting: Cinematic studio light, 50mm lens, f/2.2, sharp details, minimalist professional color grading. RAW unedited DSLR photo.`;

  const instance = {
    prompt: prompt,
    referenceImages: [
      {
        referenceId: 1,
        referenceType: "REFERENCE_TYPE_SUBJECT", // O MODO QUE DEU CERTO NA AMOSTRA
        image: {
          bytesBase64Encoded: base64Image
        },
        subjectImageConfig: {
          subjectType: "SUBJECT_TYPE_PERSON",
          subjectDescription: "The exact individual from [1]. RAW organic skin texture. High-fidelity identity."
        }
      }
    ]
  };

  const parameters = {
    sampleCount: 1,
    aspectRatio: '1:1',
    guidanceScale: 25, // MENOS AGRESSIVO = MAIS REALIDADE
    negativePrompt: "artificial skin, plastic, cartoon, generic man, 3d render, cgi, smooth skin, airbrushed"
  };

  try {
    console.log("🚀 Disparando Motor de Realismo Orgânico (Subject Mode + 50mm)...");
    const [response] = await client.predict({
      endpoint,
      instances: [helpers.toValue(instance)],
      parameters: helpers.toValue(parameters),
    });

    const prediction = response.predictions[0];
    const generatedImageBase64 = prediction.structValue.fields.bytesBase64Encoded.stringValue;

    if (generatedImageBase64) {
      const outputPath = 'c:/Users/User/OneDrive/Desktop/Meu projeto/meu-projeto/vyxfotos-ia/backend/resultado_luxo_organico.png';
      fs.writeFileSync(outputPath, Buffer.from(generatedImageBase64, 'base64'));
      console.log("✅ SUCESSO! Foto orgânica gerada em: " + outputPath);
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

revelarLuxoOrganico();
