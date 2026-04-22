const { PredictionServiceClient } = require('@google-cloud/aiplatform').v1;
const { helpers } = require('@google-cloud/aiplatform');
const fs = require('fs');
const path = require('path');
const { fal } = require("@fal-ai/client");
require('dotenv').config();

if (parseInt(process.versions.node) < 18) {
    throw new Error('Requer Node.js 18+. Versão atual: ' + process.versions.node);
}
if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY não definida no .env');
}

fal.config({ credentials: process.env.FAL_KEY });

async function run() {
    const project = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
    const location = process.env.GOOGLE_LOCATION || 'us-central1';
    const endpoint = `projects/${project}/locations/${location}/publishers/google/models/imagen-3.0-generate-001`;
    const client = new PredictionServiceClient({ apiEndpoint: `${location}-aiplatform.googleapis.com` });

    try {
        // ---------------------------------------------------------
        // PASSO 1: GOOGLE IMAGEN 3 — Cenário e roupa (sem rosto)
        // ---------------------------------------------------------
        console.log('🚀 Passo 1: Gerando base no Google...');

        const googlePrompt = `Professional executive portrait photography.
Premium tailored navy blue suit, crisp white dress shirt, silk tie.
Cinematic Rembrandt studio lighting, soft shadows, shallow depth of field.
Background: luxury corporate office with bokeh city lights.
85mm lens f/1.8, 8k, RAW unedited photo.`;

        const [response] = await client.predict({
            endpoint,
            instances: [helpers.toValue({ prompt: googlePrompt })],
            parameters: helpers.toValue({
                sampleCount: 1,
                aspectRatio: '1:1',
                guidanceScale: 13
            })
        });

        const googleBuffer = Buffer.from(
            response.predictions[0].structValue.fields.bytesBase64Encoded.stringValue,
            'base64'
        );

        // Salva base para debug
        fs.writeFileSync(path.join(__dirname, 'debug_base_google.png'), googleBuffer);
        console.log('   ✔ Base salva: debug_base_google.png');

        // ---------------------------------------------------------
        // PASSO 2: UPLOAD PARA O STORAGE DO FAL
        // ---------------------------------------------------------
        console.log('☁️  Passo 2: Fazendo upload das imagens...');

        const suaFotoPath = path.join(__dirname, 'foto.jpeg');
        if (!fs.existsSync(suaFotoPath)) {
            throw new Error("Arquivo 'foto.jpeg' não encontrado na pasta.");
        }

        const suaFotoUrl = await fal.storage.upload(fs.readFileSync(suaFotoPath));
        console.log('   ✔ Foto de referência enviada.');


        // ---------------------------------------------------------
        // PASSO 3: IP-ADAPTER FACE-ID — Identidade biométrica real
        //
        // CAMPOS CORRETOS desse modelo (confirmados na documentação):
        //   image_url       → imagem base gerada pelo Google (cenário/roupa)
        //   face_image_url  → foto da pessoa (extrai embeddings faciais)
        //   model_type      → "SDXL-v2-plus" = maior fidelidade
        //   num_samples     → número de imagens geradas (1 = uma saída)
        //   guidance_scale  → 7.5 é o padrão do modelo
        //
        // NÃO use: identity_strength, adapter_strength, pose_image_url
        // Esses são campos do flux-pulid, não desse modelo.
        //
        // O prompt descreve a CENA — NÃO descreve traços físicos
        // (cabelo, barba, sobrancelha) para não sobrescrever a biometria.
        // ---------------------------------------------------------
        console.log('🔄 Passo 3: Gerando com identidade biométrica (IP-Adapter FaceID)...');

        const result = await fal.subscribe("fal-ai/ip-adapter-face-id", {
            input: {
                // Foto da PESSOA — os embeddings faciais são extraídos daqui
                face_image_url: suaFotoUrl,

                // Descreve a CENA e qualidade — sem mencionar traços físicos
                prompt: `Ultra-realistic professional executive portrait photograph.
Same person, same face, same features as the reference photo.
Brazilian man with warm skin tone and dark features.
Wearing premium tailored navy blue suit, white dress shirt, silk tie.
Luxury corporate office background with city lights bokeh.
Cinematic Rembrandt studio lighting, 85mm lens f/1.8.
Hyper-realistic skin texture, visible pores, sharp eyes, natural expression.
8k RAW unedited photograph. Zero digital smoothing. Zero beauty filter.`,

                negative_prompt: `plastic skin, waxy skin, smooth skin, airbrushed,
beauty filter, 3d render, cartoon, illustration, anime,
different person, face morph, idealized features,
makeup, fake, CGI, low quality, blurry, distorted face.`,

                // SDXL-v2-plus = maior fidelidade facial desse modelo
                model_type: "SDXL-v2-plus",

                // 1 imagem de saída — aumente para gerar variações
                num_samples: 1,

                num_inference_steps: 50,
                guidance_scale: 7.5,
                width: 1024,
                height: 1024,
                face_id_det_size: 320
            },
            logs: true,
            onQueueUpdate: (update) => {
                if (update.status === "IN_PROGRESS") {
                    update.logs?.map((log) => log.message).forEach(msg => {
                        if (msg) console.log('   ⏳', msg);
                    });
                }
            }
        });

        // Captura o link — ip-adapter-face-id retorna result.data.image.url
        const finalImageUrl =
            result?.data?.image?.url ||
            result?.image?.url ||
            result?.data?.images?.[0]?.url ||
            result?.images?.[0]?.url;

        if (!finalImageUrl) {
            console.log('⚠️  Estrutura da resposta:', JSON.stringify(result, null, 2));
            throw new Error("Link da imagem não encontrado.");
        }

        // ---------------------------------------------------------
        // PASSO 4: DOWNLOAD E SALVAMENTO
        // ---------------------------------------------------------
        console.log('✅ SUCESSO! Baixando resultado final...');
        const responseImage = await fetch(finalImageUrl);
        const buffer = Buffer.from(await responseImage.arrayBuffer());
        fs.writeFileSync(path.join(__dirname, 'resultado_faceid.png'), buffer);

        console.log('');
        console.log('════════════════════════════════════════════════');
        console.log('📂 ARQUIVO SALVO: resultado_faceid.png');
        console.log('🔗 Link: ' + finalImageUrl);
        console.log('════════════════════════════════════════════════');
        console.log('');
        console.log('💡 CALIBRAGEM (se precisar ajustar):');
        console.log('   Rosto diferente?   → Mude model_type para "1_5-auraface-v1"');
        console.log('   Pele plástica?     → Baixe guidance_scale para 5.0');
        console.log('   Mais variações?    → Suba num_samples para 4');

    } catch (e) {
        console.log('\n❌ ERRO NO PROCESSO:');
        console.log('   Mensagem:', e.message);
        if (e.details) {
            console.log('   Detalhe Google:', JSON.stringify(e.details));
        }
        if (e.body && e.body.detail) {
            const detail = JSON.stringify(e.body.detail);
            if (detail.length > 800) {
                console.log('   Fal.ai rejeitou os dados. Verifique foto.jpeg e FAL_KEY no .env');
            } else {
                console.log('   Detalhe FAL:', detail);
            }
        }
    }
}

run();
