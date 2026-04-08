/**
 * SIMULAÇÃO DE POST - TEMA TRAVEL
 * Valida o fluxo completo de "1 Foto Sua -> Fotos Profissionais" com tema de viagem.
 */
require('dotenv').config();

const { createConversionPost } = require('./imageProcessor');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

// Imagens geradas agora há pouco
const PATH_BEFORE   = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\711ec365-ea3b-430a-a8a7-571e8ed96d5c\\sim_travel_before_1775598874904.png';
const PATH_AFTER_A  = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\711ec365-ea3b-430a-a8a7-571e8ed96d5c\\_1775598923689.png';
const PATH_AFTER_B  = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\711ec365-ea3b-430a-a8a7-571e8ed96d5c\\_1775598970416.png';

const OUTPUT = path.join(__dirname, 'post-SIMULACAO-TRAVEL.jpg');

const LEGENDA = `
🌍 E SE A SUA PRÓXIMA VIAGEM COMEÇASSE AGORA?

Muitas vezes, a única coisa que nos separa dos nossos sonhos é o custo... ou a coragem de começar. Imagine ter fotos incríveis em Paris, Itália ou Maldivas sem precisar gastar milhares de reais em passagens e equipamentos agora. ✈️✨

Com a VyxFotos.IA, transformamos uma selfie comum na sua casa em uma experiência cinematográfica nos lugares mais icônicos do mundo. 100% de fidelidade ao seu rosto, 100% de impacto no seu Instagram.

Não espere pelo "dia perfeito" para ter o feed dos seus sonhos. A tecnologia já tornou isso possível hoje.

👉 QUER VER O SEU ROSTO EM LUGARES INCRÍVEIS?
Clica no link da minha BIO agora e descubra como realizar esse sonho! 🚀📸

#VyxFotosIA #IA #InteligenciaArtificial #ViagemDosSonhos #FidelidadeTotal #MarketingDigital
`;

async function runSimulation() {
    console.log('\n===================================================');
    console.log('🌍 [SIMULAÇÃO TRAVEL] Montando post de amanhã...');
    console.log('===================================================');

    try {
        console.log('🎨 Compondo mosaico (Selfie no centro | Paris e Itália nas laterais)...');
        // V7.0 Swap: (Left, Right, Circle)
        await createConversionPost(
            PATH_AFTER_A, 
            PATH_AFTER_B, 
            PATH_BEFORE, 
            "1 FOTO SUA -> VIAGEM DOS SONHOS\nSEM SAIR DE CASA.",
            "COMENTE 'EU QUERO'\n100% FIDELIDADE",
            OUTPUT
        );

        console.log('\n📤 Enviando para Discord...');
        const form = new FormData();
        form.append('file', fs.createReadStream(OUTPUT));
        const res = await axios.post(
            `${process.env.DISCORD_WEBHOOK_URL}?wait=true`,
            form,
            { headers: form.getHeaders() }
        );

        console.log(`\n✅ SIMULAÇÃO CONCLUÍDA!`);
        console.log(`🖼️  ARTE: ${res.data.attachments[0].url}`);
        console.log(`\n📝 LEGENDA PROPOSTA:\n${LEGENDA}`);

    } catch (e) {
        console.error('❌ Erro na simulação:', e.message);
    }
}

runSimulation();
