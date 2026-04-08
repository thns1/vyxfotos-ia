const axios = require('axios');
require('dotenv').config();

const PAGE_ID = '977055518833688'; 
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

async function activate() {
    console.log('🚀 [Atlas Info] Iniciando ATIVAÇÃO UNIVERSAL...');
    
    try {
        console.log('🔍 Identificando tipo de Token...');
        const me = await axios.get(`https://graph.facebook.com/v25.0/me?access_token=${ACCESS_TOKEN}`);
        
        let targetToken = ACCESS_TOKEN;
        
        if (me.data.id === PAGE_ID) {
            console.log('✅ Token já é de PÁGINA. Usando diretamente.');
        } else {
            console.log('👤 Token é de USUÁRIO. Buscando Token de Página...');
            const accounts = await axios.get(`https://graph.facebook.com/v25.0/me/accounts?access_token=${ACCESS_TOKEN}`);
            const page = accounts.data.data.find(p => p.id === PAGE_ID);
            if (!page) throw new Error('Página não encontrada nas contas deste usuário.');
            targetToken = page.access_token;
            console.log('✅ Token de Página obtido com sucesso!');
        }

        console.log(`📡 Ativando Webhooks para a página ${PAGE_ID}...`);
        const response = await axios.post(`https://graph.facebook.com/v25.0/${PAGE_ID}/subscribed_apps`, {
            subscribed_fields: ['messages', 'messaging_postbacks', 'messaging_optins', 'message_deliveries']
        }, {
            params: { access_token: targetToken }
        });

        if (response.data.success) {
            console.log('✅✅✅ SUCESSO TOTAL! ✅✅✅');
            console.log('Seu Robô Vyxfotos.IA está VIVO.');
            console.log('\n🧪 TESTE AGORA: Mande uma mensagem no Direct!');
        }
    } catch (error) {
        console.error('❌ Falha Crítica:', error.response ? error.response.data : error.message);
    }
}

activate();
