const fs = require('fs');
const themePrompts = require('../constants/themePrompts');
const { fal } = require("@fal-ai/client");

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - VYXFOTOS REAL-AI
 * Integração oficial com Fal.ai para geração de retratos profissionais.
 */
class ImagePipelineService {
    constructor() {
        // Configura as credenciais da API
        fal.config({
            credentials: process.env.FAL_KEY,
        });
    }

    async generateWithFaceID(imageFile, theme, customText) {
        try {
            console.log(`[Backend-AI] Motor Real Acionado - Iniciando Processamento para tema: ${theme}`);

            // 1. Prepara o prompt (Cenário)
            const temaCena = customText && customText.trim() !== ''
                ? customText
                : (themePrompts[theme] || themePrompts['luxo']);

            console.log(`[Backend-AI] Esculpindo Cenário: "${temaCena}"`);

            // 2. Faz o Upload da Selfie para a Fal.ai (Necessário para a API deles)
            console.log(`[Backend-AI] Fazendo upload da selfie de referência...`);
            const imageData = fs.readFileSync(imageFile.path);
            const imageUrl = await fal.upload(imageData, {
                contentType: imageFile.mimetype || 'image/jpeg',
                fileName: `selfie_${Date.now()}.jpg`
            });

            // 3. Chama o modelo Face-to-Face (InstantID) para manter a fidelidade do rosto
            console.log(`[Backend-AI] Solicitando renderização neural ao Fal.ai...`);
            const result = await fal.subscribe("fal-ai/face-to-face", {
                input: {
                    face_image: imageUrl,
                    prompt: temaCena,
                    negative_prompt: "cartoon, anime, ugly, deformed, blurry, low quality, distorted, bad anatomy, text, watermark",
                    width: 768,
                    height: 1024,
                    num_inference_steps: 35,
                    guidance_scale: 7.5,
                    ip_adapter_scale: 0.8,
                    controlnet_conditioning_scale: 0.8
                },
                logs: true,
                onQueueUpdate: (update) => {
                    console.log(`[Fal.ai] Progresso: ${update.status} - ${update.logs?.at(-1)?.message || ''}`);
                }
            });

            console.log(`[Backend-AI] RENDERIZAÇÃO CONCLUÍDA COM SUCESSO!`);

            return {
                status: "success",
                message: "Imagem gerada com sucesso",
                output_url: result.image.url,
                prompt_usado: temaCena,
                orderId: `PEDIDO_${Date.now()}`
            };

        } catch (error) {
            console.error(`[Backend-AI] ERRO NA GERAÇÃO REAL:`, error.message);
            throw new Error(`Falha na geração da I.A.: ${error.message}`);
        }
    }
}

module.exports = new ImagePipelineService();
