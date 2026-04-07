require('dotenv').config();
const { createConversionPost } = require('./imageProcessor');
const { generateSmartContent } = require('./contentGenerator');
const { publishToInstagram } = require('./instagramService');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

async function runV7Final() {
    console.log('🚀 [V7] Executando postagem de unidade absoluta...');
    
    try {
        const content = await generateSmartContent();
        
        // V10 - MESMA PESSOA, FOTOS DIFERENTES (Em pé na esquerda, sentado na direita)
        const assetOriginal = path.join(__dirname, '..', 'frontend', 'public', 'executivo_1.png');
        const assetSitting = path.join(__dirname, '..', 'frontend', 'public', 'executivo_3.png');
        
        const output = path.join(__dirname, `post-final-${Date.now()}.jpg`);

        // O motor gráfico vai fazer o Flop na direita e o Zoom no centro automaticamente
        await createConversionPost(assetOriginal, assetOriginal, assetSitting, content.top_text, content.bottom_text, output);
        // 4. Upload para o Discord (?wait=true) para pegar o link público estável
        const form = new FormData();
        form.append('file', fs.createReadStream(output));
        const discordRes = await axios.post(`${process.env.DISCORD_WEBHOOK_URL}?wait=true`, form, { headers: form.getHeaders() });
        
        // Link estável do Discord (CDN)
        const publicUrl = discordRes.data.attachments[0].url;
        console.log('🔗 [V10] Link Ponte Discord:', publicUrl);

        console.log('⏳ [V10] Aguardando 5s para o cache do Instagram...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 5. Postagem Oficial no Feed
        await publishToInstagram(publicUrl, content.caption);
        console.log('✅ Post V10 DEFINITIVO Concluído!');
        
    } catch (error) {
        console.error('❌ Erro V7:', error.message);
    }
}

runV7Final();
