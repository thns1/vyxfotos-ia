const fs = require('fs');
const themePrompts = require('../constants/themePrompts');
const { fal } = require("@fal-ai/client");

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - VYXFOTOS V7 (ELITE IDENTITY)
 * Motor: fal-ai/flux-pulid
 * 
 * Este motor combina o realismo do FLUX com a tecnologia PuLID.
 * Calibrado para fidelidade facial extrema (id_weight: 1.0).
 */
class ImagePipelineService {
    constructor() {
        if (process.env.FAL_KEY) {
            fal.config({ credentials: process.env.FAL_KEY });
            console.log("[Backend-AI V7] Motor Flux-PuLID (Elite) configurado.");
        }
    }

    async generateWithFaceID(imageFile, theme, customText) {
        try {
            if (!process.env.FAL_KEY) throw new Error("FAL_KEY ausente.");

            // 1. Prompt focado apenas em CENÁRIO e LUZ (Identidade vem 100% da imagem)
            let temaCena = themePrompts[theme] || themePrompts['executivo'];
            
            // Se for tema livre (sonhos), usamos o texto do usuário
            if (customText && customText.trim().length > 3) {
                temaCena = `a high-quality professional portrait photo of a person in ${customText.trim()}, 85mm lens, f/2.2, sharp focus, photorealistic, 8k quality`;
            }

            console.log(`[Backend-AI V7] Gerando com motor Elite. Tema: ${theme}`);

            // 2. Upload
            const imageData = fs.readFileSync(imageFile.path);
            const fileBlob = new Blob([imageData], { type: imageFile.mimetype || 'image/jpeg' });
            const referenceImageUrl = await fal.storage.upload(fileBlob);

            // 3. Geração com Calibração de Identidade Máxima
            const result = await fal.subscribe("fal-ai/flux-pulid", {
                input: {
                    prompt: temaCena,
                    reference_image_url: referenceImageUrl,
                    // Parâmetros de ELITE para fidelidade total
                    id_weight: 1.0,           // Força máxima na identidade da selfie
                    num_inference_steps: 40,   // Alta densidade de pixels
                    guidance_scale: 3.5,       // Evita o aspecto de "pintura"
                    num_images: 1,
                    image_size: "portrait_4_3"
                },
                logs: true
            });

            const outputUrl = result?.data?.images?.[0]?.url || result?.images?.[0]?.url;

            if (!outputUrl) throw new Error("Falha ao obter URL da imagem.");

            console.log(`[Backend-AI V7] SUCESSO: ${outputUrl}`);

            return {
                status: "success",
                output_url: outputUrl,
                orderId: `PEDIDO_${Date.now()}`
            };

        } catch (error) {
            console.error(`[Backend-AI V7] Erro:`, error.message);
            throw error;
        }
    }
}

module.exports = new ImagePipelineService();
