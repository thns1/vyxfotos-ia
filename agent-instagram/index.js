/**
 * AGENTE INSTAGRAM - V8.1 PRODUCTION (CAROUSEL EDITION)
 * Gerencia Pilares: Autoridade (SEG - Carrossel), Fidelidade (QUA - Mosaico), Lifestyle (SEX - Carrossel)
 */
require('dotenv').config();
const { generateSmartContent } = require('./contentGenerator');
const { generateRealisticImage, generateAfterImageFromBefore } = require('./geminiImageService');
const { createConversionPost } = require('./imageProcessor');
const { postToInstagram, postCarouselToInstagram } = require('./instagramService');
const path = require('path');
const fs = require('fs');

async function runAutomation() {
    console.log('🚀 [VYX-AGENTE] Iniciando Ciclo Semanal Estratégico...');
    
    const today = new Date().getDay();
    const isWednesday = (today === 3);
    const isCarouselDay = (today === 1 || today === 5);

    try {
        // 1. CONTEÚDO
        const content = await generateSmartContent();
        const caption = content.caption;
        console.log(`📝 [${content.theme}] Gerado com sucesso.`);

        // 2. FOTO BASE (ANTES)
        const pathBefore = path.join(__dirname, 'temp_before.jpg');
        await generateRealisticImage(content.prompt_before, pathBefore);
        await new Promise(r => setTimeout(r, 5000));

        if (isWednesday) {
            // FLUXO QUARTA-FEIRA: MOSAICO TRIPLO
            const pathAfter1 = path.join(__dirname, 'temp_after_1.jpg');
            const pathAfter2 = path.join(__dirname, 'temp_after_2.jpg');
            const finalPost = path.join(__dirname, 'post_mosaico.jpg');

            console.log('📸 Gerando variações para Mosaico...');
            await generateAfterImageFromBefore(pathBefore, content.prompt_after, "Pose A", pathAfter1);
            await new Promise(r => setTimeout(r, 5000));
            await generateAfterImageFromBefore(pathBefore, content.prompt_after, "Pose B Zoom", pathAfter2);

            await createConversionPost(pathAfter1, pathAfter2, pathBefore, content.top_text, content.bottom_text, finalPost);
            
            console.log('📤 Postando Mosaico Triplo...');
            await postToInstagram(finalPost, caption);
            
            // Limpeza
            [pathBefore, pathAfter1, pathAfter2, finalPost].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
        } 
        else if (isCarouselDay) {
            // FLUXO SEGUNDA/SEXTA: CARROSSEL (3 Slides Profesionais)
            const slides = [];
            const variations = [
                "Full body professional pose, cinematic lighting",
                "Medium shot, confident expression, looking at camera",
                "Extreme close up portrait, high detail"
            ];

            console.log(`📸 Gerando ${variations.length} slides para Carrossel...`);
            for (let i = 0; i < variations.length; i++) {
                const slidePath = path.join(__dirname, `temp_slide_${i}.jpg`);
                await generateAfterImageFromBefore(pathBefore, content.prompt_after, variations[i], slidePath);
                slides.push(slidePath);
                await new Promise(r => setTimeout(r, 8000)); // Delay seguro
            }

            console.log('📤 Postando Carrossel de Impacto...');
            await postCarouselToInstagram(slides, caption);

            // Limpeza
            [pathBefore, ...slides].forEach(f => fs.existsSync(f) && fs.unlinkSync(f));
        }

        console.log('✅ CICLO CONCLUÍDO COM SUCESSO!');

    } catch (error) {
        console.error('❌ ERRO NO FLUXO:', error.message);
        process.exit(1);
    }
}

runAutomation();
