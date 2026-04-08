const axios = require('axios');
require('dotenv').config();

const PAGE_ID = '977055518833688';
const APP_ID = '1308218631517865';
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

async function ativarControleTotal() {
    console.log('🚀 [Fase 1] Iniciando Reivindicação de Controle...');

    try {
        // 0. Obter o Page Access Token real (caso o fornecido seja de usuário)
        console.log('🔑 [Passo 0] Obtendo Page Access Token...');
        const accounts = await axios.get('https://graph.facebook.com/v25.0/me/accounts', {
            params: { access_token: ACCESS_TOKEN }
        });
        
        const page = accounts.data.data.find(p => p.id === PAGE_ID);
        if (!page) {
            throw new Error(`A página ${PAGE_ID} não foi encontrada nas contas vinculadas a este Token.`);
        }
        
        const PAGE_ACCESS_TOKEN = page.access_token;
        console.log('✅ Page Token obtido com sucesso.');

        // 1. Forçar a Inscrição da Página no nosso App com todos os campos necessários
        console.log('📡 [Passo 1] Inscrevendo App na Página...');
        await axios.post(`https://graph.facebook.com/v25.0/${PAGE_ID}/subscribed_apps`, {
            subscribed_fields: 'messages,messaging_postbacks,messaging_optins,messaging_referrals',
            access_token: PAGE_ACCESS_TOKEN
        });
        console.log('✅ App Inscrito com sucesso.');

        // 2. Tentar definir o App como Receptor Principal (Handover Protocol)
        console.log('👑 [Passo 2] Definindo Vyxfotos como Receptor Principal...');
        try {
            const resp = await axios.post(`https://graph.facebook.com/v25.0/${PAGE_ID}/messenger_profile`, {
                page_receiver_id: APP_ID
            }, {
                params: { access_token: PAGE_ACCESS_TOKEN }
            });
            console.log('✅ Sucesso: Vyxfotos é agora o dono das mensagens!', resp.data);
        } catch (e) {
            console.warn('⚠️ Nota: Não foi possível definir via messenger_profile (comum em IGs novos). Erro:', e.response?.data?.error?.message || e.message);
        }

        // 3. Verificação Final: Quem a Meta diz que está ouvindo?
        console.log('🧪 [Passo 3] Verificando status final...');
        const verify = await axios.get(`https://graph.facebook.com/v25.0/${PAGE_ID}/subscribed_apps`, {
            params: { access_token: PAGE_ACCESS_TOKEN }
        });

        
        console.log('📊 RELATÓRIO FINAL:');
        console.log(JSON.stringify(verify.data, null, 2));

        console.log('\n🏁 [ATIVAÇÃO FINALIZADA]');
        console.log('👉 Agora, mande uma mensagem de uma CONTA DIFERENTE no Instagram.');
        console.log('👉 Fique de olho na aba do VS Code onde o server.js está rodando!');

    } catch (error) {
        console.error('❌ ERRO CRÍTICO NA ATIVAÇÃO:', error.response?.data || error.message);
    }
}

ativarControleTotal();
