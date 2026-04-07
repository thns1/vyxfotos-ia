const sharp = require('sharp');
const path = require('path');

/**
 * MOTOR GRÁFICO V5.1 - PERFEIÇÃO TÉCNICA
 * Foco: Estabilidade de Crop e Tipografia Segura
 */
async function createConversionPost(originalPath, bgPath1, bgPath2, topText, bottomText, outputPath) {
    try {
        console.log('🎨 [PDI V5.1] Criando Post de Fidelidade Total...');
        const width = 1080;
        const height = 1350;
        const strapHeight = 250;
        const mainPhotoHeight = height - (2 * strapHeight);

        // 1. Processa os fundos
        const leftBg = await sharp(bgPath1).resize(width / 2, mainPhotoHeight, { fit: 'cover' }).toBuffer();
        const rightBg = await sharp(bgPath2).resize(width / 2, mainPhotoHeight, { fit: 'cover' }).flop().toBuffer();

        // 2. FACE MACRO ZOOM (Garantindo área de extração)
        const circleSize = 500;
        const radius = circleSize / 2;
        const circleMask = Buffer.from(`<svg width="${circleSize}" height="${circleSize}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="black"/></svg>`);

        // Primeiro redimensionamos para um buffer temp para garantir que o extract funcione
        const tempBuffer = await sharp(originalPath).resize(1200, 1200, { fit: 'cover' }).toBuffer();
        
        const faceZoom = await sharp(tempBuffer)
            .extract({ left: 350, top: 100, width: 500, height: 500 }) // Foco absoluto no rosto
            .composite([{ input: circleMask, blend: 'dest-in' }])
            .toFormat('png')
            .toBuffer();

        // 3. Moldura e Texto
        const circleBorder = Buffer.from(`<svg width="${circleSize + 30}" height="${circleSize + 30}"><circle cx="${radius + 15}" cy="${radius + 15}" r="${radius + 10}" fill="white"/></svg>`);

        const generateTextSvg = (text, w, h) => Buffer.from(`
            <svg width="${w}" height="${h}">
                <rect width="100%" height="100%" fill="white"/>
                <text x="50%" y="54%" font-family="Arial, sans-serif" font-weight="900" font-size="50px" 
                fill="black" text-anchor="middle" dominant-baseline="middle">
                    ${text.toUpperCase()}
                </text>
            </svg>
        `);

        // 4. Montagem
        await sharp({
            create: { width: width, height: height, channels: 4, background: 'white' }
        })
        .composite([
            { input: leftBg, left: 0, top: strapHeight },
            { input: rightBg, left: width / 2, top: strapHeight },
            { input: generateTextSvg(topText, width, strapHeight), left: 0, top: 0 },
            { input: generateTextSvg(bottomText, width, strapHeight), left: 0, top: height - strapHeight },
            { input: circleBorder, left: (width - (circleSize + 30)) / 2, top: strapHeight + (mainPhotoHeight - (circleSize + 30)) / 2 },
            { input: faceZoom, left: (width - circleSize) / 2, top: strapHeight + (mainPhotoHeight - circleSize) / 2 },
            { 
                input: Buffer.from(`<svg width="${width}" height="60"><text x="50%" y="50%" font-family="Arial" font-weight="bold" font-size="28px" fill="white" fill-opacity="0.9" text-anchor="middle">@VYXFOTOS.IA</text></svg>`),
                left: 0, top: height - strapHeight - 100 
            }
        ])
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 98 })
        .toFile(outputPath);

        return true;
    } catch (error) {
        console.error('❌ [PDI V5.1] Erro:', error.message);
        throw error;
    }
}

module.exports = { createConversionPost };
