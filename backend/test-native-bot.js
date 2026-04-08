/**
 * TESTE DO ROBÔ NATIVO VYX
 * Simula o Instagram enviando uma mensagem via Webhook
 */
const axios = require('axios');

async function simulateInstagramMessage(text) {
    console.log(`\n--- 🧪 SIMULAÇÃO INTEGRADA: START ---`);
    console.log(`👤 [USER NO INSTagram]: ${text}`);

    const webhookPayload = {
        object: 'instagram',
        entry: [{
            messaging: [{
                sender: { id: 'ID_DE_TESTE_123' },
                message: { text: text }
            }]
        }]
    };

    try {
        const res = await axios.post('http://localhost:3001/api/webhooks/instagram', webhookPayload);
        console.log(`✅ [Status Webhook]: ${res.status} ${res.data}`);
    } catch (e) {
        console.error('❌ Erro no teste nativo:', e.response?.data || e.message);
    }
    console.log(`--- 🧪 SIMULAÇÃO INTEGRADA: END ---\n`);
}

async function run() {
    // Simula o lead perguntando o preço
    await simulateInstagramMessage("Qual o valor do ensaio de hoje?");
}

run();
