const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');
const themePrompts = require('../constants/themePrompts');

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - GOOGLE IMAGEN 3 ELITE (V8.4 - REST)
 *
 * Usa a REST API direta do Vertex AI (não gRPC).
 * Isso elimina problemas de serialização de proto e é 100% estável.
 */
class GoogleImageService {
    constructor() {
        this.projectId = 'vyxfotos-493415';
        this.location = 'us-central1';
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/imagen-3.0-capability-001:predict`;

        // Configuração do cliente de autenticação
        const authConfig = { scopes: ['https://www.googleapis.com/auth/cloud-platform'] };
        if (process.env.GOOGLE_CREDS_JSON) {
            authConfig.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON);
        }
        this.auth = new GoogleAuth(authConfig);

        console.log('[Google-AI V8.4] Motor REST Imagen 3 Elite configurado.');
    }

    async generateWithFaceID(imageFile, theme, customText) {
        try {
            console.log(`[Google-AI] Iniciando geração. Tema: ${theme}`);

            // 1. Prompt com marcação [1] para identidade e [2] para estrutura facial (Face Mesh)
            let promptElite;
            if (customText && customText.trim().length > 3) {
                promptElite = `A high-quality professional portrait of person [1] maintaining exact facial structure as shown in [2], in ${customText.trim()}, 85mm portrait photography, sharp focus, cinematic lighting, 8k resolution.`;
            } else {
                const base = themePrompts[theme] || themePrompts['executivo'];
                // Insere marcação [1] e [2] no começo do prompt para ancorar identidade e geometria
                promptElite = `Professional portrait of person [1] with exact facial geometry of [2], ${base}`;
            }

            console.log(`[Google-AI] Prompt: "${promptElite.substring(0, 100)}..."`);

            // 2. Converte selfie para Base64
            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // 3. Monta o body REST com Dupla Referência (Sujeito + Face Mesh) para Fidelidade Máxima
            const requestBody = {
                instances: [
                    {
                        prompt: promptElite,
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
                                    subjectDescription: "the specific person with identical facial structure, eyes, nose, and jawline as shown in the reference image"
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

            // 4. Obtém token de acesso
            const client = await this.auth.getClient();
            const tokenResponse = await client.getAccessToken();
            const token = tokenResponse.token;

            // 5. Chama a REST API do Vertex AI
            console.log('[Google-AI] Chamando Vertex AI REST...');
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseJson = await response.json();
            console.log('[Google-AI] Resposta:', JSON.stringify(responseJson).substring(0, 200));

            if (!response.ok) {
                throw new Error(`Google API Error ${response.status}: ${JSON.stringify(responseJson.error || responseJson)}`);
            }

            // 6. Extrai a imagem da resposta
            const prediction = responseJson?.predictions?.[0];
            const imageBase64 = prediction?.bytesBase64Encoded;

            if (!imageBase64) {
                throw new Error(`Google não retornou imagem. Resposta: ${JSON.stringify(responseJson).substring(0, 300)}`);
            }

            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI] FALHA CRÍTICA:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleImageService();
