const path = require('path');
const fs = require('fs');
require('dotenv').config();

const googleImageService = require('./services/googleImageService');

async function run() {
    const fotoPath = path.join(__dirname, 'foto.jpeg');

    if (!fs.existsSync(fotoPath)) {
        console.error('❌ foto.jpeg não encontrada na pasta backend/');
        process.exit(1);
    }

    // Simula o objeto imageFile que o multer envia
    const imageFile = {
        path: fotoPath,
        originalname: 'foto.jpeg'
    };

    console.log('🚀 Testando novo motor: Gemini 2.0 Flash Image Generation');
    console.log('📸 Foto:', fotoPath);
    console.log('🎨 Tema: executivo\n');

    try {
        const resultado = await googleImageService.generateWithFaceID(
            imageFile,
            'executivo',
            '',
            'masculino'
        );

        // Salva o resultado (remove qualquer prefixo data URL)
        const base64 = resultado.output_url.replace(/^data:[^;]+;base64,/, '');
        const outputPath = path.join(__dirname, `resultado_flux_${Date.now()}.png`);
        fs.writeFileSync(outputPath, Buffer.from(base64, 'base64'));

        console.log('✅ SUCESSO!');
        console.log('📂 Imagem salva em:', outputPath);
        console.log('🆔 Order ID:', resultado.orderId);
    } catch (e) {
        console.error('❌ ERRO:', e.message);
        if (e.message.includes('API_KEY')) {
            console.error('   → Verifique GEMINI_API_KEY no .env');
        }
        if (e.message.includes('not found') || e.message.includes('model')) {
            console.error('   → Modelo gemini-2.0-flash-preview-image-generation pode não estar disponível na sua região');
            console.error('   → Tente trocar para: gemini-2.0-flash-exp-image-generation');
        }
    }
}

run();
