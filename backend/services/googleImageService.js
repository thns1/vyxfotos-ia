const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

/**
 * SERVIÇO GOOGLE VERTEX AI - V36.0 (HYBRID ELITE - THE RESURRECTION)
 * - Reativado o Face Mesh para restaurar a identidade biometria 1:1.
 * - Ajuste de enquadramento para 'Mid-shot' (Cintura para cima), igual ao sucesso do Gemini Web.
 * - Foco em eliminar o efeito genérico da V35.
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = 'us-central1';
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/imagen-3.0-capability-001:predict`;

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
            console.log(`[Google-AI V36] RESGATANDO IDENTIDADE REAL: ${theme}`);
            const themePrompts = require('../constants/themePrompts');
            let promptBase = themePrompts[theme] || themePrompts['executivo'];

            // Ajuste crucial: Trocamos 'full body' (que quebra a escala) por 'medium-wide shot' (igual ao print do app).
            const promptFinal = promptBase.replace(/full body head to toe/gi, "medium-wide shot, waist up, capturing head and torso in a professional executive posture");

            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // PROTOCOLO V36: Blindagem de Face + Liberdade de Cenário
            const atomicWipeInstruction = "ONLY USE [1] FOR CRITICAL FACIAL BIOMETRICS. COMPLETELY DISCARD THE ORIGINAL BACKGROUND, CLOTHES AND THE GAMING CHAIR. GENERATE A NEW PROFESSIONAL UPPER BODY POSTURE SEATED IN A LUXURY OFFICE. NO GENERIC FACES.";

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

            const client = await this.auth.getClient();
            const tokenResponse = await client.getAccessToken();
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${tokenResponse.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const responseJson = await response.json();
            if (!response.ok) throw new Error(`Google Error: ${JSON.stringify(responseJson)}`);

            const imageBase64 = responseJson?.predictions?.[0]?.bytesBase64Encoded;
            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V36] FALHA:', error.message);
            throw error;
        }
    }
}
module.exports = new GoogleImageService();
