const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

/**
 * SERVIÇO GOOGLE VERTEX AI - V26.0 (RESTORE ELITE + WIDE ANGLE FOCUS)
 * Removido Face Mesh para permitir afastamento da câmera sem "ancorar" na selfie original.
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = 'us-central1';
        this.modelId = 'imagen-3.0-capability-001';
        
        let authOptions = { scopes: 'https://www.googleapis.com/auth/cloud-platform' };
        if (process.env.GOOGLE_CREDS_JSON) {
            try {
                authOptions.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON);
            } catch (e) { console.error('Erro Auth ENV:', e.message); }
        } else {
            const keyPath = path.join(__dirname, '../../vyxfotos-493415-3d24a459e5c7.json');
            if (fs.existsSync(keyPath)) authOptions.keyFilename = keyPath;
        }

        this.auth = new GoogleAuth(authOptions);
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelId}:predict`;
    }

    async generateWithFaceID(imageFile, theme, customText, gender) {
        try {
            console.log(`[Google-AI V26] Restaurando Elite: ${theme}`);

            // 1. Carrega Prompts Estáveis
            const themePrompts = require('../constants/themePrompts');
            let promptFinal = themePrompts[theme] || themePrompts['executivo'];

            // 2. Converte selfie para Base64
            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // 3. Protocolo de Fidelidade V22.0 (RESTAURADO)
            // Ordem absoluta para manter identidade mas IGNORAR o cenário da selfie.
            const atomicWipeInstruction = "Strictly preserve the facial identity of [1]. DO NOT smooth the skin. DO NOT use beauty filters. Keep natural skin textures and visible pores. RELIGHT the subject with professional studio lighting. COMPLETELY IGNORE AND DELETE THE ORIGINAL BACKGROUND (NO GAMING CHAIR).";

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
                            }
                        ]
                    }
                ],
                parameters: { sampleCount: 1, aspectRatio: "3:4" }
            };

            // 4. Executa Chamada
            const client = await this.auth.getClient();
            const tokenResponse = await client.getAccessToken();
            const token = tokenResponse.token;

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const responseJson = await response.json();
            if (!response.ok) throw new Error(`Google API Error: ${JSON.stringify(responseJson)}`);

            const imageBase64 = responseJson?.predictions?.[0]?.bytesBase64Encoded;
            if (!imageBase64) throw new Error("Sem imagem.");

            console.log(`[Google-AI V26] SUCESSO! Qualidade Elite Restaurada.`);
            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V26] FALHA:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleImageService();
