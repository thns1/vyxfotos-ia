/**
 * TESTE V3.0 - ALTA FIDELIDADE TRIPLA
 * Gera 3 fotos distintas da mesma pessoa e monta o layout final sem sobreposição.
 */
require('dotenv').config();

const { createConversionPost } = require('./imageProcessor');
const { generateRealisticImage, generateAfterImageFromBefore } = require('./geminiImageService');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

async function runV3Test() {
    console.log('\n===================================================');
    console.log('🧪 [TESTE V3.0] Fidelidade Tripla — Mesma Pessoa, 3 Poses');
    console.log('===================================================');

    const pathBefore = path.join(__dirname, `v3-before.jpg`);
    const pathAfterA  = path.join(__dirname, `v3-after-A.jpg`);
    const pathAfterB  = path.join(__dirname, `v3-after-B.jpg`);
    const output     = path.join(__dirname, `post-v3-FINAL.jpg`);

    try {
        // 1. ANTES (Base)
        console.log('\n📸 [1/4] Gerando Foto Base (Antes)...');
        await generateRealisticImage(
            "Candid selfie of a young Brazilian woman, 25 years old, wavy blonde hair, blue eyes, light skin, smiling naturally, wearing a casual denim jacket, city street background, natural daylight, photorealistic DSLR style",
            pathBefore
        );

        // 2. DEPOIS A (Executivo - Pose de lado)
        console.log('\n📸 [2/4] Gerando Variação Profissional A (Ângulo lateral)...');
        await generateAfterImageFromBefore(
            pathBefore,
            "Executive professional style, luxury office, dark grey suit",
            "Slightly turned to the side, looking at the camera with a confident smile, shoulders visible",
            pathAfterA
        );

        // 3. DEPOIS B (Executivo - Zoom Frontal)
        console.log('\n📸 [3/4] Gerando Variação Profissional B (Zoom Frontal)...');
        await generateAfterImageFromBefore(
            pathBefore,
            "Executive professional style, luxury studio background",
            "Direct frontal close-up portrait, extreme focus on the face, strictly professional",
            pathAfterB
        );

        // 4. COMPOSIÇÃO V7.0
        console.log('\n🖼️  [4/4] Compondo V7.0 com Gravidade Externa...');
        // Layout: Esquerda = Antes, Direita = Depois A, Centro = Depois B (Zoom)
        await createConversionPost(pathBefore, pathAfterA, pathAfterB, "SUA SELFIE -> FOTO DE PERFIL", "COMENTE 'EU QUERO'\nFIDELIDADE TOTAL", output);

        console.log('\n📤 Enviando para Discord para inspeção...');
        const form = new FormData();
        form.append('file', fs.createReadStream(output));
        const res = await axios.post(
            `${process.env.DISCORD_WEBHOOK_URL}?wait=true`,
            form,
            { headers: form.getHeaders() }
        );
        
        console.log(`\n✅ ===== TESTE V3.0 CONCLUÍDO =====`);
        console.log(`🔗 VISUALIZE O RESULTADO: ${res.data.attachments[0].url}`);
        console.log(`==================================\n`);

    } catch (error) {
        console.error('\n❌ Erro no teste V3:', error.message);
        console.error(error.stack);
    }
}

runV3Test();
