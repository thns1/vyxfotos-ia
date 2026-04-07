const axios = require('axios');
const fs = require('fs');
const themePrompts = require('../constants/themePrompts');
const { GoogleGenAI } = require("@google/genai");

/**
 * SERVIÇO DE CLONAGEM DE ROSTO E RENDERIZAÇÃO (GOOGLE GEMINI 3 PRO - NANO BANANA)
 * FINAL PRODUCTION ENGINE v2 - SDK OFICIAL CORRETO
 */
class ImagePipelineService {
    
    constructor() {
        this.ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_KEY });
    }

    /**
     * Processa a Selfie + Tema na Rede Neural Real do Google AI Studio
     */
    async generateWithFaceID(imageFile, theme, customText) {
        try {
            console.log(`[Backend-AI] Motor GOOGLE NANO BANANA Acionado (Fidelidade Extrema)!`);

            // 1. Definição do Prompt (Foco em Subject Consistency)
            const temaCena = customText && customText.trim() !== '' 
                ? customText 
                : (themePrompts[theme] || themePrompts['luxo']);
            
            const promptFinal = `You are a professional portrait photographer AI. 
                The attached image contains a person's face. 
                USE THAT FACE as the MANDATORY IDENTITY ANCHOR - preserve the exact facial geometry, eyes, nose, lips, skin tone and texture.
                Generate a new professional portrait of this SAME PERSON in the following scenario: "${temaCena}".
                Style: Cinematic lighting, luxury photography, 8k resolution, photorealistic, premium studio background.
                The face must be identical to the reference photo. Only change the environment and clothing.`;

            console.log(`[Backend-AI] Enviando Selfie e Prompt para ancoragem no Google...`);

            // 2. Lê a imagem e converte para base64
            const imageData = fs.readFileSync(imageFile.path).toString("base64");
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // 3. CHAMADA REAL GOOGLE AI STUDIO (SDK @google/genai - OFICIAL)
            const response = await this.ai.models.generateContent({
                model: "gemini-3.1-flash-image-preview",
                contents: [
                    {
                        parts: [
                            { text: promptFinal },
                            {
                                inlineData: {
                                    mimeType: mimeType,
                                    data: imageData,
                                }
                            }
                        ]
                    }
                ],
                config: {
                    responseModalities: ['TEXT', 'IMAGE'],
                }
            });

            // 4. Extrai a imagem gerada da resposta
            const parts = response.candidates[0].content.parts;
            const generatedImagePart = parts.find(p => p.inlineData);

            if (!generatedImagePart) {
                const textPart = parts.find(p => p.text);
                console.error(`[Backend-AI] Google não retornou imagem. Resposta de texto:`, textPart?.text);
                throw new Error("O Google não retornou uma imagem. Verifique os logs para mais detalhes.");
            }

            const output_url = `data:${generatedImagePart.inlineData.mimeType};base64,${generatedImagePart.inlineData.data}`;

            console.log(`[Backend-AI] RENDERIZAÇÃO GOOGLE CONCLUÍDA! Fidelidade preservada.`);

            return {
                status: "success",
                message: "Identidade Preservada (Google Nano Banana Pro)",
                output_url: output_url,
                prompt_usado: promptFinal,
                orderId: `PEDIDO_${Date.now()}` 
            };

        } catch (error) {
            console.error(`[Backend-AI] ERRO REAL GOOGLE AI:`, error.message);
            throw new Error(`Falha no Google AI Studio: ${error.message}`);
        }
    }
}

module.exports = new ImagePipelineService();
