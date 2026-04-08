const sharp = require('sharp');
const path = require('path');

/**
 * MOTOR GRÁFICO V7.0 - ALTA FIDELIDADE TRIPLA
 * Ajustes:
 * - 3 Imagens distintas: pathLeft (Antes), pathRight (Depois A), pathCircle (Depois B)
 * - Gravidade externa: Rostos empurrados para as bordas para não serem cobertos pelo círculo
 * - Centralização absoluta do rosto dentro do círculo central
 */
async function createConversionPost(pathLeft, pathRight, pathCircle, topText, bottomText, outputPath) {
    try {
        console.log('🎨 [PDI V7.0] Criando Post de Fidelidade Tripla...');
        const width = 1080;
        const height = 1350;
        const strapHeight = 250;
        const mainPhotoHeight = height - (2 * strapHeight);

        // 1. Processa os fundos com DESLOCAMENTO CONTROLADO (Sweet Spot)
        // Forçamos 1024x1024 antes para garantir que o extract nunca falhe
        const bgWidth = 850;
        
        // Painel ESQUERDO (Antes): Offset de 240px
        const leftBg = await sharp(pathLeft)
            .resize(1024, 1024, { fit: 'cover' }) // Garantia de dimensões
            .resize(bgWidth, mainPhotoHeight, { fit: 'cover' })
            .extract({ left: 240, top: 0, width: width / 2, height: mainPhotoHeight })
            .toBuffer();

        // Painel DIREITO (Depois): Offset de 70px
        const rightBg = await sharp(pathRight)
            .resize(1024, 1024, { fit: 'cover' }) // Garantia de dimensões
            .resize(bgWidth, mainPhotoHeight, { fit: 'cover' })
            .extract({ left: 70, top: 0, width: width / 2, height: mainPhotoHeight })
            .toBuffer();

        // 2. CÍRCULO CENTRAL - ALTA FIDELIDADE (ZOOM PESCOÇO PRA CIMA)
        const circleSize = 420;
        const radius = circleSize / 2;
        
        const faceZoom = await sharp(pathCircle)
            .resize(1024, 1024, { fit: 'cover' }) // Garantia de dimensões
            .extract({ left: 137, top: 100, width: 750, height: 750 })
            .resize(circleSize, circleSize, { fit: 'cover', position: 'center' })
            .composite([{ 
                input: Buffer.from(`<svg width="${circleSize}" height="${circleSize}"><circle cx="${radius}" cy="${radius}" r="${radius}" fill="black"/></svg>`), 
                blend: 'dest-in' 
            }])
            .toFormat('png')
            .toBuffer();

        // 3. Molduras Premium
        const outerBorder = Buffer.from(
            `<svg width="${circleSize + 30}" height="${circleSize + 30}"><circle cx="${radius + 15}" cy="${radius + 15}" r="${radius + 13}" fill="white"/></svg>`
        );

        // 4. Tipografia
        const generateTextSvg = (text, w, h) => {
            const lines = text.split('\n');
            const fontSize = lines.length > 1 ? 42 : 52;
            let textElements = '';
            lines.forEach((line, index) => {
                const totalLines = lines.length;
                const startY = 50 - (totalLines - 1) * 14;
                const yPct = startY + index * 28;
                textElements += `<text x="50%" y="${yPct}%" font-family="Arial Black, sans-serif" font-weight="900" font-size="${fontSize}px" fill="black" text-anchor="middle" dominant-baseline="middle">${line.toUpperCase()}</text>`;
            });
            return Buffer.from(`<svg width="${w}" height="${h}"><rect width="100%" height="100%" fill="white"/>${textElements}</svg>`);
        };

        // 5. Montagem Final
        const circleX = (width - (circleSize + 30)) / 2;
        const circleY = strapHeight + (mainPhotoHeight - (circleSize + 30)) / 2;

        await sharp({
            create: { width: width, height: height, channels: 4, background: 'white' }
        })
        .composite([
            { input: leftBg, left: 0, top: strapHeight },
            { input: rightBg, left: width / 2, top: strapHeight },
            { input: generateTextSvg(topText, width, strapHeight), left: 0, top: 0 },
            { input: generateTextSvg(bottomText, width, strapHeight), left: 0, top: height - strapHeight },
            { input: outerBorder, left: circleX, top: circleY },
            { input: faceZoom, left: circleX + 15, top: circleY + 15 },
            { 
                input: Buffer.from(`<svg width="${width}" height="80"><rect width="320" height="56" x="${(width - 320) / 2}" y="12" rx="28" fill="black" fill-opacity="0.8"/><text x="50%" y="54%" font-family="Arial" font-weight="bold" font-size="24px" fill="white" text-anchor="middle" dominant-baseline="middle">@VYXFOTOS.IA</text></svg>`),
                left: 0, top: height - strapHeight - 100
            }
        ])
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: 96 })
        .toFile(outputPath);

        console.log(`✅ [PDI V7.0] Post criado: ${path.basename(outputPath)}`);
        return true;
    } catch (error) {
        console.error('❌ [PDI V7.0] Erro:', error.message);
        throw error;
    }
}

module.exports = { createConversionPost };
