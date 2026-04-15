const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

/**
 * SERVIÇO GOOGLE VERTEX AI - V24.2 (ENV AUTH FIX + ELITE FOCUS)
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = 'us-central1';
        this.modelId = 'imagen-3.0-capability-001';
        
        // Configuração de Autenticação Universal
        let authOptions = {
            scopes: 'https://www.googleapis.com/auth/cloud-platform'
        };

        // 1. Tenta carregar credenciais da variável de ambiente (Caso prioritário para Render/Produção)
        if (process.env.GOOGLE_CREDS_JSON) {
            try {
                const credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON);
                authOptions.credentials = credentials;
                console.log('[Google-AI V24.2] Autenticação via GOOGLE_CREDS_JSON (Produção).');
            } catch (e) {
                console.error('[Google-AI V24.2] Erro ao parsear GOOGLE_CREDS_JSON:', e.message);
            }
        } 
        // 2. Fallback para arquivo local (Desenvolvimento)
        else {
            const keyPath = path.join(__dirname, '../../vyxfotos-493415-3d24a459e5c7.json');
            if (fs.existsSync(keyPath)) {
                authOptions.keyFilename = keyPath;
                console.log(`[Google-AI V24.2] Autenticação via arquivo local: ${keyPath}`);
            } else {
                console.warn('[Google-AI V24.2] Nenhuma credencial encontrada (ENV ou JSON). O GoogleAuth tentará o padrão do sistema.');
            }
        }

        this.auth = new GoogleAuth(authOptions);
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelId}:predict`;
    }

    async generateWithFaceID(imageFile, theme, customText, gender) {
        try {
            console.log(`[Google-AI V24.2] Gerando Elite Single Shot: ${theme}`);

            // 1. Carrega Prompts
            const themePrompts = require('../constants/themePrompts');
            let basePrompt = themePrompts[theme] || themePrompts['executivo'];

            // 2. Processa Custom/Sonhos
            let promptFinal = basePrompt;
            if ((theme === 'custom' || theme === 'sonhos') && customText) {
                promptFinal = `A professional full body RAW photo of [1] ${customText}. Natural skin textures, visible pores, head to toe.`;
            }

            // 3. Converte Base64
            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // 4. Instrução de Fidelidade (V24 - Antropométrica)
            const atomicWipeInstruction = "Strictly preserve the identity of [1]. DO NOT smooth skin. NO beauty filters. Keep pores/textures. RELIGHT with studio lamps. DISCARD background (DELETE gaming chair/curtains). Focus on a full body standing posture from head to toe.";

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

            // 5. Chamada API
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

            if (!imageBase64) throw new Error("Google não retornou imagem.");

            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V24.2] FALHA:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleImageService();
