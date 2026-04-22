const { PredictionServiceClient } = require('@google-cloud/aiplatform').v1;
const { helpers } = require('@google-cloud/aiplatform');
const fs = require('fs');
require('dotenv').config();

// INTEGRAÇÃO DO PDF DO THIAGO + SINTAXE BLINDADA
const buildPrompt = (themeId, customTheme, gender) => {
  const genero = gender === 'feminino' ? 'feminino' : 'masculino';
  const baseGuard = `
[CRITICAL IDENTITY RULES]
- FIDELIDADE FACIAL MÁXIMA: Esta pessoa deve ser EXATAMENTE a mesma da foto de referência [$1]. Mesmo rosto, mesmo cabelo, mesmos olhos, mesmo nariz.
- CARACTERÍSTICAS FÍSICAS: Pessoa com tom de pele quente e traços escuros. 
- PELOS FACIAIS: Preserve rigorosamente apenas o bigode e cavanhaque. NÃO adicione barba farta ou genérica.
- ACESSÓRIOS: NÃO adicione óculos.
- TEXTURA: Mesma textura de pele e poros visíveis, simetria facial exata. Zero suavização de pele.
- PROIBIDO: Zero artefatos de IA, zero render 3D, zero aspeto de plástico. Same person, same face, same features as reference photo.
[/END IDENTITY RULES]
`;

  const themes = {
    premium: `Executivo(a) Premium. Traje: terno executivo premium ${genero} preto ou antracite, camisa social branca. Visual de alta diretoria. Iluminação mista dramática e elegante. Fundo: escritório corporativo moderno completamente desfocado em bokeh (estantes, iluminação quente). Profundidade de campo extremamente rasa. Câmera: 50mm f/1.8. 4K RAW. \n${baseGuard}`
  };
  return themes[themeId] || themes.premium;
};

async function testarIntegracaoFinal() {
  const project = process.env.GOOGLE_PROJECT_ID;
  const location = process.env.GOOGLE_LOCATION;
  const endpoint = `projects/${project}/locations/${location}/publishers/google/models/imagen-3.0-generate-001`;
  const client = new PredictionServiceClient({ apiEndpoint: `${location}-aiplatform.googleapis.com` });

  const imgPath = 'c:/Users/User/OneDrive/Desktop/Meu projeto/meu-projeto/vyxfotos-ia/backend/uploads/WhatsApp Image 2026-04-06 at 13.53.21.jpeg';
  const base64Image = fs.readFileSync(imgPath).toString('base64');
  
  const promptTxt = buildPrompt('premium', '', 'masculino');

  // SINTAXE BLINDADA (SNAKE_CASE)
  const instance = {
    prompt: promptTxt,
    reference_images: [
      {
        reference_id: "1",
        reference_type: "REFERENCE_TYPE_SUBJECT",
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
    negativePrompt: "3d render, cgi, cartoon, illustration, plastic skin, smooth skin, airbrushed, generic face, altered identity, glasses, thick beard"
  };

  try {
    console.log("🏛️  Executando Teste Definitivo (10 Temas + Sintaxe Blindada)...");
    const [response] = await client.predict({
      endpoint,
      instances: [helpers.toValue(instance)],
      parameters: helpers.toValue(parameters),
    });

    const prediction = response.predictions[0];
    const generatedImageBase64 = prediction?.structValue?.fields?.bytesBase64Encoded?.stringValue;

    if (generatedImageBase64) {
      const outputPath = 'c:/Users/User/OneDrive/Desktop/Meu projeto/meu-projeto/vyxfotos-ia/backend/resultado_final_vyx_pdf.png';
      fs.writeFileSync(outputPath, Buffer.from(generatedImageBase64, 'base64'));
      console.log("✅ SUCESSO TOTAL! Foto gerada com o motor de produção blindado: " + outputPath);
    }
  } catch (error) {
    console.error("❌ Erro:", error.message);
  }
}

testarIntegracaoFinal();
