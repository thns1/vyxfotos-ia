const fs = require('fs');
const { fal } = require('@fal-ai/client');
require('dotenv').config();

fal.config({ credentials: process.env.FAL_KEY });

class ImageGenerationService {
    async generateWithFaceID(imageFile, theme, customText, gender = 'masculino') {
        console.log(`[VYX] Pipeline iniciado | tema: ${theme} | gênero: ${gender}`);

        const themePrompts = require('../constants/themePrompts');
        const themePrompt = themePrompts[theme] || themePrompts['executivo'];

        // Upload da selfie para o storage do FAL
        const imageBuffer = fs.readFileSync(imageFile.path);
        const selfieUrl = await fal.storage.upload(imageBuffer);
        console.log('[VYX] Selfie enviada ao storage.');

        // ─── PASSO 1: FLUX Realism gera cena profissional ───────────────────
        console.log('[VYX] 1/2 — Gerando cena com FLUX Realism...');

        const genderLabel = gender === 'feminino' ? 'woman' : 'man';
        const prompt = `RAW photo of a ${genderLabel}, ${themePrompt}${customText ? ', ' + customText : ''}, photorealistic, 8k, sharp focus, natural skin texture, professional photography`;

        const fluxResult = await fal.subscribe('fal-ai/flux-realism', {
            input: {
                prompt: prompt,
                negative_prompt: 'cartoon, painting, illustration, blurry, deformed, ugly, low quality, watermark, text, fake skin',
                num_inference_steps: 28,
                guidance_scale: 3.5,
                width: 1024,
                height: 1024
            },
            logs: false,
            onQueueUpdate: (update) => {
                if (update.status === 'IN_PROGRESS') process.stdout.write('.');
            }
        });

        const sceneUrl =
            fluxResult?.data?.images?.[0]?.url ||
            fluxResult?.images?.[0]?.url;

        if (!sceneUrl) {
            console.error('\n[VYX] Resposta FLUX:', JSON.stringify(fluxResult, null, 2));
            throw new Error('FLUX Realism não retornou imagem.');
        }
        console.log('\n[VYX] Cena gerada.');

        // ─── PASSO 2: Face swap — rosto real da selfie na cena ──────────────
        console.log('[VYX] 2/2 — Aplicando rosto real (face swap)...');

        const swapResult = await fal.subscribe('fal-ai/face-swap', {
            input: {
                base_image_url: sceneUrl,  // cena gerada pelo FLUX
                swap_image_url: selfieUrl  // selfie com o rosto real
            },
            logs: false,
            onQueueUpdate: (update) => {
                if (update.status === 'IN_PROGRESS') process.stdout.write('.');
            }
        });

        const finalUrl =
            swapResult?.data?.image?.url ||
            swapResult?.data?.images?.[0]?.url ||
            swapResult?.image?.url;

        if (!finalUrl) {
            console.error('\n[VYX] Resposta face-swap:', JSON.stringify(swapResult, null, 2));
            throw new Error('Face swap não retornou imagem.');
        }

        // Download da imagem final
        const response = await fetch(finalUrl);
        const buffer = Buffer.from(await response.arrayBuffer());
        const base64 = buffer.toString('base64');

        console.log('\n[VYX] Pipeline concluído com sucesso.');
        return {
            status: 'success',
            output_url: `data:image/jpeg;base64,${base64}`,
            orderId: `PEDIDO_F_${Date.now()}`
        };
    }
}

module.exports = new ImageGenerationService();
