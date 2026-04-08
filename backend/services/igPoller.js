const axios = require('axios');
const fs = require('fs');
const path = require('path');
const SalesAgentService = require('./salesAgent');
const MetaMessageService = require('./metaMessageService');

const PAGE_ID = '977055518833688';
const IG_PAGE_ACCOUNT_ID = '17841441355621258';
const POLL_INTERVAL_MS = 30000; 
const IDS_FILE = path.join(__dirname, '..', 'processed_ids.json');

let processedMessageIds = new Set();
let pageAccessToken = null;
let isPolling = false;

// Carrega memória de IDs para evitar duplicatas entre reinicializações
function loadIds() {
    if (fs.existsSync(IDS_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(IDS_FILE, 'utf8'));
            processedMessageIds = new Set(data);
        } catch (e) {
            console.error('⚠️ [IG Poll] Erro ao carregar processed_ids.json');
        }
    }
}

function saveIds() {
    try {
        fs.writeFileSync(IDS_FILE, JSON.stringify([...processedMessageIds]));
    } catch (e) {
        console.error('⚠️ [IG Poll] Erro ao salvar processed_ids.json');
    }
}

async function getPageToken() {
    if (pageAccessToken) return pageAccessToken;
    const userToken = process.env.META_ACCESS_TOKEN;
    if (!userToken) throw new Error('META_ACCESS_TOKEN não configurado.');
    
    const res = await axios.get(`https://graph.facebook.com/v20.0/me/accounts`, {
        params: { access_token: userToken }
    });
    const page = res.data.data.find(p => p.id === PAGE_ID);
    if (!page) throw new Error('Página Vyxfotos não encontrada no token.');
    pageAccessToken = page.access_token;
    return pageAccessToken;
}

/**
 * BUSCA E PROCESSA NOVAS MENSAGENS
 */
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
            // Pegamos apenas a mensagem mais recente de cada conversa para evitar loop
            const messages = conv.messages?.data || [];
            
            for (const msg of messages) {
                // 🛑 FILTRO 1: Já processado?
                if (processedMessageIds.has(msg.id)) continue;

                // 🛑 FILTRO 2: É nossa própria mensagem?
                if (msg.from?.id === IG_PAGE_ACCOUNT_ID) {
                    processedMessageIds.add(msg.id);
                    continue;
                }

                // 🛑 FILTRO 3: Mensagem vazia ou imagem (por enquanto apenas texto)
                if (!msg.message || msg.message.trim() === '') {
                    processedMessageIds.add(msg.id);
                    continue;
                }

                const senderId = msg.from?.id;
                const messageText = msg.message;

                console.log(`💬 [IG Poll] Nova mensagem Detectada: "${messageText}"`);

                try {
                    // 1. Gera resposta com a IA
                    const aiResponse = await SalesAgentService.generateResponse(messageText);
                    
                    // 2. Envia para o Instagram
                    await MetaMessageService.sendTextMessage(senderId, aiResponse);
                    
                    // 3. Marca como processado IMEDIATAMENTE após o envio bem sucedido
                    processedMessageIds.add(msg.id);
                    saveIds();
                    
                    console.log(`✅ [IG Poll] Resposta enviada e ID travado: ${msg.id}`);
                } catch (err) {
                    console.error(`❌ [IG Poll] Erro no processamento: ${err.message}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ [IG Poll] Erro na busca:', error.response?.data || error.message);
    } finally {
        isPolling = false;
        // Agenda a próxima busca
        setTimeout(fetchNewMessages, POLL_INTERVAL_MS);
    }
}

/**
 * INICIALIZAÇÃO
 */
async function startPolling() {
    console.log(`🔄 [IG Poll] Iniciando sistema de busca (Polling)...`);
    loadIds();
    
    // Limpeza inicial: marca mensagens atuais como "vistas" para não responder histórico antigo
    try {
        const pt = await getPageToken();
        const convRes = await axios.get(`https://graph.facebook.com/v20.0/${PAGE_ID}/conversations`, {
            params: { platform: 'instagram', fields: 'messages{id}', access_token: pt }
        });
        const conversations = convRes.data.data || [];
        for (const conv of conversations) {
            const messages = conv.messages?.data || [];
            messages.forEach(m => processedMessageIds.add(m.id));
        }
        saveIds();
        console.log(`✅ [IG Poll] Histórico bloqueado (${processedMessageIds.size} msgs). Rodando...`);
        
        // Inicia o ciclo de busca
        fetchNewMessages();
    } catch (e) {
        console.error('❌ [IG Poll] Falha na inicialização:', e.message);
    }
}

module.exports = { startPolling };
