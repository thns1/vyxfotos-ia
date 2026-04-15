const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const themePrompts = require('../constants/themePrompts');

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - GOOGLE IMAGEN 3 ELITE (V22.0 RESTAURADO)
 *
 * ESTA É A VERSÃO EXATA QUE GEROU O RETRATO APROVADO PELO USUÁRIO.
 * Única mudança: O enquadramento nos themePrompts foi trocado de
 * portrait/headshot → full body seated in a luxury armchair.
 *
 * NÃO ALTERAR ESTE ARQUIVO SEM APROVAÇÃO DO USUÁRIO.
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = 'us-central1';
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/imagen-3.0-capability-001:predict`;

        // Autenticação Híbrida (Local JSON + Render ENV)
        const authConfig = { scopes: ['https://www.googleapis.com/auth/cloud-platform'] };
        if (process.env.GOOGLE_CREDS_JSON) {
            authConfig.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON);
        } else {
            const keyPath = path.join(__dirname, '../../vyxfotos-493415-3d24a459e5c7.json');
            if (fs.existsSync(keyPath)) authConfig.keyFilename = keyPath;
        }
        this.auth = new GoogleAuth(authConfig);
    }

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
        return prompt;
    }

    async generateWithFaceID(imageFile, theme, customText, gender = 'masculino') {
        try {
            console.log(`[Google-AI V22-RESTORED] Tema: "${theme}" | Gênero: "${gender}"`);

            // 1. Seleciona o prompt do tema
            let promptBase;
            if (customText && customText.trim().length > 3) {
                promptBase = `${themePrompts['executivo']} The scene setting is: ${customText.trim()}.`;
            } else {
                promptBase = themePrompts[theme] || themePrompts['executivo'];
            }

            const promptFinal = this._applyGender(promptBase, gender);

            // 2. Converte selfie para Base64
            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // 3. PROTOCOLO V22.0 INTACTO: Anti-Filtro + Fidelidade Biométrica
            // Esta é a string EXATA que gerou o resultado aprovado pelo usuário.
            const atomicWipeInstruction = "Strictly preserve the authentic facial identity of [1]. DO NOT smooth the skin. DO NOT use beauty filters or airbrushing. Keep natural skin textures, visible pores, and unique characteristics of [1]. RELIGHT the subject with professional studio lighting but maintain the raw, unretouched character of the person.";

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

            // 4. Autenticação e chamada
            const client = await this.auth.getClient();
            const tokenResponse = await client.getAccessToken();
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${tokenResponse.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            const responseJson = await response.json();
            if (!response.ok) {
                throw new Error(`Google API Error ${response.status}: ${JSON.stringify(responseJson.error || responseJson)}`);
            }

            const imageBase64 = responseJson?.predictions?.[0]?.bytesBase64Encoded;
            if (!imageBase64) throw new Error(`Sem imagem na resposta: ${JSON.stringify(responseJson).substring(0, 200)}`);

            console.log('[Google-AI V22-RESTORED] SUCESSO!');
            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V22-RESTORED] FALHA:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleImageService();
