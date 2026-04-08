/**
 * TESTO FINAL V3.1 - ALTA FIDELIDADE TRIPLA (MANUAL)
 * Simula a composição com imagens geradas manualmente para validar o layout.
 */
require('dotenv').config();

const { createConversionPost } = require('./imageProcessor');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

// Caminhos das imagens reais geradas agora
const PATH_BEFORE = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\711ec365-ea3b-430a-a8a7-571e8ed96d5c\\v3_before_blonde_1775597748635.png';
const PATH_AFTER_A = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\711ec365-ea3b-430a-a8a7-571e8ed96d5c\\_1775597790088.png';
const PATH_AFTER_B = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\711ec365-ea3b-430a-a8a7-571e8ed96d5c\\_1775597834661.png';

const OUTPUT = path.join(__dirname, 'post-v3-FINAL-MANUAL.jpg');

async function runManualTest() {
    console.log('\n===================================================');
    console.log('🖼️  [TESTE FINAL V3.1] Consolidando Layout Triplo');
    console.log('===================================================');

    try {
        console.log('🎨 Montando post com Selfie no Círculo (Prova de Identidade) e Profissionais nas Laterais...');
        // V7.0 Swap: 
        // pathLeft = After A (Exec)
        // pathRight = After B (Exec 2)
        // pathCircle = Before (Selfie)
        await createConversionPost(
            PATH_AFTER_A, 
            PATH_AFTER_B, 
            PATH_BEFORE, 
            "1 FOTO SUA -> FOTOS PROFISSIONAIS\nSEM ESTÚDIO.",
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

        console.log(`\n✅ RESULTADO DISPONÍVEL: ${res.data.attachments[0].url}`);
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
}

runManualTest();
