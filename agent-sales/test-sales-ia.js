/**
 * TESTE DE VENDAS IA - VYXFOTOS
 * Simula a interação do ManyChat com o nosso Agente Especialista
 */
require('dotenv').config();
const axios = require('axios');

async function simulateManyChatLead(message, niche = "Geral") {
    console.log(`\n===================================================`);
    console.log(`👤 [LEAD]: ${message}`);
    console.log(`🎯 [NICHO]: ${niche}`);
    console.log(`===================================================`);

    try {
        // Testa o Webhook localmente (ajuste a porta se necessário)
        const res = await axios.post('http://localhost:3001/api/webhooks/manychat-sales', {
            message: message,
            niche: niche
        });

        console.log(`🤖 [AGENTE VYX]: ${res.data.response}`);
    } catch (e) {
        console.error('❌ Erro no teste:', e.message);
    }
    console.log(`===================================================\n`);
}

async function runTests() {
    // Teste 1: Objeção de Realismo
    await simulateManyChatLead("Essa foto IA fica igual a mim mesmo?");

    // Teste 2: Gatilho de Nicho (Advogado)
    await simulateManyChatLead("Preciso de algo sério para o meu escritório.", "Lawyer");
}

runTests();
