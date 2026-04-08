const axios = require('axios');
require('dotenv').config();

const PAGE_ID = '977055518833688'; 
const APP_ID = '1308218631517865';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

async function resetAndTakeover() {
    console.log('🚀 [Atlas Info] Iniciando Tomada de Controle (Expulsão do ManyChat)...');
    
    try {
        // 1. Tentar definir o Aplicativo Vyxfotos como Receptor Principal
        console.log('📡 Definindo Vyxfotos como Receptor Principal...');
        const res = await axios.post(`https://graph.facebook.com/v25.0/${PAGE_ID}/messenger_profile`, {
            page_receiver_id: APP_ID
        }, {
            params: { access_token: ACCESS_TOKEN }
        });
        
        console.log('✅ Resposta da Meta:', res.data);
        console.log('\n✅ Vyxfotos deve agora ser o Receptor Principal.');
        console.log('🚀 Tente mandar uma mensagem no Instagram agora!');

    } catch (error) {
        console.error('❌ Falha na tomada de controle:', error.response ? error.response.data : error.message);
        console.log('\n💡 Se deu erro de permissão (Advanced Access), a única forma é pelo menu "Mensagens Avançadas" no Meta Business Suite.');
    }
}

resetAndTakeover();
