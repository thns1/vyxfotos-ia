const axios = require('axios');
const fs = require('fs');
const themePrompts = require('../constants/themePrompts');
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * SERVIÇO DE CLONAGEM DE ROSTO E RENDERIZAÇÃO (GOOGLE GEMINI 3 PRO - NANO BANANA)
 * FINAL PRODUCTION ENGINE
 */
class ImagePipelineService {
    
    constructor() {
        this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
    }

    /**
     * Auxiliar para ler arquivo e transformar em part do Google
     */
    fileToGenerativePart(path, mimeType) {
        return {
            inlineData: {
                data: Buffer.from(fs.readFileSync(path)).toString("base64"),
                mimeType
            },
        };
    }

    /**
     * Processa a Selfie + Tema na Rede Neural Real do Google AI Studio
     */
    async generateWithFaceID(imageFile, theme, customText) {
        try {
            console.log(`[Backend-AI] Motor GOOGLE NANO BANANA Acionado (Fidelidade Extrema)!`);
            
            const model = this.genAI.getGenerativeModel({ model: "gemini-3-pro-image-preview" });

            // 1. Definição do Prompt (Foco em Subject Consistency)
            const temaCena = customText && customText.trim() !== '' 
                ? customText 
                : (themePrompts[theme] || themePrompts['luxo']);
            
            const promptFinal = `
                ACT AS A PROFESSIONAL PHOTOGRAPHER. 
                USE THE ATTACHED IMAGE AS MANDATORY IDENTITY ANCHOR. 
                MAINTAIN FACE GEOMETRY, EYES, NOSE, LIPS, AND SKIN TEXTURE 100% IDENTICAL.
                
                RENDER THE FINAL PORTRAIT IN THIS SCENARIO: "${temaCena}".
                
                STYLE: Cinematic lighting, luxury photography, 8k resolution, photorealistic, blurred high-end studio background.
                QUALITY: Sharp focus on face, non-distorted features, premium color grading.
            `.trim();

            console.log(`[Backend-AI] Enviando Selfie e Prompt para ancoragem no Google...`);

            // 2. Transforma a foto do usuário num formato compatível com Google GenAI
            const imagePart = this.fileToGenerativePart(imageFile.path, imageFile.mimetype || 'image/jpeg');

            // 3. CHAMADA REAL GOOGLE AI STUDIO (GEMINI 3 PRO IMAGE)
            // Nota: gemini-3-pro-image-preview usa o método generateContent para multimodal image creation
            const result = await model.generateContent([promptFinal, imagePart]);
            
            // O Google devolve a imagem gerada no formato candidates -> content -> parts
            const response = await result.response;
            const generatedImagePart = response.candidates[0].content.parts.find(p => p.inlineData);

            if (!generatedImagePart) {
                throw new Error("O Google não retornou uma imagem gerada. Verifique o limite da sua API.");
            }

            // O Google costuma devolver a imagem gerada como Base64 inline
            const output_url = `data:${generatedImagePart.inlineData.mimeType};base64,${generatedImagePart.inlineData.data}`;

            console.log(`[Backend-AI] RENDERIZAÇÃO GOOGLE CONCLUÍDA! Fidelidade preservada.`);

            return {
                status: "success",
                message: "Identidade Preservada (Google Nano Banana)",
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
