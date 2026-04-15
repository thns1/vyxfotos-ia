const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

/**
 * SERVIÇO GOOGLE VERTEX AI - V38.0 (THE LAST STAND - IDENTITY RESTORED)
 * - Identidade: Volta obrigatória do Face Mesh (Fidelidade 1:1).
 * - Enquadramento: Mudança para Ratio 1:1 (Quadrado) para forçar o zoom-out.
 * - Prompt: Injeção de 'Wide Shot' bruto no início.
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
            console.log(`[Google-AI V38] A ÚLTIMA TRINCHEIRA (RESCUE IDENTITY): ${theme}`);
            const themePrompts = require('../constants/themePrompts');
            let promptBase = themePrompts[theme] || themePrompts['executivo'];

            // V38: Forçamos o zoom out agressivo no prompt e mudamos para 1:1
            const promptFinal = "ULTRA WIDE SHOT FROM 5 METERS AWAY, showing person from waist up. " + promptBase
                .replace(/portrait photograph/gi, "full shot photograph")
                .replace(/85mm portrait lens/gi, "35mm wide angle lens");

            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // PROTOCOLO V38: Volta da Identidade Real + Limpeza de Fundo
            const atomicWipeInstruction = "STRICTLY PRESERVE THE IDENTITY OF [1]. ABSOLUTELY ERASE THE ORIGINAL BACKGROUND, GAMING CHAIR AND RED CURTAINS. REPLACE WITH THE NEW LUXURY OFFICE SCENE. FOCUS ON THE SUIT AND THE POSE.";

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
                parameters: { sampleCount: 1, aspectRatio: "1:1" } // Mudança para Quadrado para forçar a IA a se afastar
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
            console.error('[Google-AI V38] FALHA:', error.message);
            throw error;
        }
    }
}
module.exports = new GoogleImageService();
