const fs = require('fs');
const themePrompts = require('../constants/themePrompts');
const { fal } = require("@fal-ai/client");

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - VYXFOTOS REAL-AI
 * Integração oficial com Fal.ai para geração de retratos profissionais.
 */
class ImagePipelineService {
    constructor() {
        if (process.env.FAL_KEY) {
            fal.config({
                credentials: process.env.FAL_KEY,
            });
            console.log("[Backend-AI] Fal.ai Client Configurado com sucesso.");
        } else {
            console.warn("[Backend-AI] AVISO CRÍTICO: FAL_KEY não está definida no ambiente!");
        }
    }

    async generateWithFaceID(imageFile, theme, customText) {
        try {
            if (!process.env.FAL_KEY) {
                throw new Error("FAL_KEY não configurada no servidor. Adicione no painel do Render.");
            }

            console.log(`[Backend-AI] Motor Real Acionado - Tema: ${theme}`);

            // 1. Prepara o prompt (Cenário)
            const temaCena = customText && customText.trim() !== ''
                ? customText
                : (themePrompts[theme] || themePrompts['luxo']);

            console.log(`[Backend-AI] Prompt: "${temaCena.substring(0, 60)}..."`);

            // 2. Upload da Selfie para a nuvem do Fal.ai
            // A API v1.x do @fal-ai/client usa fal.storage.upload() com um Blob
            console.log(`[Backend-AI] Fazendo upload do arquivo: ${imageFile.path}`);
            const imageData = fs.readFileSync(imageFile.path);
            const mimeType = imageFile.mimetype || 'image/jpeg';
            const fileBlob = new Blob([imageData], { type: mimeType });

            let imageUrl;
            try {
                imageUrl = await fal.storage.upload(fileBlob);
                console.log(`[Backend-AI] Upload Concluído. URL: ${imageUrl}`);
            } catch (uploadErr) {
                console.error("[Backend-AI] Erro no Upload para Fal.ai:", uploadErr.message);
                throw new Error(`Falha ao subir imagem: ${uploadErr.message}`);
            }

            // 3. Geração InstantID com Foco em Fidelidade Humana V3
            console.log(`[Backend-AI] Iniciando renderização neural de ALTA FIDELIDADE...`);
            const result = await fal.subscribe("fal-ai/instantid", {
                input: {
                    face_image_url: imageUrl,
                    prompt: temaCena,
                    negative_prompt: "abstract, colorful art, high contrast, over-saturated, (bad anatomy, blurry, cartoon, anime, illustration, 3d, rendering, plastic, smooth skin:1.3), messy hair, closed eyes, watermark, signature, vibrant colors, neon, pop art",
                    image_size: "portrait_4_3",
                    num_inference_steps: 50,
                    guidance_scale: 5.0,
                    ip_adapter_scale: 0.8,
                    controlnet_conditioning_scale: 0.8
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        const lastLog = update.logs?.at(-1)?.message || '';
                        if (lastLog) console.log(`[Fal.ai] ${lastLog}`);
                    }
                }
            });

            console.log("[Backend-AI] Resultado bruto do Fal:", JSON.stringify(result, null, 2));

            // Ajuste no caminho da URL: O modelo InstantID retorna dentro de 'data'
            const outputUrl = result?.data?.image?.url || result?.images?.[0]?.url || result?.image?.url;

            if (!outputUrl) {
                throw new Error(`A IA não retornou URL. Resposta: ${JSON.stringify(result)}`);
            }

            console.log(`[Backend-AI] SUCESSO! Foto gerada: ${outputUrl}`);

            return {
                status: "success",
                output_url: outputUrl,
                prompt_usado: temaCena,
                orderId: `PEDIDO_${Date.now()}`
            };

        } catch (error) {
            console.error(`[Backend-AI] FALHA CRÍTICA:`, error.message);
            throw error;
        }
    }
}

module.exports = new ImagePipelineService();
