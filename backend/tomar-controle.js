const axios = require('axios');
require('dotenv').config();

const PAGE_ID = '977055518833688';
const APP_ID = '1308218631517865';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

async function forcarControle() {
    console.log('🦾 [Nuke] Tentando forçar Vyxfotos como dono absoluto das mensagens...');

    try {
        // 1. Obter o Page Token
        const accounts = await axios.get('https://graph.facebook.com/v25.0/me/accounts', {
            params: { access_token: ACCESS_TOKEN }
        });
        const page = accounts.data.data.find(p => p.id === PAGE_ID);
        if (!page) throw new Error('Página não encontrada.');
        const PAGE_TOKEN = page.access_token;

        // 2. Definir como Receptor Principal no Handover Protocol
        // Para Instagram, usamos o endpoint de messenger_profile mas com um truque
        console.log('📡 Definindo Vyxfotos como Primary Receiver...');
        await axios.post(`https://graph.facebook.com/v25.0/${PAGE_ID}/messenger_profile`, {
            get_started: { payload: 'GET_STARTED_PAYLOAD' }
        }, { params: { access_token: PAGE_TOKEN } });

        // Tentar definir o receptor
        const handover = await axios.post(`https://graph.facebook.com/v25.0/${PAGE_ID}/messenger_profile`, {
            page_receiver_id: APP_ID
        }, { params: { access_token: PAGE_TOKEN } });

        console.log('✅ Resposta da Meta:', handover.data);
        console.log('🚀 Agora a Meta deve encaminhar as mensagens para o seu server.js!');
        
    } catch (error) {
        console.error('❌ Erro na tomada de poder:', error.response?.data || error.message);
        console.log('\n💡 DICA: Se deu erro #100, significa que para o Instagram, a única forma é realmente marcar a Vyxfotos como Receptor no painel que você abriu (no link anterior).');
    }
}

forcarControle();
