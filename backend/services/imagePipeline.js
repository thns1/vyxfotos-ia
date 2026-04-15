const fs = require('fs');
const themePrompts = require('../constants/themePrompts');
const { fal } = require("@fal-ai/client");

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - VYXFOTOS V6
 * Motor: fal-ai/photomaker
 *
 * PhotoMaker usa "stacked ID embedding" — um sistema científicamente superior
 * ao PuLID/InstantID para preservação de identidade facial em retratos.
 * O token "img" no prompt ancora a identidade da selfie na cena gerada.
 */
class ImagePipelineService {
    constructor() {
        if (process.env.FAL_KEY) {
            fal.config({ credentials: process.env.FAL_KEY });
            console.log("[Backend-AI V6] Motor PhotoMaker configurado com sucesso.");
        } else {
            console.warn("[Backend-AI V6] AVISO: FAL_KEY não definida no ambiente!");
        }
    }

    async generateWithFaceID(imageFile, theme, customText) {
        try {
            if (!process.env.FAL_KEY) {
                throw new Error("FAL_KEY não configurada no servidor.");
            }

            console.log(`[Backend-AI V6] Acionando PhotoMaker. Tema: "${theme}"`);

            // 1. Prepara o prompt com o token "img" obrigatório
            let temaCena;
            if (customText && customText.trim().length > 3) {
                // Sonhos: incorpora descrição do usuário mantendo o token "img"
                temaCena = `a photo of img in ${customText.trim()}, photorealistic portrait, natural expression, sharp focus on face, cinematic lighting, 8k masterpiece`;
            } else {
                temaCena = themePrompts[theme] || themePrompts['executivo'];
            }

            console.log(`[Backend-AI V6] Prompt: "${temaCena.substring(0, 100)}..."`);

            // 2. Upload da selfie para o Fal.ai Storage
            console.log(`[Backend-AI V6] Uploading selfie...`);
            const imageData = fs.readFileSync(imageFile.path);
            const fileBlob = new Blob([imageData], { type: imageFile.mimetype || 'image/jpeg' });

            let referenceImageUrl;
            try {
                referenceImageUrl = await fal.storage.upload(fileBlob);
                console.log(`[Backend-AI V6] Upload OK: ${referenceImageUrl}`);
            } catch (uploadErr) {
                throw new Error(`Falha no upload da selfie: ${uploadErr.message}`);
            }

            // 3. Geração com PhotoMaker
            // PhotoMaker usa "stacked ID embedding" para fixar a identidade da selfie.
            // O token "img" no prompt diz ao modelo ONDE e COMO colocar o rosto real.
            console.log(`[Backend-AI V6] Iniciando geração PhotoMaker...`);
            const result = await fal.subscribe("fal-ai/photomaker", {
                input: {
                    prompt: temaCena,
                    input_image_urls: [referenceImageUrl],
                    negative_prompt: "nsfw, lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, signature, watermark, username, blurry, abstract art, cartoon, anime, painting, illustration, plastic face, over-smoothed skin",
                    style: "Photographic (Default)",
                    num_inference_steps: 30,
                    guidance_scale: 5.0,
                    style_strength_ratio: 20,
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        const lastLog = update.logs?.at(-1)?.message || '';
                        if (lastLog) console.log(`[PhotoMaker] ${lastLog}`);
                    }
                }
            });

            console.log("[Backend-AI V6] Resposta recebida:", JSON.stringify(result?.data || result, null, 2));

            // PhotoMaker retorna: result.data.images[0].url
            const outputUrl =
                result?.data?.images?.[0]?.url ||
                result?.images?.[0]?.url ||
                result?.data?.image?.url ||
                result?.image?.url;

            if (!outputUrl) {
                throw new Error(`PhotoMaker não retornou URL de imagem. Resposta completa: ${JSON.stringify(result)}`);
            }

            console.log(`[Backend-AI V6] SUCESSO! Imagem gerada: ${outputUrl}`);

            return {
                status: "success",
                output_url: outputUrl,
                orderId: `PEDIDO_${Date.now()}`
            };

        } catch (error) {
            console.error(`[Backend-AI V6] FALHA CRÍTICA:`, error.message);
            throw error;
        }
    }
}

module.exports = new ImagePipelineService();
