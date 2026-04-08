/**
 * SIMULADOR DE CICLO SEMANAL V1.0
 * Testa os 3 Pilares: Autoridade (SEG), Fidelidade (QUA), Lifestyle (SEX)
 */
require('dotenv').config();
const { generateSmartContent } = require('./contentGenerator');
const { createConversionPost } = require('./imageProcessor');
const { generateRealisticImage, generateAfterImageFromBefore } = require('./geminiImageService');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');

async function simulateDay(dayName, dayIndex) {
    console.log(`\n===================================================`);
    console.log(`🚀 [SIMULAÇÃO] ${dayName.toUpperCase()} 🚀`);
    console.log(`===================================================`);

    // Mock Date.getDay
    const originalGetDay = Date.prototype.getDay;
    Date.prototype.getDay = () => dayIndex;

    const pathBefore = path.join(__dirname, `sim_${dayName}_before.jpg`);
    const pathAfter1 = path.join(__dirname, `sim_${dayName}_after_1.jpg`);
    const pathAfter2 = path.join(__dirname, `sim_${dayName}_after_2.jpg`);
    const output    = path.join(__dirname, `sim_${dayName}_FINAL.jpg`);

    try {
        const content = await generateSmartContent();
        console.log(`📝 Tema: ${content.theme}`);

        // Geração (Usando Fallback se necessário)
        await generateRealisticImage(content.prompt_before, pathBefore);
        await new Promise(r => setTimeout(r, 2000));
        
        await generateAfterImageFromBefore(pathBefore, content.prompt_after, "Variation A", pathAfter1);
        await new Promise(r => setTimeout(r, 2000));
        
        await generateAfterImageFromBefore(pathBefore, content.prompt_after, "Variation B - Close Up", pathAfter2);

        // Arte
        await createConversionPost(pathAfter1, pathAfter2, pathBefore, content.top_text, content.bottom_text, output);

        console.log(`📤 Enviando ${dayName} para Discord...`);
        const form = new FormData();
        form.append('file', fs.createReadStream(output));
        const res = await axios.post(`${process.env.DISCORD_WEBHOOK_URL}?wait=true`, form, { headers: form.getHeaders() });
        console.log(`✅ [${dayName}] Link: ${res.data.attachments[0].url}`);

    } catch (e) {
        console.error(`❌ Erro em ${dayName}:`, e.message);
    } finally {
        Date.prototype.getDay = originalGetDay; // Restaura
    }
}

async function runFullCycle() {
    await simulateDay('Segunda (Autoridade)', 1);
    await new Promise(r => setTimeout(r, 5000));
    
    await simulateDay('Quarta (Fidelidade)', 3);
    await new Promise(r => setTimeout(r, 5000));
    
    await simulateDay('Sexta (Lifestyle)', 5);
    
    console.log('\n✨===== CICLO DE SIMULAÇÃO CONCLUÍDO =====✨');
}

runFullCycle();
