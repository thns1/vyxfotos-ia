const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * MOTOR DE IMAGEM - RESILIÊNCIA TOTAL
 */
async function generateRealisticImage(prompt, outputPath) {
    try {
        console.log('🎨 [Gemini Imagen] Gerando imagem...');
        const enhancedPrompt = `${prompt}. Photorealistic photograph, RAW photo 8k.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: enhancedPrompt,
        });

        // Tenta salvar, se falhar cai no catch e vai pro fallback
        let imageSaved = false;
        if (response.candidates && response.candidates[0].content.parts[0].inlineData) {
            const imageBuffer = Buffer.from(response.candidates[0].content.parts[0].inlineData.data, 'base64');
            fs.writeFileSync(outputPath, imageBuffer);
            imageSaved = true;
        }

        if (!imageSaved) throw new Error('Sem imagem no Gemini');
        return outputPath;

    } catch (error) {
        console.log(`⚠️ [Fallback Active] Gemini indisponível ou sem cota. Usando Flux...`);
        return await generateFallbackPollinations(prompt, outputPath);
    }
}

async function generateAfterImageFromBefore(beforeImagePath, afterStylePrompt, variationPrompt, outputPath) {
    try {
        console.log('🔄 [Gemini Edit] Tentando edição de imagem...');
        const imageData = fs.readFileSync(beforeImagePath);
        const base64Image = imageData.toString('base64');

        const editPrompt = `Transform this person into a ${afterStylePrompt}. ${variationPrompt}. Photorealistic, raw skin texture, same identity.`;

        const response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-image-preview',
            contents: [
                { text: editPrompt },
                { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
            ],
        });

        if (response.candidates && response.candidates[0].content.parts[0].inlineData) {
            const imageBuffer = Buffer.from(response.candidates[0].content.parts[0].inlineData.data, 'base64');
            fs.writeFileSync(outputPath, imageBuffer);
            return outputPath;
        }
        throw new Error('Sem imagem no Gemini Edit');

    } catch (error) {
        console.log(`⚠️ [Fallback Active] Usando Flux para variação...`);
        return await generateFallbackPollinations(`${afterStylePrompt}, ${variationPrompt}`, outputPath);
    }
}

async function generateFallbackPollinations(prompt, outputPath, retries = 2) {
    try {
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ", photorealistic, 8k")}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random()*10000)}`;
        const res = await axios({ url, responseType: 'arraybuffer', timeout: 60000 });
        fs.writeFileSync(outputPath, Buffer.from(res.data));
        console.log('✅ [Fallback] Imagem salva via Pollinations.');
        return outputPath;
    } catch (e) {
        if (retries > 0) {
            console.log(`🔄 [Retry] Falha no fallback, tentando novamente (${retries})...`);
            await new Promise(r => setTimeout(r, 5000));
            return await generateFallbackPollinations(prompt, outputPath, retries - 1);
        }
        throw e;
    }
}

module.exports = { generateRealisticImage, generateAfterImageFromBefore };
