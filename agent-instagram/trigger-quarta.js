require('dotenv').config();
const { generateSmartContent } = require('./contentGenerator');
const { generateRealisticImage, generateAfterImageFromBefore } = require('./geminiImageService');
const { createConversionPost } = require('./imageProcessor');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function triggerWednesdayPost() {
    console.log('🚀 [MANUAL] Iniciando Geração do Mosaico de Fidelidade (QUARTA)...');

    try {
        // 1. Gera o conteúdo estratégico
        const content = await generateSmartContent();
        console.log(`📝 Tema: ${content.theme}`);

        // 2. Gera as imagens
        const pathBefore = path.join(__dirname, 'temp_before_manual.jpg');
        const pathAfter1 = path.join(__dirname, 'temp_after_1_manual.jpg');
        const pathAfter2 = path.join(__dirname, 'temp_after_2_manual.jpg');
        const finalPost  = path.join(__dirname, 'MOSAICO_FINAL_QUARTA.jpg');

        await generateRealisticImage(content.prompt_before, pathBefore);
        await new Promise(r => setTimeout(r, 2000));
        
        await generateAfterImageFromBefore(pathBefore, content.prompt_after, "Variação A: Retrato Executivo", pathAfter1);
        await new Promise(r => setTimeout(r, 2000));
        
        await generateAfterImageFromBefore(pathBefore, content.prompt_after, "Variação B: Close-up de Luxo", pathAfter2);

        // 3. Cria o Mosaico Triplo
        await createConversionPost(pathAfter1, pathAfter2, pathBefore, content.top_text, content.bottom_text, finalPost);

        // 4. ENVIO PARA DISCORD (Passo a Passo)
        console.log('📤 Enviando para o Discord...');
        
        // A. Enviando a Imagem
        const form = new FormData();
        form.append('file', fs.createReadStream(finalPost));
        form.append('content', '🖼️ **Aqui está o seu Post de Quarta-feira (Mosaico):**');
        
        await axios.post(process.env.DISCORD_WEBHOOK_URL, form, { 
            headers: form.getHeaders() 
        });

        // B. Enviando a Legenda Separada (para fácil cópia)
        await axios.post(process.env.DISCORD_WEBHOOK_URL, {
            content: `📜 **LEGENDA PARA COPIAR:**\n\n${content.caption}\n\n#vyxfotos #ia #fotografia #lifestyle`
        });

        console.log('✅ Tudo enviado com sucesso para o Discord!');

    } catch (e) {
        console.error('❌ Erro na geração manual:', e.message);
    }
}

triggerWednesdayPost();
