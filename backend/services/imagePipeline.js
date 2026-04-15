const googleImageService = require('./googleImageService');

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - VYXFOTOS V8 (GOOGLE ELITE)
 * 
 * Agora utilizando o Google Imagen 3 via Vertex AI.
 * Oferece a melhor fidelidade facial e realismo fotográfico do mercado.
 */
class ImagePipelineService {
    async generateWithFaceID(imageFile, theme, customText) {
        try {
            // Toda a lógica agora é delegada para o serviço do Google
            return await googleImageService.generateWithFaceID(imageFile, theme, customText);
        } catch (error) {
            console.error(`[Pipeline V8] FALHA:`, error.message);
            throw error;
        }
    }
}

module.exports = new ImagePipelineService();
