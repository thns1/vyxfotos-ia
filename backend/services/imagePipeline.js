const googleImageService = require('./googleImageService');

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - VYXFOTOS V10 (GOOGLE ELITE + GÊNERO)
 */
class ImagePipelineService {
    async generateWithFaceID(imageFile, theme, customText, gender) {
        try {
            return await googleImageService.generateWithFaceID(imageFile, theme, customText, gender);
        } catch (error) {
            console.error(`[Pipeline V10] FALHA:`, error.message);
            throw error;
        }
    }
}

module.exports = new ImagePipelineService();
