const axios = require('axios');
const fs = require('fs');
const path = require('path');
const SalesAgentService = require('./salesAgent');
const MetaMessageService = require('./metaMessageService');

const PAGE_ID = '977055518833688';
const IG_PAGE_ACCOUNT_ID = '17841441355621258';
const POLL_INTERVAL_MS = 60000; // Aumentado para 60s para total estabilidade
const IDS_FILE = path.join(__dirname, '..', 'processed_ids.json');

let processedMessageIds = new Set();
// Bloqueio por usuário (SenderID -> Timestamp) para evitar spam duplo por erro de polling
const userCooldowns = new Map();
const COOLDOWN_TIME_MS = 120000; // 2 minutos de "descanso" por usuário

let pageAccessToken = null;
let isPolling = false;

function loadIds() {
    if (fs.existsSync(IDS_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(IDS_FILE, 'utf8'));
            processedMessageIds = new Set(data);
        } catch (e) {}
    }
}

function saveIds() {
    try {
        fs.writeFileSync(IDS_FILE, JSON.stringify([...processedMessageIds]));
    } catch (e) {}
}

async function getPageToken() {
    if (pageAccessToken) return pageAccessToken;
    const userToken = process.env.META_ACCESS_TOKEN;
    const res = await axios.get(`https://graph.facebook.com/v20.0/me/accounts`, {
        params: { access_token: userToken }
    });
    const page = res.data.data.find(p => p.id === PAGE_ID);
    if (!page) throw new Error('Página não encontrada.');
    pageAccessToken = page.access_token;
    return pageAccessToken;
}

async function fetchNewMessages() {
    if (isPolling) return;
    isPolling = true;

    try {
        const pt = await getPageToken();
        const convRes = await axios.get(`https://graph.facebook.com/v20.0/${PAGE_ID}/conversations`, {
            params: { platform: 'instagram', fields: 'messages{message,from,id}', access_token: pt }
        });

        const conversations = convRes.data.data || [];

        for (const conv of conversations) {
            const messages = conv.messages?.data || [];
            if (messages.length === 0) continue;

            // Analisamos apenas a mensagem MAIS RECENTE da conversa
            const lastMsg = messages[0];

            // 1. Já processamos esse ID exato?
            if (processedMessageIds.has(lastMsg.id)) continue;

            // 2. É nossa própria mensagem?
            if (lastMsg.from?.id === IG_PAGE_ACCOUNT_ID) {
                processedMessageIds.add(lastMsg.id);
                continue;
            }

            const senderId = lastMsg.from?.id;
            const now = Date.now();

            // 3. TRAVA DE SEGURANÇA: Já respondemos esse usuário nos últimos 2 minutos?
            // Isso evita mensagens duplicadas mesmo se a Meta retornar o ID errado ou demorar a atualizar
            if (userCooldowns.has(senderId)) {
                const lastReply = userCooldowns.get(senderId);
                if (now - lastReply < COOLDOWN_TIME_MS) {
                    console.log(`⚠️ [IG Poll] Bloqueando duplicata para ${senderId} (Cooldown ativo)`);
                    processedMessageIds.add(lastMsg.id); // Marca como visto para não tentar de novo
                    continue;
                }
            }

            console.log(`💬 [IG Poll] Nova mensagem de ${senderId}: "${lastMsg.message}"`);

            try {
                const aiResponse = await SalesAgentService.generateResponse(lastMsg.message);
                await MetaMessageService.sendTextMessage(senderId, aiResponse);
                
                // MARCAÇÃO TRIPLA DE SEGURANÇA:
                processedMessageIds.add(lastMsg.id); // ID da mensagem
                userCooldowns.set(senderId, now);    // Timestamp do usuário
                saveIds();                           // Persistência local
                
                console.log(`✅ [IG Poll] Resposta enviada com sucesso para ${senderId}`);
            } catch (err) {
                console.error(`❌ [IG Poll] Erro no envio: ${err.message}`);
            }
        }
    } catch (error) {
        console.error('❌ [IG Poll] Erro na busca:', error.message);
    } finally {
        isPolling = false;
        setTimeout(fetchNewMessages, POLL_INTERVAL_MS);
    }
}

async function startPolling() {
    console.log(`🔄 [IG Poll] Iniciando sistema ULTRA-ESTÁVEL (60s loop)...`);
    loadIds();
    
    try {
        const pt = await getPageToken();
        const convRes = await axios.get(`https://graph.facebook.com/v20.0/${PAGE_ID}/conversations`, {
            params: { platform: 'instagram', fields: 'messages{id,from}', access_token: pt }
        });
        const conversations = convRes.data.data || [];
        for (const conv of conversations) {
            const messages = conv.messages?.data || [];
            messages.forEach(m => processedMessageIds.add(m.id));
            // Adiciona cooldown inicial para todos que já falaram conosco para evitar bugar no start
            if (messages.length > 0 && messages[0].from?.id !== IG_PAGE_ACCOUNT_ID) {
                userCooldowns.set(messages[0].from?.id, Date.now());
            }
        }
        console.log(`✅ [IG Poll] Prerrolagem concluída. Sistema pronto.`);
        fetchNewMessages();
    } catch (e) {
        console.error('❌ [IG Poll] Erro no start:', e.message);
    }
}

module.exports = { startPolling };
