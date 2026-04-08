const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

/**
 * SERVIÇO INSTAGRAM - VYXFOTOS IA
 */

// Auxiliar para upload via Discord (CDN Transiente)
async function uploadToCDN(localPath) {
    const discordWebhook = process.env.DISCORD_WEBHOOK_URL;
    const form = new FormData();
    form.append('file', fs.createReadStream(localPath));
    const res = await axios.post(`${discordWebhook}?wait=true`, form, { headers: form.getHeaders() });
    return res.data.attachments[0].url;
}

async function postToInstagram(localFilePath, caption) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
    
    try {
        const publicImageUrl = await uploadToCDN(localFilePath);
        const container = await axios.post(`https://graph.facebook.com/v20.0/${accountId}/media`, {
            image_url: publicImageUrl,
            caption: caption,
            access_token: accessToken
        });
        
        await new Promise(r => setTimeout(r, 10000));
        const publish = await axios.post(`https://graph.facebook.com/v20.0/${accountId}/media_publish`, {
            creation_id: container.data.id,
            access_token: accessToken
        });
        return publish.data;
    } catch (e) {
        console.error('❌ [IG Single] Erro:', e.response?.data || e.message);
        throw e;
    }
}

/**
 * POST CARROSSEL (Lógica Múltipla)
 */
async function postCarouselToInstagram(localFilePaths, caption) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const accountId = process.env.INSTAGRAM_ACCOUNT_ID;

    try {
        console.log(`📡 [IG Carousel] Iniciando upload de ${localFilePaths.length} slides...`);
        
        // 1. Upload de cada item (Slides)
        const itemIds = [];
        for (const filePath of localFilePaths) {
            const url = await uploadToCDN(filePath);
            const itemContainer = await axios.post(`https://graph.facebook.com/v20.0/${accountId}/media`, {
                image_url: url,
                is_carousel_item: true,
                access_token: accessToken
            });
            itemIds.push(itemContainer.data.id);
            console.log(`✅ Slide pronto: ${itemContainer.data.id}`);
        }

        // 2. Criar Container Mestre do Carrossel
        console.log('📡 [IG Carousel] Criando container mestre...');
        const carouselContainer = await axios.post(`https://graph.facebook.com/v20.0/${accountId}/media`, {
            media_type: 'CAROUSEL',
            caption: caption,
            children: itemIds.join(','),
            access_token: accessToken
        });

        const carouselId = carouselContainer.data.id;
        console.log(`✅ Container Mestre ID: ${carouselId}`);

        // Espera segura para o Meta processar tudo
        await new Promise(r => setTimeout(r, 20000));

        // 3. Publicar
        console.log('🚀 [IG Carousel] Publicando carrossel oficial...');
        const publish = await axios.post(`https://graph.facebook.com/v20.0/${accountId}/media_publish`, {
            creation_id: carouselId,
            access_token: accessToken
        });

        console.log(`✨ [IG Carousel] SUCESSO! ID: ${publish.data.id}`);
        return publish.data;

    } catch (e) {
        console.error('❌ [IG Carousel] Erro:', e.response?.data || e.message);
        throw e;
    }
}

module.exports = { postToInstagram, postCarouselToInstagram };
