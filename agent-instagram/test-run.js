/**
 * SCRIPT DE TESTE - Simula o ciclo completo da quarta-feira
 * Rode com: node test-run.js
 * Isso NÃO verifica o dia da semana — roda sempre.
 */
require('dotenv').config();

// Força hoje = quarta-feira para fins de teste
const RealDate = Date;
class MockDate extends RealDate {
    constructor(...args) {
        if (args.length === 0) {
            super();
            // Define getDay() para retornar quarta-feira (3)
            this.getDay = () => 3;
        } else {
            super(...args);
        }
    }
}
global.Date = MockDate;

const { createConversionPost } = require('./imageProcessor');
const { generateSmartContent } = require('./contentGenerator');
const { generateRealisticImage } = require('./geminiImageService');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

async function runTest() {
    console.log('\n===================================================');
    console.log('🧪 [TESTE] Ciclo Completo — Quarta-feira de Alta Fidelidade');
    console.log('===================================================');

    const pathBefore = path.join(__dirname, `temp-before-TEST.jpg`);
    const pathAfter  = path.join(__dirname, `temp-after-TEST.jpg`);
    const output     = path.join(__dirname, `post-TEST.jpg`);

    try {
        // 1. Conteúdo
        console.log('\n📝 [Step 1/4] Gerando conteúdo (Modo Quarta-feira)...');
        const content = await generateSmartContent();
        console.log(`✅ Persona: ${content.person_name} | Tema: ${content.theme}`);
        console.log(`📄 Top: ${content.top_text}`);
        console.log(`📄 Bottom: ${content.bottom_text}`);

        // 2. Imagens com Gemini
        console.log('\n🎨 [Step 2/4] Gerando imagens fotorrealistas...');
        await generateRealisticImage(content.prompt_before, pathBefore);
        await generateRealisticImage(content.prompt_after, pathAfter);

        // 3. Composição
        console.log('\n🖼️  [Step 3/4] Compondo post (Pescoço pra cima)...');
        await createConversionPost(pathBefore, pathBefore, pathAfter, content.top_text, content.bottom_text, output);
        console.log(`✅ Post salvo localmente: ${output}`);

        // 4. Envio para Discord (visualização)
        console.log('\n📤 [Step 4/4] Enviando para Discord...');
        const form = new FormData();
        form.append('file', fs.createReadStream(output));
        const discordRes = await axios.post(
            `${process.env.DISCORD_WEBHOOK_URL}?wait=true`,
            form,
            { headers: form.getHeaders() }
        );
        const publicUrl = discordRes.data.attachments[0].url;

        console.log(`\n✅ ===== TESTE CONCLUÍDO =====`);
        console.log(`🔗 Imagem no Discord: ${publicUrl}`);
        console.log(`📱 Caption: ${content.caption.substring(0, 100)}...`);
        console.log(`(Instagram não publicado — isso é apenas um teste visual)`);
        console.log(`============================\n`);

    } catch (error) {
        console.error('\n❌ [TESTE] Falha:', error.message);
        console.error(error.stack);
    } finally {
        // Mantém o arquivo de output para visualização — apaga só os temporários
        [pathBefore, pathAfter].forEach(f => {
            try { if (fs.existsSync(f)) fs.unlinkSync(f); } catch (e) {}
        });
        console.log(`🖼️  Arquivo final salvo em: ${output}`);
    }
}

runTest();
