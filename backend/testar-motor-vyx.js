const googleImageService = require('./services/googleImageService');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function testarProducao() {
    console.log("🚀 Iniciando Teste com o Motor de Produção (V40.0)...");
    
    // Simula o objeto de arquivo que o Multer passaria
    const mockFile = {
        path: path.join(__dirname, 'uploads/WhatsApp Image 2026-04-06 at 13.53.21.jpeg')
    };

    try {
        const result = await googleImageService.generateWithFaceID(mockFile, 'executivo', '', 'masculino');
        
        if (result.status === 'success') {
            const base64Data = result.output_url.replace(/^data:image\/png;base64,/, "");
            const outputPath = path.join(__dirname, 'resultado_motor_producao.png');
            fs.writeFileSync(outputPath, base64Data, 'base64');
            console.log("✅ SUCESSO! Imagem gerada com o motor de produção: " + outputPath);
        }
    } catch (error) {
        console.error("❌ Falha no motor de produção:", error.message);
    }
}

testarProducao();
