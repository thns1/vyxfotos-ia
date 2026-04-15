const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

/**
 * SERVIÇO GOOGLE VERTEX AI - V39.1 (GEMINI WEB PROTOCOL - FIX)
 * - Correção da estrutura de bytes para o modelo 'generate-001'.
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = 'us-central1';
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
            console.log(`[Google-AI V39.1] CORRIGINDO PAYLOAD GENERATE-001: ${theme}`);
            const themePrompts = require('../constants/themePrompts');
            let promptBase = themePrompts[theme] || themePrompts['executivo'];

            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // Ajuste de Prompt para Plano Médio (DNA Gemini Web)
            const promptFinal = promptBase
                .replace(/portrait photograph/gi, "medium-wide shot photograph, waist up")
                .replace(/85mm portrait lens/gi, "50mm wide lens");

            const requestBody = {
                instances: [
                    {
                        prompt: promptFinal,
                        referenceImages: [
                            {
                                referenceId: 1,
                                referenceType: "REFERENCE_TYPE_SUBJECT",
                                // Correção V39.2: Campo correto para o motor Generate-001 é 'image'
                                image: { 
                                    bytesBase64Encoded: imageData
                                },
                                subjectImageConfig: { 
                                    subjectType: "SUBJECT_TYPE_PERSON", 
                                    subjectDescription: "The exact individual from [1]. RAW organic skin texture. High-fidelity identity. Professional scenario." 
                                }
                            }
                        ]
                    }
                ],
                parameters: { 
                    sampleCount: 1, 
                    aspectRatio: "1:1",
                    negativePrompt: "gaming chair, red curtains, artificial skin, plastic, cartoon, generic man"
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
            console.error('[Google-AI V39.1] FALHA:', error.message);
            throw error;
        }
    }
}
module.exports = new GoogleImageService();
