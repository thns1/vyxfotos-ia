const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

/**
 * SERVIÇO GOOGLE VERTEX AI - V24.0 (FULL BODY ELITE - SINGULAR)
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = 'us-central1';
        this.modelId = 'imagen-3.0-capability-001';
        this.auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelId}:predict`;
    }

    async generateWithFaceID(imageFile, theme, customText, gender) {
        try {
            console.log(`[Google-AI V24] Iniciando Geração Unica: Tema="${theme}" | Genero="${gender}"`);

            // 1. Carrega Prompts do Arquivo de Constantes
            const themePrompts = require('../constants/themePrompts');
            let basePrompt = themePrompts[theme] || themePrompts['executivo'];

            // 2. Processa Custom Text (Se existir)
            let promptFinal = basePrompt;
            if ((theme === 'custom' || theme === 'sonhos') && customText) {
                promptFinal = `A professional full body RAW photo of [1] ${customText}. Natural skin textures, visible pores, standing posture. NO BEAUTY FILTERS.`;
            }

            console.log(`[Google-AI V24] Prompt: "${promptFinal.substring(0, 100)}..."`);

            // 3. Converte selfie para Base64
            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // 4. Instrução de Fidelidade Bruta V24
            const atomicWipeInstruction = "Strictly preserve the identity of [1]. DO NOT smooth the skin. DO NOT use beauty filters. Keep natural skin textures, visible pores. RELIGHT the subject with professional studio lighting but maintain the raw, unretouched character. DISCARD and DELETE the original background (no gaming chair, no red curtains).";

            const requestBody = {
                instances: [
                    {
                        prompt: promptFinal,
                        referenceImages: [
                            {
                                referenceType: "REFERENCE_TYPE_SUBJECT",
                                referenceId: 1,
                                referenceImage: {
                                    bytesBase64Encoded: imageData,
                                    mimeType: mimeType
                                },
                                subjectImageConfig: {
                                    subjectType: "SUBJECT_TYPE_PERSON",
                                    subjectDescription: atomicWipeInstruction
                                }
                            },
                            {
                                referenceType: "REFERENCE_TYPE_CONTROL",
                                referenceId: 2,
                                referenceImage: {
                                    bytesBase64Encoded: imageData,
                                    mimeType: mimeType
                                },
                                controlImageConfig: {
                                    controlType: "CONTROL_TYPE_FACE_MESH"
                                }
                            }
                        ]
                    }
                ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "3:4"
                }
            };

            // 5. Executa a Chamada
            const client = await this.auth.getClient();
            const tokenResponse = await client.getAccessToken();
            const token = tokenResponse.token;

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseJson = await response.json();
            if (!response.ok) {
                throw new Error(`Google API Error ${response.status}: ${JSON.stringify(responseJson.error || responseJson)}`);
            }

            const prediction = responseJson?.predictions?.[0];
            const imageBase64 = prediction?.bytesBase64Encoded;

            if (!imageBase64) {
                throw new Error("Google não retornou imagem.");
            }

            console.log(`[Google-AI V24] SUCESSO! Foto ELITE de corpo inteiro gerada.`);
            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V24] FALHA:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleImageService();
