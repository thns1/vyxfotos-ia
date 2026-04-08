const axios = require('axios');

const PAGE_ID = '977055518833688';

/**
 * SERVIÇO DE MENSAGENS META (Instagram)
 * Responsável por enviar o Direct de volta ao usuário
 */
class MetaMessageService {
    async sendTextMessage(recipientId, text) {
        const accessToken = process.env.META_ACCESS_TOKEN;
        // Usa o Page ID diretamente — /me/messages não funciona com tokens de página do Instagram
        const graphUrl = `https://graph.facebook.com/v20.0/${PAGE_ID}/messages`;

        console.log(`📤 [Meta App] Enviando resposta para: ${recipientId}`);
        
        const payload = {
            recipient: { id: recipientId },
            message: { text: text },
            messaging_type: 'RESPONSE'
        };

        try {
            const response = await axios.post(graphUrl, payload, {
                params: { access_token: accessToken }
            });
            console.log(`✅ [Meta App] Mensagem enviada! ID: ${response.data.message_id}`);
            return response.data;
        } catch (error) {
            console.error('❌ [Meta App Error]:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new MetaMessageService();
