const fs = require('fs');
const path = require('path');
const { PredictionServiceClient } = require('@google-cloud/aiplatform');
const themePrompts = require('../constants/themePrompts');

/**
 * SERVIÇO DE GERAÇÃO DE IMAGENS - GOOGLE IMAGEN 3 ELITE
 * 
 * Este serviço utiliza a API Vertex AI do Google Cloud para gerar imagens.
 * O modelo 'imagen-3.0-capability-001' permite manter a fidelidade do rosto
 * através do Subject Customization (SUBJECT_TYPE_PERSON).
 */
class GoogleImageService {
    constructor() {
        this.projectId = process.env.GOOGLE_PROJECT_ID || 'vyxfotos-493415';
        this.location = process.env.GOOGLE_LOCATION || 'us-central1';
        this.modelId = 'imagen-3.0-capability-001';
        
        // Configura o endpoint de predição
        this.endpoint = `projects/${this.projectId}/locations/${this.location}/publishers/google/models/${this.modelId}`;

        // O cliente do Google Cloud usa GOOGLE_APPLICATION_CREDENTIALS automaticamente (se for caminho)
        // Se passarmos o JSON diretamente em uma variável, tratamos aqui:
        const credentialsConfig = {};
        if (process.env.GOOGLE_CREDS_JSON) {
            try {
                credentialsConfig.credentials = JSON.parse(process.env.GOOGLE_CREDS_JSON);
                console.log("[Google-AI] Usando credenciais via variável de ambiente.");
            } catch (err) {
                console.error("[Google-AI] Erro ao parsear GOOGLE_CREDS_JSON:", err.message);
            }
        }

        this.client = new PredictionServiceClient({
            apiEndpoint: `${this.location}-aiplatform.googleapis.com`,
            ...credentialsConfig
        });

        console.log(`[Google-AI] Motor Imagen 3 Elite configurado (Projeto: ${this.projectId})`);
    }

    async generateWithFaceID(imageFile, theme, customText) {
        try {
            console.log(`[Google-AI] Iniciando geração ELITE. Tema: ${theme}`);

            // 1. Prepara o prompt (usando a sintaxe de referência [1] do Google)
            let promptBase = themePrompts[theme] || themePrompts['executivo'];
            
            // Adaptamos o prompt para o formato do Google Subject Customization
            // Substituímos referências genéricas por "[1]"
            let promptElite = promptBase
                .replace(/the person|a person|a man|a student|a executive|a child/gi, 'the person [1]')
                .replace(/Subject/g, 'Person [1]');
            
            if (customText && customText.trim().length > 3) {
                promptElite = `A high-quality professional portrait of the person [1] in ${customText.trim()}, 85mm portrait photography, f/2.2, sharp focus, cinematic lighting, 8k resolution.`;
            }

            console.log(`[Google-AI] Prompt Elite: "${promptElite.substring(0, 100)}..."`);

            // 2. Converte selfie para Base64
            const imageData = fs.readFileSync(imageFile.path).toString('base64');

            // 3. Monta a requisição para o Vertex AI (Subject Customization V8.3)
            const instance = {
                prompt: promptElite,
                subjectReferences: [
                    {
                        referenceId: "1",
                        subjectType: "SUBJECT_TYPE_PERSON",
                        image: {
                            bytesBase64Encoded: imageData,
                            mimeType: imageFile.mimetype || 'image/jpeg'
                        }
                    }
                ]
            };

            const parameters = {
                sampleCount: 1,
                aspectRatio: "3:4"
            };

            const request = {
                endpoint: this.endpoint,
                instances: [instance],
                parameters: parameters,
            };

            // 4. Chama a API do Google
            console.log(`[Google-AI] Chamando Vertex AI Prediction...`);
            const [response] = await this.client.predict(request);

            // 5. Extrai a imagem resultante (Geralmente base64 ou link GCS)
            const prediction = response.predictions[0];
            
            // O Imagen 3 retorna bytes em base64 na predição
            if (prediction && prediction.bytesBase64Encoded) {
                // Como o frontend espera uma URL, vamos salvar localmente ou usar um Data URL
                // Por questões de performance e rede, retornaremos em formato Data URL
                return {
                    status: "success",
                    output_url: `data:image/png;base64,${prediction.bytesBase64Encoded}`,
                    orderId: `PEDIDO_G_${Date.now()}`
                };
            } else if (prediction && prediction.gcsUri) {
                 return {
                    status: "success",
                    output_url: prediction.gcsUri,
                    orderId: `PEDIDO_G_${Date.now()}`
                };
            }

            throw new Error("O Google não retornou dados de imagem válidos.");

        } catch (error) {
            console.error(`[Google-AI] FALHA CRÍTICA:`, error.message);
            throw error;
        }
    }
}

module.exports = new GoogleImageService();
