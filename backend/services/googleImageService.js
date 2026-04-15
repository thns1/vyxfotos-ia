const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

/**
 * SERVIÇO GOOGLE VERTEX AI - V39.0 (GEMINI WEB PROTOCOL - GENERATE-001)
 * - Modelo: imagen-3.0-generate-001 (Motor soberano do Google).
 * - Estratégia: Simulação 1:1 do comportamento do Gemini Web.
 * - Foco: Qualidade orgânica, 0% de filtros de plástico, zoom natural.
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = 'us-central1';
        // Trocamos para o modelo GENERATE-001 (Mais potente e orgânico)
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/imagen-3.0-generate-001:predict`;

        let authOptions = { scopes: 'https://www.googleapis.com/auth/cloud-platform' };
        if (process.env.GOOGLE_CREDS_JSON) {
            try { authOptions.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON); } catch (e) {}
        } else {
            const keyPath = path.join(__dirname, '../../vyxfotos-493415-3d24a459e5c7.json');
            if (fs.existsSync(keyPath)) authOptions.keyFilename = keyPath;
        }
        this.auth = new GoogleAuth(authOptions);
    }

    async generateWithFaceID(imageFile, theme, customText, gender = 'masculino') {
        try {
            console.log(`[Google-AI V39] MODO GEMINI-WEB (GENERATE-001): ${theme}`);
            const themePrompts = require('../constants/themePrompts');
            let promptBase = themePrompts[theme] || themePrompts['executivo'];

            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // PROTOCOLO V39: Simulação direta do Upload + Prompt do Gemini Web
            // Removemos todas as amarras mecânicas.
            const promptFinal = promptBase
                .replace(/portrait photograph/gi, "medium-wide shot photograph, waist up")
                .replace(/85mm/gi, "50mm");

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
                                    subjectDescription: "The exact individual from [1]. Maintain high-fidelity organic skin texture. Organic RAW quality. No plastic skin. No generic faces. Replace all background elements."
                                }
                            }
                        ]
                    }
                ],
                parameters: { 
                    sampleCount: 1, 
                    aspectRatio: "1:1",
                    // Parâmetros de fidelidade negativa para evitar o 'chorume'
                    negativePrompt: "gaming chair, red curtains, artificial skin, plastic texture, smooth skin, cartoon, generic man, blurred face"
                }
            };

            const client = await this.auth.getClient();
            const tokenResponse = await client.getAccessToken();
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${tokenResponse.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const responseJson = await response.json();
            if (!response.ok) throw new Error(`Google API Error: ${JSON.stringify(responseJson)}`);

            const imageBase64 = responseJson?.predictions?.[0]?.bytesBase64Encoded;
            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V39] FALHA:', error.message);
            throw error;
        }
    }
}
module.exports = new GoogleImageService();
