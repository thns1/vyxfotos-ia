/**
 * TESTE DIRETO - Usa imagens geradas localmente para testar o layout.
 * Rode com: node test-layout.js
 */
require('dotenv').config();

const { createConversionPost } = require('./imageProcessor');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

// Caminhos das imagens — MESMA PESSOA (antes + edição Gemini = depois)
const BEFORE_IMG = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\711ec365-ea3b-430a-a8a7-571e8ed96d5c\\before_selfie_v2_1775597012397.png';
const AFTER_IMG  = 'C:\\Users\\User\\.gemini\\antigravity\\brain\\711ec365-ea3b-430a-a8a7-571e8ed96d5c\\after_professional_v2_1775597080552.png';

const TOP_TEXT    = '1 FOTO SUA -> FOTOS PROFISSIONAIS\nSEM ESTÚDIO.';
const BOTTOM_TEXT = "COMENTE 'EU QUERO'\n100% FIDELIDADE";
const OUTPUT      = path.join(__dirname, 'post-layout-TEST.jpg');

async function runLayoutTest() {
    console.log('\n===================================================');
    console.log('🖼️  [TESTE DE LAYOUT] Montando post com imagens reais...');
    console.log('===================================================');

    if (!fs.existsSync(BEFORE_IMG)) {
        console.error('❌ Arquivo BEFORE não encontrado:', BEFORE_IMG);
        return;
    }
    if (!fs.existsSync(AFTER_IMG)) {
        console.error('❌ Arquivo AFTER não encontrado:', AFTER_IMG);
        return;
    }

    try {
        console.log('🎨 Compondo post...');
        await createConversionPost(BEFORE_IMG, BEFORE_IMG, AFTER_IMG, TOP_TEXT, BOTTOM_TEXT, OUTPUT);
        console.log(`✅ Post criado: ${OUTPUT}`);

        console.log('\n📤 Enviando para Discord...');
        const form = new FormData();
        form.append('file', fs.createReadStream(OUTPUT));
        const res = await axios.post(
            `${process.env.DISCORD_WEBHOOK_URL}?wait=true`,
            form,
            { headers: form.getHeaders() }
        );
        const url = res.data.attachments[0].url;
        console.log(`\n✅ VISUALIZE O POST AQUI: ${url}`);
        console.log('(Abra o link no navegador para ver o resultado final)');
    } catch (e) {
        console.error('❌ Erro:', e.message);
    }
}

runLayoutTest();
