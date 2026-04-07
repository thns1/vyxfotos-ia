const axios = require('axios');

/**
 * SERVIÇO INSTAGRAM - VYXFOTOS IA
 * Gerencia o upload e publicação via Graph API
 */
async function publishToInstagram(imageUrl, caption) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
    const accountId = process.env.INSTAGRAM_ACCOUNT_ID;
    
    try {
        console.log('📡 [Instagram] Iniciando upload da imagem para a Meta...');
        
        // PASSO 1: Criar o Container de Mídia
        const containerResponse = await axios.post(
            `https://graph.facebook.com/v20.0/${accountId}/media`,
            {
                image_url: imageUrl,
                caption: caption,
                access_token: accessToken
            }
        );
        
        const creationId = containerResponse.data.id;
        console.log(`✅ [Instagram] Container criado (ID: ${creationId}). Aguardando processamento...`);

        // Aguarda 5 segundos para o FB processar a imagem
        await new Promise(resolve => setTimeout(resolve, 5000));

        // PASSO 2: Publicar o Container
        console.log('🚀 [Instagram] Publicando post no Feed...');
        const publishResponse = await axios.post(
            `https://graph.facebook.com/v20.0/${accountId}/media_publish`,
            {
                creation_id: creationId,
                access_token: accessToken
            }
        );

        console.log(`✨ [Instagram] POST REALIZADO COM SUCESSO! (Post ID: ${publishResponse.data.id})`);
        return publishResponse.data.id;
        
    } catch (error) {
        console.error('❌ [Instagram] Falha na postagem:', error.response?.data || error.message);
        throw new Error(error.response?.data?.error?.message || error.message);
    }
}

module.exports = { publishToInstagram };
