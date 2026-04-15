const fs = require('fs');
const themePrompts = require('../constants/themePrompts');
const { fal } = require("@fal-ai/client");

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - VYXFOTOS REAL-AI
 * Integração oficial com Fal.ai para geração de retratos profissionais.
 */
class ImagePipelineService {
    constructor() {
        // Apenas configura se existir a chave
        if (process.env.FAL_KEY) {
            fal.config({
                credentials: process.env.FAL_KEY,
            });
            console.log("[Backend-AI] Fal.ai Client Configurado.");
        } else {
            console.warn("[Backend-AI] AVISO: FAL_KEY não está definida no ambiente!");
        }
    }

    async generateWithFaceID(imageFile, theme, customText) {
        try {
            if (!process.env.FAL_KEY) {
                throw new Error("FAL_KEY não configurada no servidor. Verifique o painel do Render.");
            }

            console.log(`[Backend-AI] Motor Real Acionado - Tema: ${theme}`);

            // 1. Prepara o prompt (Cenário)
            const temaCena = customText && customText.trim() !== ''
                ? customText
                : (themePrompts[theme] || themePrompts['luxo']);

            // 2. Upload da Selfie
            console.log(`[Backend-AI] Fazendo upload do arquivo: ${imageFile.path}`);
            const imageData = fs.readFileSync(imageFile.path);
            
            let imageUrl;
            try {
                imageUrl = await fal.upload(imageData, {
                    contentType: imageFile.mimetype || 'image/jpeg',
                    fileName: `selfie_${Date.now()}.jpg`
                });
                console.log(`[Backend-AI] Upload Concluído: ${imageUrl}`);
            } catch (uploadErr) {
                console.error("[Backend-AI] Erro no Upload para Fal.ai:", uploadErr.message);
                throw new Error(`Falha ao subir imagem para a nuvem da IA: ${uploadErr.message}`);
            }

            // 3. Geração Face-to-Face
            console.log(`[Backend-AI] Iniciando renderização neural...`);
            const result = await fal.subscribe("fal-ai/face-to-face", {
                input: {
                    face_image: imageUrl,
                    prompt: temaCena,
                    negative_prompt: "cartoon, anime, ugly, deformed, blurry, low quality, distorted, bad anatomy, text, watermark",
                    width: 768,
                    height: 1024
                },
                logs: true,
                onQueueUpdate: (update) => {
                    if (update.status === "IN_PROGRESS") {
                        console.log(`[Fal.ai] Processando... ${update.logs?.at(-1)?.message || ''}`);
                    }
                }
            });

            if (!result || !result.image || !result.image.url) {
                throw new Error("A IA não retornou uma URL de imagem válida.");
            }

            console.log(`[Backend-AI] SUCESSO! Foto gerada.`);

            return {
                status: "success",
                output_url: result.image.url,
                prompt_usado: temaCena,
                orderId: `PEDIDO_${Date.now()}`
            };

        } catch (error) {
            console.error(`[Backend-AI] FALHA CRÍTICA:`, error.message);
            throw error; // Repassa o erro original para o server.js capturar os detalhes
        }
    }
}

module.exports = new ImagePipelineService();
