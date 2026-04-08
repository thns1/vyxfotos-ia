const axios = require('axios');
const fs = require('fs');
const path = require('path');
const SalesAgentService = require('./salesAgent');
const MetaMessageService = require('./metaMessageService');

const PAGE_ID = '977055518833688';
const IG_PAGE_ACCOUNT_ID = '17841441355621258';
const POLL_INTERVAL_MS = 25000; // 25 segundos
const IDS_FILE = path.join(__dirname, '..', 'processed_ids.json');

// Carrega IDs processados do arquivo para persistência
let processedMessageIds = new Set();
if (fs.existsSync(IDS_FILE)) {
    try {
        const data = JSON.parse(fs.readFileSync(IDS_FILE, 'utf8'));
        processedMessageIds = new Set(data);
    } catch (e) {
        console.error('Erro ao ler processed_ids.json');
    }
}

let isPolling = false;
let pageAccessToken = null;

function saveIds() {
    fs.writeFileSync(IDS_FILE, JSON.stringify([...processedMessageIds]));
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
                // TRAVA 1: Pula se já processamos esse ID (persistente)
                if (processedMessageIds.has(msg.id)) continue;
                
                // TRAVA 2: Pula se for mensagem nossa
                if (msg.from?.id === IG_PAGE_ACCOUNT_ID) {
                    processedMessageIds.add(msg.id);
                    continue;
                }

                // TRAVA 3: Pula mensagens vazias
                if (!msg.message || msg.message.trim() === '') {
                    processedMessageIds.add(msg.id);
                    continue;
                }

                const senderId = msg.from?.id;
                const messageText = msg.message;

                console.log(`💬 [IG Poll] Processando: "${messageText}" de ${senderId}`);

                try {
                    const aiResponse = await SalesAgentService.generateResponse(messageText);
                    await MetaMessageService.sendTextMessage(senderId, aiResponse);
                    
                    // Sucesso! Marca como processado e salva
                    processedMessageIds.add(msg.id);
                    saveIds();
                    console.log(`✅ [IG Poll] Resposta enviada.`);
                } catch (err) {
                    console.error(`❌ [IG Poll] Erro ao responder: ${err.message}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ [IG Poll] Erro:', error.response?.data || error.message);
    } finally {
        isPolling = false;
    }
}

function startPolling() {
    console.log(`🔄 [IG Poll] Iniciando sistema anti-duplicação...`);
    // Na primeira execução, marca tudo que já existe como "visto" para não responder histórico
    preload().then(() => {
        setInterval(fetchNewMessages, POLL_INTERVAL_MS);
    });
}

async function preload() {
    try {
        const pt = await getPageToken();
        const convRes = await axios.get(`https://graph.facebook.com/v20.0/${PAGE_ID}/conversations`, {
            params: { platform: 'instagram', fields: 'messages{id}', access_token: pt }
        });
        const conversations = convRes.data.data || [];
        for (const conv of conversations) {
            const messages = conv.messages?.data || [];
            messages.forEach(msg => processedMessageIds.add(msg.id));
        }
        saveIds();
        console.log(`✅ [IG Poll] Histórico limpo (${processedMessageIds.size} msgs). Aguardando NOVAS.`);
    } catch (e) {}
}

module.exports = { startPolling };
