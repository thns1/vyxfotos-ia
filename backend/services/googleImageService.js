const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

/**
 * SERVIÇO GOOGLE VERTEX AI - V25.0 (ELITE FULL BODY - RESCUE)
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = 'us-central1';
        this.modelId = 'imagen-3.0-capability-001';
        
        // Ambiente Híbrido
        let authOptions = { scopes: 'https://www.googleapis.com/auth/cloud-platform' };
        if (process.env.GOOGLE_CREDS_JSON) {
            try {
                authOptions.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON);
            } catch (e) { console.error('Erro na ENV:', e.message); }
        } else {
            const keyPath = path.join(__dirname, '../../vyxfotos-493415-3d24a459e5c7.json');
            if (fs.existsSync(keyPath)) authOptions.keyFilename = keyPath;
        }

        this.auth = new GoogleAuth(authOptions);
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelId}:predict`;
    }

    async generateWithFaceID(imageFile, theme, customText, gender) {
        try {
            console.log(`[Google-AI V25] MODO ELITE FULL BODY: ${theme}`);

            // 1. Carrega Prompts do Arquivo de Constantes
            const themePrompts = require('../constants/themePrompts');
            let promptFinal = themePrompts[theme] || themePrompts['executivo'];

            if ((theme === 'custom' || theme === 'sonhos') && customText) {
                promptFinal = `RAW PHOTO, WIDE SHOT, FULL BODY PHOTO of [1] ${customText}. Natural skin pores, standing head to toe. DISCARD ORIGINAL BACKGROUND.`;
            }

            // 2. Converte selfie para Base64
            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // 3. Instrução Atômica de Limpeza e Identidade (MODO BRUTO V25)
            // A prioridade aqui é EXCLUIR o fundo e MANTER a face 22.0
            const atomicWipeInstruction = "STRICTLY PRESERVE THE IDENTITY OF [1]. DO NOT SMOOTH SKIN. NO BEAUTY FILTERS. RAW SKIN TEXTURES AND PORES. COMPLETELY DELETE ORIGINAL BACKGROUND, NO GAMING CHAIR, NO ROOM OBJECTS. FOCUS ON A PROFESSIONAL FULL BODY STANDING POSTURE FROM HEAD TO TOE IN A LUXURY SCENARIO.";

            const requestBody = {
                instances: [
                    {
                        prompt: promptFinal,
                        referenceImages: [
                            {
                                referenceType: "REFERENCE_TYPE_SUBJECT",
                                referenceId: 1,
                                referenceImage: { bytesBase64Encoded: imageData, mimeType: mimeType },
                                subjectImageConfig: { subjectType: "SUBJECT_TYPE_PERSON", subjectDescription: atomicWipeInstruction }
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

            // 5. Chamada Final
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

            const prediction = responseJson?.predictions?.[0];
            const imageBase64 = prediction?.bytesBase64Encoded;

            if (!imageBase64) throw new Error("IA não retornou imagem.");

            console.log(`[Google-AI V25] SUCESSO! Foto de Elite gerada.`);
            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V25] FALHA:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleImageService();
