const fs = require('fs');
const { GoogleAuth } = require('google-auth-library');
const themePrompts = require('../constants/themePrompts');

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - GOOGLE IMAGEN 3 ELITE (V10.0)
 *
 * Motor: Vertex AI REST API (sem gRPC)
 * Novidade: Suporte a Gênero (Masculino/Feminino) com substituição automática nos prompts.
 * Fidelidade: Subject Customization + Face Mesh Control para identidade absoluta.
 */
class GoogleImageService {
    constructor() {
        this.projectId = 'vyxfotos-493415';
        this.location = 'us-central1';
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/imagen-3.0-capability-001:predict`;

        const authConfig = { scopes: ['https://www.googleapis.com/auth/cloud-platform'] };
        if (process.env.GOOGLE_CREDS_JSON) {
            authConfig.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON);
        }
        this.auth = new GoogleAuth(authConfig);

        console.log('[Google-AI V10] Motor REST configurado. Suporte a Gênero ativado.');
    }

    /**
     * Substitui termos de gênero no prompt baseado na seleção do usuário.
     * Isso garante que a IA gere o traje e o corpo correto (terno vs blazer/vestido).
     */
    _applyGender(prompt, gender) {
        if (gender === 'feminino') {
            return prompt
                .replace(/\b(man|men|male|gentleman|businessman)\b/gi, 'woman')
                .replace(/\b(his)\b/gi, 'her')
                .replace(/\b(he)\b/gi, 'she')
                .replace(/tailored mens executive suit/gi, "women's tailored blazer or executive suit")
                .replace(/mens executive/gi, "women's executive")
                .replace(/a man's/gi, "a woman's");
        }
        // Para masculino, mantém o prompt como está (já escrito no masculino)
        return prompt;
    }

    async generateWithFaceID(imageFile, theme, customText, gender = 'masculino') {
        try {
            console.log(`[Google-AI V10] Geração iniciada. Tema: "${theme}" | Gênero: "${gender}"`);

            // 1. Seleciona o prompt base do PDF
            let promptBase;
            if (customText && customText.trim().length > 3) {
                // Tema livre: usa o núcleo de fidelidade do tema + descrição do usuário
                promptBase = `${themePrompts['executivo']} The scene setting is: ${customText.trim()}.`;
            } else {
                promptBase = themePrompts[theme] || themePrompts['executivo'];
            }

            // 2. Aplica o gênero selecionado pelo usuário
            const promptFinal = this._applyGender(promptBase, gender);
            console.log(`[Google-AI V10] Prompt (primeiros 120 chars): "${promptFinal.substring(0, 120)}..."`);

            // 3. Converte selfie para Base64
            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // 4. Hyper-Fidelity V19.0: Identidade + Face Mesh (Malha Facial)
            // Usamos a mesma foto como Gabarito Estrutural para fidelidade absoluta.
            const hyperFidelityInstruction = "Absolute identity mirror of the person in [1]. Preserve exact facial proportions, bone structure, and RAW skin texture with visible pores. Zero retouching.";

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
                                    subjectDescription: hyperFidelityInstruction
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
                            }
                        ]
                    }
                ],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "3:4"
                }
            };

            // 5. Obtém token de acesso
            const client = await this.auth.getClient();
            const tokenResponse = await client.getAccessToken();
            const token = tokenResponse.token;

            // 6. Chama a REST API do Vertex AI
            console.log('[Google-AI V10] Chamando Vertex AI REST...');
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseJson = await response.json();
            console.log('[Google-AI V10] Status:', response.status, '| Resposta:', JSON.stringify(responseJson).substring(0, 200));

            if (!response.ok) {
                throw new Error(`Google API Error ${response.status}: ${JSON.stringify(responseJson.error || responseJson)}`);
            }

            // 7. Extrai a imagem da resposta
            const prediction = responseJson?.predictions?.[0];
            const imageBase64 = prediction?.bytesBase64Encoded;

            if (!imageBase64) {
                throw new Error(`Google não retornou imagem. Resposta: ${JSON.stringify(responseJson).substring(0, 300)}`);
            }

            console.log('[Google-AI V10] SUCESSO! Imagem gerada com fidelidade de identidade.');
            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V10] FALHA:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleImageService();
