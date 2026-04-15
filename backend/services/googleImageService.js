const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

/**
 * SERVIÇO GOOGLE VERTEX AI - V29.0 (SILENT ELITE RESTORATION)
 * - Removida toda e qualquer descrição biométrica em texto (Evitar "viagem" da IA).
 * - Retorno ao protocolo exato da V22.0 + Ajuste de Lente para Corpo Inteiro.
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = 'us-central1';
        this.modelId = 'imagen-3.0-capability-001';
        
        // Autenticação Híbrida Estável
        let authOptions = { scopes: 'https://www.googleapis.com/auth/cloud-platform' };
        if (process.env.GOOGLE_CREDS_JSON) {
            try { authOptions.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON); } catch (e) {}
        } else {
            const keyPath = path.join(__dirname, '../../vyxfotos-493415-3d24a459e5c7.json');
            if (fs.existsSync(keyPath)) authOptions.keyFilename = keyPath;
        }
        this.auth = new GoogleAuth(authOptions);
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelId}:predict`;
    }

    async generateWithFaceID(imageFile, theme, customText, gender) {
        try {
            console.log(`[Google-AI V29] Restaurando V22.0 para Corpo Inteiro: ${theme}`);
            const themePrompts = require('../constants/themePrompts');
            let promptFinal = themePrompts[theme] || themePrompts['executivo'];

            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // PROTOCOLO V29: Silêncio de Texto + Fidelidade de Imagem
            // Comando para a IA: "Use a foto [1] apenas para a identidade e APAGUE todo o resto".
            const atomicWipeInstruction = "Strictly preserve the identity of [1]. ENTIRELY DISCARD AND IGNORE THE ORIGINAL BACKGROUND AND CLOTHES FROM [1]. Relight the subject with professional studio lighting. NO BEAUTY FILTERS.";

            const requestBody = {
                instances: [
                    {
                        prompt: promptFinal,
                        referenceImages: [
                            {
                                referenceType: "REFERENCE_TYPE_SUBJECT",
                                referenceId: 1,
                                referenceImage: { bytesBase64Encoded: imageData, mimeType: mimeType },
                                subjectImageConfig: { 
                                    subjectType: "SUBJECT_TYPE_PERSON", 
                                    subjectDescription: atomicWipeInstruction 
                                }
                            },
                            {
                                referenceType: "REFERENCE_TYPE_CONTROL",
                                referenceId: 2,
                                referenceImage: { bytesBase64Encoded: imageData, mimeType: mimeType },
                                controlImageConfig: { controlType: "CONTROL_TYPE_FACE_MESH" }
                            }
                        ]
                    }
                ],
                parameters: { sampleCount: 1, aspectRatio: "3:4" }
            };

            const client = await this.auth.getClient();
            const tokenResponse = await client.getAccessToken();
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${tokenResponse.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const responseJson = await response.json();
            if (!response.ok) throw new Error(`Google API: ${JSON.stringify(responseJson)}`);

            const imageBase64 = responseJson?.predictions?.[0]?.bytesBase64Encoded;
            if (!imageBase64) throw new Error("Sem retorno.");

            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V29] FALHA:', error.message);
            throw error;
        }
    }
}
module.exports = new GoogleImageService();
