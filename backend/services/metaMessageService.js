const axios = require('axios');

/**
 * SERVIÇO DE MENSAGENS META (Instagram)
 * Responsável por enviar o Direct de volta ao usuário
 */
class MetaMessageService {
    constructor() {
        this.accessToken = process.env.META_ACCESS_TOKEN;
        this.graphUrl = `https://graph.facebook.com/v20.0/me/messages?access_token=${this.accessToken}`;
    }

    async sendTextMessage(recipientId, text) {
        console.log(`📡 [Meta App] Enviando resposta para: ${recipientId}`);
        
        const payload = {
            recipient: { id: recipientId },
            message: { text: text }
        };

        try {
            const response = await axios.post(this.graphUrl, payload);
            console.log(`✅ [Meta App] Mensagem enviada! ID: ${response.data.message_id}`);
            return response.data;
        } catch (error) {
            console.error('❌ [Meta App Error]:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new MetaMessageService();
