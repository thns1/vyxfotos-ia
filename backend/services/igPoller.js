const axios = require('axios');
const SalesAgentService = require('./salesAgent');
const MetaMessageService = require('./metaMessageService');

const PAGE_ID = '977055518833688';
const IG_PAGE_ACCOUNT_ID = '17841441355621258'; // ID da conta vyxfotos.ia
const POLL_INTERVAL_MS = 30000; // 30 segundos

// Guarda os IDs de mensagens já processadas para não responder duas vezes
const processedMessageIds = new Set();
let isPolling = false;
let pageAccessToken = null;

async function getPageToken() {
    if (pageAccessToken) return pageAccessToken;
    const userToken = process.env.META_ACCESS_TOKEN;
    const res = await axios.get(`https://graph.facebook.com/v20.0/me/accounts`, {
        params: { access_token: userToken }
    });
    const page = res.data.data.find(p => p.id === PAGE_ID);
    if (!page) throw new Error('Página não encontrada no token.');
    pageAccessToken = page.access_token;
    return pageAccessToken;
}

async function fetchNewMessages() {
    if (isPolling) return;
    isPolling = true;

    try {
        const pt = await getPageToken();

        // Busca conversas recentes do Instagram via Page
        const convRes = await axios.get(`https://graph.facebook.com/v20.0/${PAGE_ID}/conversations`, {
            params: {
                platform: 'instagram',
                fields: 'messages{message,from,id,created_time}',
                access_token: pt
            }
        });

        const conversations = convRes.data.data || [];

        for (const conv of conversations) {
            const messages = conv.messages?.data || [];

            for (const msg of messages) {
                // Pula se já processamos essa mensagem
                if (processedMessageIds.has(msg.id)) continue;
                processedMessageIds.add(msg.id);

                // Pula mensagens enviadas pela própria conta vyxfotos.ia (ecos)
                if (msg.from?.id === IG_PAGE_ACCOUNT_ID) continue;

                // Pula mensagens sem texto
                if (!msg.message || msg.message.trim() === '') continue;

                const senderId = msg.from?.id;
                const messageText = msg.message;

                console.log(`💬 [IG Poll] Nova mensagem de @${msg.from?.username} (${senderId}): "${messageText}"`);

                try {
                    const aiResponse = await SalesAgentService.generateResponse(messageText);
                    await MetaMessageService.sendTextMessage(senderId, aiResponse);
                    console.log(`✅ [IG Poll] Resposta enviada para @${msg.from?.username}.`);
                } catch (err) {
                    console.error(`❌ [IG Poll] Erro ao responder: ${err.message}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ [IG Poll] Erro ao buscar mensagens:', error.response?.data || error.message);
    } finally {
        isPolling = false;
    }
}

function startPolling() {
    console.log(`🔄 [IG Poll] Iniciando polling a cada ${POLL_INTERVAL_MS / 1000}s...`);
    // Marca todas as mensagens atuais como já processadas (não responde histórico)
    preloadProcessedMessages().then(() => {
        setInterval(fetchNewMessages, POLL_INTERVAL_MS);
        console.log('✅ [IG Poll] Histórico carregado. Aguardando mensagens NOVAS...');
    });
}

async function preloadProcessedMessages() {
    try {
        const pt = await getPageToken();
        const convRes = await axios.get(`https://graph.facebook.com/v20.0/${PAGE_ID}/conversations`, {
            params: {
                platform: 'instagram',
                fields: 'messages{id}',
                access_token: pt
            }
        });
        const conversations = convRes.data.data || [];
        for (const conv of conversations) {
            const messages = conv.messages?.data || [];
            messages.forEach(msg => processedMessageIds.add(msg.id));
        }
        console.log(`✅ [IG Poll] ${processedMessageIds.size} mensagens antigas marcadas como processadas.`);
    } catch (e) {
        console.error('❌ [IG Poll] Erro ao pré-carregar histórico:', e.message);
    }
}

module.exports = { startPolling };
