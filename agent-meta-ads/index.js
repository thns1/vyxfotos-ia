require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'sua_url_do_discord_aqui';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'seu_token_meta_ads_aqui';
const AD_ACCOUNT_ID = process.env.AD_ACCOUNT_ID || 'act_xxxxxxxx';

// Função para Coletar Dados do Meta Ads (ROAS, CPA, Gastos)
async function fetchCampaignInsights() {
  console.log('📊 Coletando métricas do Meta Ads...');
  try {
    /* 
    const url = `https://graph.facebook.com/v19.0/${AD_ACCOUNT_ID}/insights?fields=campaign_name,spend,cpa,purchase_roas,actions&level=campaign&date_preset=last_7d&access_token=${META_ACCESS_TOKEN}`;
    const response = await axios.get(url);
    return response.data.data;
    */
    
    // MOCK para testes
    return [
      { campaign_name: '[Vyxfotos] Conversão - Pacotes Premium', spend: 150.00, cpa: 15.00, roas: 3.2 },
      { campaign_name: '[Vyxfotos] Remarketing - Checkout', spend: 50.00, cpa: 8.50, roas: 5.8 }
    ];
  } catch (error) {
    console.error('Erro ao coletar dados do Meta Ads', error);
    throw error;
  }
}

// Analise com IA 
async function analyzeMetricsWithAI(insightsData) {
  console.log('🤖 IA Analisando os resultados das campanhas...');
  // Aqui enviamos para a OpenAI/Gemini avaliar se o ROAS ta bom e o que deve ser desligado.
  return `📈 **Relatório de Tráfego: Vyxfotos.IA**\n\n` +
         `✅ A campanha **[Vyxfotos] Remarketing** está voando! ROAS de 5.8 e CPA baixíssimo (R$ 8,50). *Recomendação: Dobre o orçamento dessa campanha hoje.*\n\n` +
         `⚠️ A campanha **Pacotes Premium** está com ROAS de 3.2. Está no lucro, mas convém testar criativos novos amanhã.`;
}

// Envios Discord
async function sendDiscordReport(report) {
   // await axios.post(DISCORD_WEBHOOK_URL, { content: report });
   console.log('\n💬 Relatório Enviado pro Discord: \n' + report);
}

// Rotina Master
async function runAdsAnalyzer() {
  console.log('\n=======================================');
  console.log('💰 [AGENTE DE TRÁFEGO] Iniciando análise...');
  console.log('=======================================');
  try {
     const data = await fetchCampaignInsights();
     const iaReport = await analyzeMetricsWithAI(data);
     await sendDiscordReport(iaReport);
  } catch (error) {
     console.log('Falha na analise de ads: ', error.message);
  }
}

// Roda todos os dias as 08:00 AM para avaliar o dia anterior
console.log('⏳ Agente Meta Ads pronto. Análise diária programada para as 08:00 AM...');
cron.schedule('0 8 * * *', () => {
   runAdsAnalyzer();
}, { timezone: "America/Sao_Paulo" });

// Teste inicial
runAdsAnalyzer();
