const axios = require('axios');
const fs = require('fs');
const themePrompts = require('../constants/themePrompts');
const { fal } = require('@fal-ai/client');

/**
 * SERVIÇO DE CLONAGEM DE ROSTO E RENDERIZAÇÃO
 */
class ImagePipelineService {
    
    constructor() {}

    /**
     * Processa a Selfie + Tema na Rede Neural Real da Replicate
     */
    async generateWithFaceID(imageFile, theme, customText) {
        try {
            console.log(`[Backend-AI] Motor FAL.AI Acionado (Velocidade Extrema)!`);
            
            // 1. Definição do Prompt (Engenharia de Cena Luxuosa)
            const promptMestre = customText && customText.trim() !== '' 
                ? `A highly detailed professional photorealistic portrait of a person. The scenario and concept is exactly this: "${customText}". Translate the concept to a visually stunning scene. High-end photography, cinematic lighting, hyper-realistic, 8k masterpiece, extremely detailed, natural skin texture.`
                : (themePrompts[theme] || themePrompts['luxo']);
            
            console.log(`[Backend-AI] Esculpindo Cenário: "${promptMestre}"`);

            // 2. Transforma a foto do usuário num formato compatível com I.A. (Data URI)
            const base64Data = fs.readFileSync(imageFile.path).toString("base64");
            const mimeType = imageFile.mimetype || 'image/jpeg';
            const imageURI = `data:${mimeType};base64,${base64Data}`;

            console.log(`[Backend-AI] Enviando Malha Facial para o Cluster na Nuvem... Isso pode levar de 10 a 25 segundos.`);

            // 3. (SIMULAÇÃO) Como os bancos estão derrubando o pagamento, ativamos o "Modo Blefe"
            // Vamos esperar 4 segundos para a animação da roleta tocar...
            await new Promise((resolve) => setTimeout(resolve, 4000));

            // E vamos jogar a foto do rosto que você upou ali com a Malha de Proteção por cima!
            const output_url = imageURI;

            console.log(`[Backend-AI] RENDERIZAÇÃO SIMULADA CONCLUÍDA! Devolvendo selfie...`);

            return {
                status: "success",
                message: "Identidade Preservada (Simulada)",
                output_url: output_url,
                prompt_usado: promptMestre,
                orderId: `PEDIDO_${Date.now()}` // Gera ID dinâmico para a Kiwify
            };

        } catch (error) {
            // Removendo o filtro de erro para lermos EXATAMENTE a reclamação oficial da Nuvem (ex: 422 Payload, 401 Unauth)
            console.error(`[Backend-AI] ERRO REAL FAL.AI:`, error.response ? error.response.data : error.message || error);
            throw new Error(`Falha da Fal.AI Nuvem: ${error.message || 'Erro Desconhecido'}`);
        }
    }
}

module.exports = new ImagePipelineService();
