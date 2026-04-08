const axios = require('axios');
require('dotenv').config();

const PAGE_ID = '977055188333688'; // Obtido do seu print (m.me/977055188333688)
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

async function diagnose() {
    console.log('🔍 [Atlas Info] Iniciando tentativa de conexão forçada...');
    
    try {
        // 1. Listar todas as páginas
        const pagesResponse = await axios.get(`https://graph.facebook.com/v25.0/me/accounts?access_token=${ACCESS_TOKEN}`);
        const pages = pagesResponse.data.data;

        if (!pages || pages.length === 0) {
            console.log('❌ Nenhuma página encontrada.');
            return;
        }

        for (const page of pages) {
            if (page.id === '977055518833688') { // Sua página Vyxfotos
                console.log(`\n📡 Conectando App à página: ${page.name}...`);
                
                try {
                    // Tentar inscrever o App na página para Mensagens de Instagram
                    const subscribe = await axios.post(`https://graph.facebook.com/v25.0/${page.id}/subscribed_apps`, {
                        subscribed_fields: ['messages', 'messaging_postbacks', 'messaging_optins', 'message_deliveries']
                    }, {
                        params: { access_token: page.access_token }
                    });
                    
                    if (subscribe.data.success) {
                        console.log('✅ SUCESSO! O seu robô foi oficialmente inscrito na página.');
                        console.log('🚀 Agora tente mandar uma mensagem para o Instagram!');
                    } else {
                        console.log('⚠️ A resposta da Meta foi:', subscribe.data);
                    }
                } catch (e) {
                    console.error('❌ Falha ao inscrever:', e.response ? e.response.data : e.message);
                }
            }
        }

    } catch (error) {
        console.error('❌ Erro inesperado:', error.response ? error.response.data : error.message);
    }
}

diagnose();
