const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const fetch = require('node-fetch');

/**
 * SERVIÇO GOOGLE VERTEX AI - V28.0 (ELITE SEATED RESCUE)
 * Protocolo de Desancoragem: Uso seletivo de Face Mesh para garantir a face da V22.0
 * mas com liberdade total para gerar o corpo sentado e o cenário de luxo.
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = 'us-central1';
        this.modelId = 'imagen-3.0-capability-001';
        
        let authOptions = { scopes: 'https://www.googleapis.com/auth/cloud-platform' };
        if (process.env.GOOGLE_CREDS_JSON) {
            try { authOptions.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON); } catch (e) {}
        } else {
            const keyPath = path.join(__dirname, '../../vyxfotos-493415-3d24a459e5c7.json');
            if (fs.existsSync(keyPath)) authOptions.keyFilename = keyPath;
        }

        this.auth = new GoogleAuth(authOptions);
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelId}:predict`;
    }

    async generateWithFaceID(imageFile, theme, customText, gender) {
        try {
            console.log(`[Google-AI V28] Resgate Corpo Inteiro Sentado: ${theme}`);
            const themePrompts = require('../constants/themePrompts');
            let promptFinal = themePrompts[theme] || themePrompts['executivo'];

            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // Protocolo V28: Foco em Face e RELIGHTING total de cenário.
            const atomicWipeInstruction = "Strictly preserve the unique facial identity of [1]. DO NOT smooth skin. Keep authentic pores and textures. RELIGHT the subject. ENTIRELY IGNORE AND DELETE the original background (no gaming chair, no red curtains). Focus on a luxury seated posture.";

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
            if (!imageBase64) throw new Error("IA não retornou imagem.");

            console.log(`[Google-AI V28] SUCESSO! Foto de Resgate gerada.`);
            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V28] FALHA:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleImageService();
