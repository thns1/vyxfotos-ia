const fs = require('fs');
const path = require('path');
const { GoogleAuth } = require('google-auth-library');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');

/**
 * SERVIÇO GOOGLE VERTEX AI - V37.0 (GEMINI FUSION PROTOCOL)
 * - Etapa 1: Análise Multimodal com Gemini 1.5 Pro (Vision).
 * - Etapa 2: Geração Orgânica com Imagen 3 (Subject Personalization).
 * - Objetivo: Qualidade idêntica ao Gemini Web UI.
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = 'us-central1';
        this.apiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/imagen-3.0-capability-001:predict`;

        // Autenticação
        let credentials;
        if (process.env.GOOGLE_CREDS_JSON) {
            try { credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON); } catch (e) {}
        }
        
        const authOptions = { scopes: 'https://www.googleapis.com/auth/cloud-platform' };
        if (credentials) {
            authOptions.credentials = credentials;
        } else {
            const keyPath = path.join(__dirname, '../../vyxfotos-493415-3d24a459e5c7.json');
            if (fs.existsSync(keyPath)) authOptions.keyFilename = keyPath;
        }
        
        this.auth = new GoogleAuth(authOptions);
        
        // Inicializa SDK do Gemini para Análise Visual
        // Usamos a API Key do Gemini se disponível, ou o token do Vertex
        this.genAI = new GoogleGenerativeAI(credentials?.private_key_id || process.env.GEMINI_API_KEY || "DUMMY");
    }

    /**
     * Usa o Gemini 1.5 Pro para analisar a selfie e criar um 'mapa de identidade' textual.
     */
    async _analyzeSubject(base64Image, mimeType) {
        try {
            console.log('[Google-AI V37] Iniciando Análise Visual Gemini 1.5 Pro...');
            
            // Em ambiente Vertex AI, usamos o token do GoogleAuth para o Gemini também
            const client = await this.auth.getClient();
            const tokenResponse = await client.getAccessToken();
            
            // Endpoint do Gemini 1.5 Pro no Vertex AI
            const geminiUrl = `https://${this.location}-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/${this.location}/publishers/google/models/gemini-1.5-pro:generateContent`;
            
            const prompt = "Describe this person's facial features in extreme technical detail for an AI image generator. Include: hair style and color, eye shape and color, nose structure, eyebrow density, beard/facial hair style, face shape, and unique skin marks. Output only the description in English.";

            const response = await fetch(geminiUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${tokenResponse.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: prompt },
                            { inlineData: { mimeType: mimeType, data: base64Image } }
                        ]
                    }],
                    generationConfig: { maxOutputTokens: 200 }
                })
            });

            const json = await response.json();
            const description = json?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!description) {
                console.warn('[Google-AI V37] Gemini Vision falhou, usando descrição padrão.');
                return "The exact individual from the reference photo, maintaining all biometric characteristics.";
            }

            console.log('[Google-AI V37] Descrição Gerada:', description.substring(0, 50) + "...");
            return description;

        } catch (error) {
            console.error('[Google-AI V37] Erro na análise Visual:', error.message);
            return "The exact individual from the reference photo.";
        }
    }

    async generateWithFaceID(imageFile, theme, customText, gender = 'masculino') {
        try {
            const themePrompts = require('../constants/themePrompts');
            let promptBase = themePrompts[theme] || themePrompts['executivo'];

            const imageData = fs.readFileSync(imageFile.path).toString('base64');
            const mimeType = imageFile.mimetype || 'image/jpeg';

            // ETAPA 1: Visão Gemini - Extraindo a identidade orgânica
            const subjectAnalysis = await this._analyzeSubject(imageData, mimeType);

            // ETAPA 2: Configuração do Prompt e Instruções
            const promptFinal = promptBase
                .replace(/portrait photograph/gi, "medium-wide shot photograph, waist up, capturing head and torso")
                .replace(/85mm portrait lens/gi, "50mm wide lens");

            // ETAPA 3: Geração Imagen 3 (SEM FACE MESH - MODO GEMINI WEB)
            const atomicWipeInstruction = `STRICTLY PRESERVE THE IDENTITY OF [1]. 
            SUBJECT CHARACTERISTICS: ${subjectAnalysis}. 
            DISCARD THE ORIGINAL BACKGROUND, CLOTHING, AND GAMING CHAIR. 
            GENERATE ORGANIC RAW SKIN TEXTURE. NO FILTERS.`;

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
            return {
                status: "success",
                output_url: `data:image/png;base64,${imageBase64}`,
                orderId: `PEDIDO_G_${Date.now()}`
            };

        } catch (error) {
            console.error('[Google-AI V37] FALHA:', error.message);
            throw error;
        }
    }
}
module.exports = new GoogleImageService();
