const fs = require('fs');
const themePrompts = require('../constants/themePrompts');
const { fal } = require("@fal-ai/client");

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - VYXFOTOS V4
 * Motor: fal-ai/flux-pulid (FLUX + PuLID)
 * O melhor modelo do Fal.ai para preservação de identidade facial fotorrealista.
 * A selfie de referência preserva 100% das feições (olhos, nariz, boca, cabelo).
 * O prompt descreve apenas cenário, estilo e iluminação.
 */
class ImagePipelineService {
    constructor() {
        if (process.env.FAL_KEY) {
            fal.config({ credentials: process.env.FAL_KEY });
            console.log("[Backend-AI] Motor V4 (flux-pulid) configurado com sucesso.");
        } else {
            console.warn("[Backend-AI] AVISO: FAL_KEY não definida!");
        }
    }

    async generateWithFaceID(imageFile, theme, customText) {
        try {
            if (!process.env.FAL_KEY) {
                throw new Error("FAL_KEY não configurada no servidor.");
            }

            console.log(`[Backend-AI V4] Acionando motor FLUX-PuLID. Tema: "${theme}"`);

            // 1. Prepara o prompt — descreve CENÁRIO e ESTILO, não a pessoa
            //    (as feições vêm da selfie de referência automaticamente pelo PuLID)
            let temaCena;
            if (customText && customText.trim().length > 3) {
                // Para tema "sonhos", o usuário descreve o cenário livremente
                temaCena = `${themePrompts['sonhos'].replace('breathtaking dreamlike landscape, surreal and majestic', customText.trim())}, photorealistic portrait.`;
            } else {
                temaCena = themePrompts[theme] || themePrompts['executivo'];
            }

            console.log(`[Backend-AI V4] Prompt: "${temaCena.substring(0, 80)}..."`);

            // 2. Upload da selfie para o armazenamento do Fal.ai
            console.log(`[Backend-AI V4] Uploading selfie: ${imageFile.path}`);
            const imageData = fs.readFileSync(imageFile.path);
            const fileBlob = new Blob([imageData], { type: imageFile.mimetype || 'image/jpeg' });

            let referenceImageUrl;
            try {
                referenceImageUrl = await fal.storage.upload(fileBlob);
                console.log(`[Backend-AI V4] Upload OK: ${referenceImageUrl}`);
            } catch (uploadErr) {
                throw new Error(`Falha no upload da selfie: ${uploadErr.message}`);
            }

            // 3. Geração com FLUX-PuLID
            // PuLID injeta a identidade facial da selfie diretamente na geração FLUX,
            // produzindo resultados fotorrealistas que preservam os traços da pessoa.
            console.log(`[Backend-AI V4] Iniciando geração FLUX-PuLID...`);
            const result = await fal.subscribe("fal-ai/flux-pulid", {
                input: {
                    prompt: temaCena,
                    reference_image_url: referenceImageUrl,
                    num_inference_steps: 25,
                    guidance_scale: 4.0,
                    num_images: 1,
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        const lastLog = update.logs?.at(-1)?.message || '';
                        if (lastLog) console.log(`[Fal.ai PuLID] ${lastLog}`);
                    }
                }
            });

            console.log("[Backend-AI V4] Resultado:", JSON.stringify(result?.data || result, null, 2));

            // Extrai a URL do resultado (PuLID retorna result.data.images[0].url)
            const outputUrl =
                result?.data?.images?.[0]?.url ||
                result?.images?.[0]?.url ||
                result?.data?.image?.url ||
                result?.image?.url;

            if (!outputUrl) {
                throw new Error(`PuLID não retornou URL. Resposta: ${JSON.stringify(result)}`);
            }

            console.log(`[Backend-AI V4] SUCESSO! Imagem gerada: ${outputUrl}`);

            return {
                status: "success",
                output_url: outputUrl,
                prompt_usado: temaCena,
                orderId: `PEDIDO_${Date.now()}`
            };

        } catch (error) {
            console.error(`[Backend-AI V4] FALHA:`, error.message);
            throw error;
        }
    }
}

module.exports = new ImagePipelineService();
