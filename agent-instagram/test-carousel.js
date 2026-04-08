/**
 * TESTE DE CARROSSEL V1.0
 * Simula a geração de 3 slides profissionais (Segunda-feira)
 */
require('dotenv').config();
const { generateSmartContent } = require('./contentGenerator');
const { generateRealisticImage, generateAfterImageFromBefore } = require('./geminiImageService');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

async function runCarouselTest() {
    console.log('🎡 [TESTE CARROSSEL] Iniciando Simulação de Segunda-feira...');
    
    // Força Segunda-feira para o teste
    const originalGetDay = Date.prototype.getDay;
    Date.prototype.getDay = () => 1;

    try {
        const content = await generateSmartContent();
        console.log(`📝 Tema: ${content.theme}`);

        const pathBefore = path.join(__dirname, 'sim_car_before.jpg');
        await generateRealisticImage(content.prompt_before, pathBefore);

        const slides = [];
        const variations = ["Slide 1: Capa Impactante", "Slide 2: Detalhe/Ação", "Slide 3: Close de Autoridade"];

        for (let i = 0; i < variations.length; i++) {
            const slidePath = path.join(__dirname, `sim_slide_${i}.jpg`);
            console.log(`📸 Gerando ${variations[i]}...`);
            await generateAfterImageFromBefore(pathBefore, content.prompt_after, variations[i], slidePath);
            slides.push(slidePath);
            await new Promise(r => setTimeout(r, 2000));
        }

        console.log('📤 Enviando sequência para Discord (Simulação de Carrossel)...');
        for (const slide of slides) {
            const form = new FormData();
            form.append('file', fs.createReadStream(slide));
            await axios.post(process.env.DISCORD_WEBHOOK_URL, form, { headers: form.getHeaders() });
        }

        console.log('✅ Simulação enviada! Confira a sequência no Discord.');

    } catch (e) {
        console.error('❌ Erro:', e.message);
    } finally {
        Date.prototype.getDay = originalGetDay;
    }
}

runCarouselTest();
