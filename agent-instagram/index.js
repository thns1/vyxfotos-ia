require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');

// VARIÁVEIS DE AMBIENTE (A serem configuradas pelo usuário posteriormente)
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'sua_url_do_discord_aqui';
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN || 'seu_token_aqui';
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID || 'seu_id_do_instagram_aqui';

// Função para gerar a legenda incrível via IA
async function generateCaptionWithAI() {
  console.log('🤖 Gerando legenda persusiva com a Inteligência Artificial...');
  // Aqui acionamos o Gemini Vision / OpenAI no futuro.
  // Simulando retorno:
  return `✨ Já imaginou transformar qualquer foto em um ensaio fotográfico premium digno de cinema sem sair de casa?\n\n📸 Confira esse resultado incrível gerado totalmente por nossa IA.\n\nExperimente hoje na Vyxfotos.IA e eternize momentos. Acesse o link na bio e libere a mágica! 💫 \n\n#VyxfotosIA #InteligênciaArtificial #EnsaiosCriativos`;
}

// Função de Postagem usando Instagram Graph API
async function publishToInstagram(imageUrl, caption) {
  try {
    console.log('📱 Enviando imagem para o contêiner do Instagram...');
    // Etapa 1: Enviar Imagem pro Contêiner (API Meta)
    /*
    const containerRes = await axios.post(`https://graph.facebook.com/v19.0/${INSTAGRAM_ACCOUNT_ID}/media`, {
        image_url: imageUrl,
        caption: caption,
        access_token: INSTAGRAM_ACCESS_TOKEN
    });
    const creationId = containerRes.data.id;
    */
    
    // Etapa 2: Publicar o Contêiner no Feed
    /*
    const publishRes = await axios.post(`https://graph.facebook.com/v19.0/${INSTAGRAM_ACCOUNT_ID}/media_publish`, {
        creation_id: creationId,
        access_token: INSTAGRAM_ACCESS_TOKEN
    });
    return publishRes.data.id; // Retorna o ID do Post publicado
    */
    return 'POST_ID_TESTE_123';
  } catch (error) {
    console.error('❌ Erro na postagem do Insta:', error);
    throw error;
  }
}

// Função para notificar sucesso/relatório no Canais do Discord
async function notifyDiscord(message) {
  try {
    // await axios.post(DISCORD_WEBHOOK_URL, { content: message });
    console.log('💬 Notificando painel no Discord:\n' + message);
  } catch (error) {
    console.log('Falha ao notificar o discord: Url não definida.');
  }
}

// Rotina principal de Execução
async function runAutoPilot() {
  console.log('\n=======================================');
  console.log('🚀 [PILOTO AUTOMÁTICO] Acionado - Vyxfotos.IA');
  console.log('=======================================');

  try {
    const caption = await generateCaptionWithAI();
    const demoImage = 'https://link_da_imagem_gerada_ou_galeria.png'; // No futuro, puxar uma do banco
    
    // const postId = await publishToInstagram(demoImage, caption);
    const postId = "IG_POST_MOCK_001";
    
    await notifyDiscord(`✅ **Post Automático Realizado com Sucesso!**\n**Post ID Base:** ${postId}\n\n**Conteúdo:**\n${caption}`);

  } catch (error) {
    await notifyDiscord(`⚠️ **Alerta:** Falha na postagem automática de hoje!\nMotivo: ${error.message}`);
  }
}

// CRON JOB: Segundas, Quartas e Sextas ao 12:00
// "0 12 * * 1,3,5" => 1: Segunda, 3: Quarta, 5: Sexta, as 12:00 do servidor.
console.log('⏳ Agente Vyxfotos dormindo. Acordará Seg/Qua/Sex 12:00...');

cron.schedule('0 12 * * 1,3,5', () => {
    runAutoPilot();
}, {
    timezone: "America/Sao_Paulo"
});

// Iniciamos um teste logo na inicialização para sabermos que o bot rodou:
runAutoPilot();
