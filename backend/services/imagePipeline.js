const fs = require('fs');
const themePrompts = require('../constants/themePrompts');

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - MODO SIMULAÇÃO
 * Retorna a própria selfie com marca d'água enquanto a I.A. real não está configurada.
 * Para ativar a I.A. real (Fal.ai), substitua o bloco de simulação abaixo.
 */
class ImagePipelineService {

    async generateWithFaceID(imageFile, theme, customText) {
        try {
            console.log(`[Backend-AI] Motor de Simulação Acionado.`);

            const temaCena = customText && customText.trim() !== ''
                ? customText
                : (themePrompts[theme] || themePrompts['luxo']);

            console.log(`[Backend-AI] Esculpindo Cenário: "${temaCena}"`);

            // Lê a selfie enviada e converte para base64 para exibição no frontend
            const base64Data = fs.readFileSync(imageFile.path).toString("base64");
            const mimeType = imageFile.mimetype || 'image/jpeg';
            const imageURI = `data:${mimeType};base64,${base64Data}`;

            // Simula o tempo de processamento da I.A. (3 segundos)
            await new Promise(resolve => setTimeout(resolve, 3000));

            console.log(`[Backend-AI] RENDERIZAÇÃO SIMULADA CONCLUÍDA! Devolvendo selfie...`);

            return {
                status: "success",
                message: "Simulação Concluída (I.A. Real em breve)",
                output_url: imageURI,
                prompt_usado: temaCena,
                orderId: `PEDIDO_${Date.now()}`
            };

        } catch (error) {
            console.error(`[Backend-AI] ERRO NA SIMULAÇÃO:`, error.message);
            throw new Error(`Falha na simulação: ${error.message}`);
        }
    }
}

module.exports = new ImagePipelineService();
