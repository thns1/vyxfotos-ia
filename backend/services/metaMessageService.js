const axios = require('axios');

const PAGE_ID = '977055518833688';
let _pageToken = null;

async function getPageToken() {
    if (_pageToken) return _pageToken;
    const userToken = process.env.META_ACCESS_TOKEN;
    const res = await axios.get(`https://graph.facebook.com/v20.0/me/accounts`, {
        params: { access_token: userToken }
    });
    const page = res.data.data.find(p => p.id === PAGE_ID);
    if (!page) throw new Error('Página não encontrada. Verifique o META_ACCESS_TOKEN.');
    _pageToken = page.access_token;
    return _pageToken;
}

/**
 * SERVIÇO DE MENSAGENS META (Instagram)
 * Usa o Page Access Token para enviar mensagens via Messenger API
 */
class MetaMessageService {
    async sendTextMessage(recipientId, text) {
        // Sempre usa o Page Access Token — NUNCA o User Token
        const accessToken = await getPageToken();
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
