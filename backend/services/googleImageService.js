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

            // 4. Natural Skin V22.0: Foco em Realismo Humano (Anti-AI Filter)
            // Ordem: Manter identidade biométrica e APLICAR LUZ, mas PROIBIR filtros de beleza.
            const atomicWipeInstruction = "Strictly preserve the authentic facial identity of [1]. DO NOT smooth the skin. DO NOT use beauty filters or airbrushing. Keep natural skin textures, visible pores, and unique characteristics of [1]. RELIGHT the subject with professional studio lighting but maintain the raw, unretouched character of the person.";

            // 5. Função auxiliar para chamar a API do Vertex AI
            const callVertexAI = async (prompt) => {
                const requestBody = {
                    instances: [
                        {
                            prompt: prompt,
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
                return responseJson?.predictions?.[0]?.bytesBase64Encoded;
            };

            // 6. Executa as gerações consecutivamente (API não aceita multi-instance com Subject Reference)
            console.log('[Google-AI V10] Gerando Retrato (Passo 1/2)...');
            const portraitBase64 = await callVertexAI(promptFinal);
            
            console.log('[Google-AI V10] Gerando Corpo Inteiro (Passo 2/2)...');
            const fullBodyPrompt = `${promptFinal}. Full body shot head to toe, standing posture, wide angle studio shot.`;
            const fullBodyBase64 = await callVertexAI(fullBodyPrompt);

            // 7. Consolida os resultados
            const generatedImages = [];
            if (portraitBase64) generatedImages.push(`data:image/png;base64,${portraitBase64}`);
            if (fullBodyBase64) generatedImages.push(`data:image/png;base64,${fullBodyBase64}`);

            if (generatedImages.length === 0) {
                throw new Error(`Google não retornou nenhuma imagem.`);
            }

            console.log(`[Google-AI V10] SUCESSO! ${generatedImages.length} imagens geradas consecutivamente.`);
            return {
                status: "success",
                output_urls: generatedImages,
                output_url: generatedImages[0],
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V10] FALHA:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleImageService();
