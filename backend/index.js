const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleGenAI } = require('@google/genai');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const PORT = process.env.PORT || 3001;
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const { getPrompt } = require('./constants/themePrompts');

// ─────────────────────────────────────────────
// RATE LIMITING (preview gratuito)
// ─────────────────────────────────────────────
const LIMIT_ATTEMPTS = 3;
const COOLDOWN_MINUTES = 15;
const freeTrialLimits = {};
const chatLimits = {};
const CHAT_LIMIT_PER_HOUR = 20;
const CHAT_COOLDOWN_MS = 60 * 60 * 1000;

// ─────────────────────────────────────────────
// 1. DETECÇÃO AUTOMÁTICA DE GÊNERO PELA SELFIE
// ─────────────────────────────────────────────
async function detectGender(imageBase64) {
  try {
    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const response = await model.generateContent([
      { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
      { text: `Analyze the person in this photo carefully. Determine their gender based on visual appearance.
Reply with ONLY one word — no explanation, no punctuation:
- "feminino" if the person appears to be female
- "masculino" if the person appears to be male` }
    ]);
    const result = response.response.text().trim().toLowerCase();
    const detected = result.includes('feminino') ? 'feminino' : 'masculino';
    console.log(`[VYX] Gênero detectado: ${detected}`);
    return detected;
  } catch (error) {
    console.error('[VYX] Erro na detecção de gênero — fallback masculino:', error.message);
    return 'masculino';
  }
}

// ─────────────────────────────────────────────
// 2. INTERPRETADOR DE SONHOS
// ─────────────────────────────────────────────
async function parseDreamsWithAI(rawText) {
  try {
    const aiPrompt = `You are an intelligent assistant for a luxury AI photo studio. A client wrote a request for their dream photoshoot. The text may contain typos, abbreviations, slang, informal language, or mixed languages — your job is to UNDERSTAND THE INTENT, not judge the writing.

Client wrote: "${rawText}"

Your task: determine if this text describes ONE dream scenario or MULTIPLE distinct dream scenarios that the client wants as SEPARATE photoshoot options.

RULES for deciding:
- "policial ou bombeiro" → 2 scenarios (client is choosing between two different roles)
- "astronauta e piloto de F1" → 2 scenarios (two clearly different roles)
- "em paris na torre eifell com meu caro de luxo" → 1 scenario (one scene with multiple elements, even with typos)
- "quero ta em nova york ou em paris" → 2 scenarios (two different locations as options)
- "soldado com armadura medievall" → 1 scenario (one concept, typos corrected)
- "quero ser bombreiro" → 1 scenario ("bombreiro" = "bombeiro", typo corrected)
- "princesa num castelo dourado com vestido" → 1 scenario
- "super heroi ou vilao" → 2 scenarios

IMPORTANT: Correct typos and informal writing when returning scenario names. Return clean, clear descriptions in Portuguese.

Return ONLY a valid JSON array of strings (the scenario names/descriptions), nothing else.
Examples:
["estar em Paris na frente da Torre Eiffel com um carro de luxo"]
["policial", "bombeiro"]
["astronauta", "piloto de Fórmula 1"]`;

    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const response = await model.generateContent(aiPrompt);
    const raw = response.response.text().trim().replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [rawText];
  } catch (error) {
    console.error('[VYX] Erro ao interpretar sonhos:', error.message);
    const fallback = rawText.split(/\s+ou\s+/i).map(s => s.trim()).filter(s => s.length > 1);
    return fallback.length > 0 ? fallback : [rawText];
  }
}

// ─────────────────────────────────────────────
// 3. ELABORADOR DE SONHOS EM PROMPT CINEMATOGRÁFICO
// ─────────────────────────────────────────────
async function expandCustomTheme(rawTheme, gender) {
  try {
    const genderLabel = gender === 'feminino' ? 'female' : 'male';
    const aiPrompt = `You are a world-class photography art director and creative director for a luxury AI photo studio.

A ${genderLabel} client wants a professional photoshoot with this concept: "${rawTheme}"

Your job is to write a single MASTERCLASS generative image prompt (4 to 6 rich sentences) that will make Gemini AI produce a SPECTACULAR, photorealistic, cinematic portrait.

STRICT RULES:
- Describe ONLY: (1) the exact outfit/costume with precise fabric, color, details and accessories, (2) the background/setting with rich environmental storytelling, (3) the cinematic lighting setup with direction, quality, and mood, (4) camera and photographic style details.
- DO NOT mention the person's face, eyes, skin, smile, expression, or identity — these are handled separately.
- Write in English.
- Use professional photography and film terminology.
- Make it VIVID, SPECIFIC, and CINEMATIC — never generic.
- Aim for the quality of a Vogue editorial, a Hollywood production still, or a National Geographic cover.
- Return ONLY the final prompt string. No explanations, no labels, no quotes.`;

    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const response = await model.generateContent(aiPrompt);
    return response.response.text().trim();
  } catch (error) {
    console.error('[VYX] Erro no elaborador de sonhos:', error.message);
    return `Ultra-high quality cinematic portrait. The subject is styled as: ${rawTheme}. Professional studio photography with dramatic cinematic lighting, detailed costume, and immersive background environment. Photorealistic, 8K.`;
  }
}

// ─────────────────────────────────────────────
// 4. GERAÇÃO DE IMAGEM VIA GEMINI
// ─────────────────────────────────────────────
async function generateImage(imageBase64, prompt) {
  const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await genai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        { text: prompt }
      ]
    }],
    config: { responseModalities: ['IMAGE', 'TEXT'] }
  });
  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData);
  return imagePart?.inlineData?.data || null;
}

// ─────────────────────────────────────────────
// 5. MONTADOR DE PROMPT FINAL
// ─────────────────────────────────────────────
async function buildPrompt(themeId, subthemeId, customTheme, gender, photoIndex = 0) {
  const isFemale = gender === 'feminino';
  const isExecutive = themeId === 'executivo';
  const isLuxo = themeId === 'luxo';

  const genderLine = isFemale
    ? `same jawline, no facial hair, smooth natural skin texture. GENDER: FEMALE subject.`
    : `same jawline, EXACT same facial hair. If the person has a goatee and mustache only, strictly maintain ONLY the goatee and mustache. DO NOT add a full beard. GENDER: MALE subject.`;

  const expressionMood = {
    executivo:   `professional authority and composed confidence`,
    luxo:        `sophisticated elegance and quiet power`,
    aniversario: `warmth and celebratory ease`,
    sonhos:      `adventurous confidence matching the fantasy role`,
  }[themeId] || `natural composed confidence`;

  const expressionGuide = `CRITICAL: Reproduce EXACTLY the facial expression from the reference photo. If the person is NOT smiling in the reference, DO NOT add a smile. If the person is smiling in the reference, preserve that smile. NEVER invent, add, or remove any expression element not present in the reference. The only adjustment allowed is to channel the mood of ${expressionMood} through the eyes and overall presence — without changing what the mouth is doing.`;

  let clothingOverride;
  if (isExecutive) {
    clothingOverride = isFemale
      ? `CLOTHING: The subject is FEMALE. Dress her in a tailored women's power suit — a structured feminine blazer with matching slim trousers or pencil skirt, in the same color described in the prompt (navy, charcoal, black, etc.). Add a feminine blouse or silk top underneath. No masculine tie. This is a professional feminine executive look.`
      : `CLOTHING: Apply exactly the suit, shirt, and tie described. This completely replaces all clothing visible in the reference image.`;
  } else if (isLuxo) {
    clothingOverride = isFemale
      ? `CLOTHING (MANDATORY): The subject is FEMALE. The prompt describes luxury masculine attire (suit/tuxedo). Adapt it to the feminine equivalent: an elegant floor-length gown, fitted evening dress, or luxury ensemble in the SAME color palette and prestige level. Do NOT apply a masculine suit to a female subject.`
      : `CLOTHING: Apply exactly the luxury menswear described. Completely replace all clothing from the reference image.`;
  } else {
    clothingOverride = `CLOTHING (MANDATORY): Apply EXACTLY the outfit described in the prompt above. Completely replace ALL clothing from the reference image. Do NOT carry over any clothing from the reference photo — apply only what is described.`;
  }

  const baseGuard = `
[CRITICAL IDENTITY RULES]
FACE (non-negotiable): Keep 100% identical — same eyes, same nose, same mouth, same eyebrows, same skin tone, same hair color and texture, ${genderLine}
SKIN RETOUCHING (professional studio standard): Apply high-end retouching as a professional photographer would in post-production: (1) completely eliminate dark circles and puffiness under the eyes while preserving natural eye depth; (2) remove all visible blemishes, acne spots, blackheads, and redness; (3) smooth uneven skin texture and enlarged pores; (4) correct any skin discoloration or blotchy patches; (5) soften fine lines without erasing natural facial structure. The result must look like a professional studio session with expert retouching — healthy, luminous, magazine-quality skin. Do NOT make it plastic, AI-filtered, or unrealistically smooth. The person must look like the best version of themselves, not a different person.
${clothingOverride}
EXPRESSION: ${expressionGuide}
FRAMING (CRITICAL — NON-NEGOTIABLE): Waist-up portrait. The ENTIRE head — including all hair from root to tip — MUST be 100% visible and fully inside the frame. NEVER crop, cut, or clip any part of the head or hair. The top of the frame must have at least 15% empty background space above the highest point of the hair. The bottom cuts at waist/hip level. The subject's ARMS ARE CROSSED in front of the body — both forearms resting across the torso, confident professional pose. Camera at medium distance — the full upper body with crossed arms fits comfortably with breathing room on all sides.
OUTPUT: RAW photographic quality. Only the face is preserved from the reference. Everything else — clothing, background, lighting — is replaced entirely as described.
[/END IDENTITY RULES]
`;

  if (themeId === 'sonhos' || themeId === 'custom') {
    console.log(`✨ Elaborando Sonho: "${customTheme}"...`);
    const expandedStyle = await expandCustomTheme(customTheme, gender);
    return `${expandedStyle}\n${baseGuard}`;
  }

  const catalogPrompt = getPrompt(themeId, subthemeId || 'classico', customTheme, photoIndex, gender);
  return `${catalogPrompt}\n${baseGuard}`;
}

// ─────────────────────────────────────────────
// 6. MARCA D'ÁGUA
// ─────────────────────────────────────────────
async function addWatermark(imageBuffer) {
  try {
    const rawImage = sharp(imageBuffer);
    const { width: w, height: h } = await rawImage.metadata();
    const watermarkSvg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <style>
          text { font-family: 'Trebuchet MS', Helvetica, sans-serif; font-size: 30px; fill: rgba(255,255,255,0.25); font-weight: 800; letter-spacing: 2px; }
        </style>
        <defs>
          <pattern id="wm" x="0" y="0" width="450" height="220" patternUnits="userSpaceOnUse" patternTransform="rotate(-35)">
            <text x="0" y="60">vyxfotos.ia</text>
            <text x="225" y="170">vyxfotos.ia</text>
          </pattern>
        </defs>
        <rect x="0" y="0" width="${w}" height="${h}" fill="url(#wm)" />
      </svg>`;
    return await rawImage
      .composite([{ input: Buffer.from(watermarkSvg), gravity: 'center' }])
      .jpeg({ quality: 85 })
      .toBuffer();
  } catch {
    return imageBuffer;
  }
}

// ─────────────────────────────────────────────
// 7. ENVIO DE E-MAIL COM FOTOS FINAIS
// ─────────────────────────────────────────────
async function sendPhotosEmail(email, orderId, images) {
  try {
    const attachments = images.map((imgBase64, i) => ({
      filename: `vyxfotos_${String(i + 1).padStart(2, '0')}.jpg`,
      content: Buffer.from(imgBase64, 'base64'),
      contentType: 'image/jpeg',
    }));

    await transporter.sendMail({
      from: `"Vyxfotos IA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `📸 Seu Ensaio Vyxfotos.IA está pronto! (Pedido ${orderId})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #000; padding: 25px; text-align: center;">
            <h1 style="color: #C9A84C; margin: 0; font-size: 28px; letter-spacing: 3px;">VYXFOTOS IA</h1>
            <p style="color: #fff; margin: 8px 0 0; font-size: 13px; letter-spacing: 2px; opacity: 0.7;">ESTÚDIO DE INTELIGÊNCIA ARTIFICIAL</p>
          </div>
          <div style="padding: 35px; background-color: #fcfcfc;">
            <h2 style="color: #111; margin-top: 0;">Seu ensaio está pronto! ✨</h2>
            <p style="font-size: 16px; line-height: 1.7; color: #444;">
              Suas <strong>${images.length} fotos profissionais</strong> foram geradas com sucesso e estão anexadas neste e-mail em alta qualidade, sem marca d'água.
            </p>
            <div style="background: #000; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
              <p style="color: #C9A84C; font-size: 22px; font-weight: bold; margin: 0;">${images.length} Fotos em Alta Qualidade</p>
              <p style="color: #aaa; font-size: 13px; margin: 6px 0 0;">Pedido: ${orderId}</p>
            </div>
            <p style="font-size: 14px; color: #777; border-top: 1px solid #eee; padding-top: 20px; margin-top: 25px;">
              Obrigado por confiar na Vyxfotos.IA para transformar sua imagem.<br>
              <br>
              <i>Atenciosamente,<br><strong>Equipe Vyxfotos.IA</strong></i>
            </p>
          </div>
        </div>
      `,
      attachments,
    });

    console.log(`📧 E-mail com ${images.length} fotos enviado para ${email}`);
  } catch (error) {
    console.error('[VYX] Erro ao enviar e-mail com fotos:', error.message);
    throw error;
  }
}

// ─────────────────────────────────────────────
// ROTA: /api/chat
// ─────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || req.ip || 'unknown';
    const now = Date.now();

    if (!chatLimits[clientIp]) chatLimits[clientIp] = { count: 0, resetTime: now + CHAT_COOLDOWN_MS };
    if (now > chatLimits[clientIp].resetTime) {
      chatLimits[clientIp] = { count: 1, resetTime: now + CHAT_COOLDOWN_MS };
    } else {
      chatLimits[clientIp].count += 1;
      if (chatLimits[clientIp].count > CHAT_LIMIT_PER_HOUR) {
        return res.status(429).json({ error: 'Limite de mensagens atingido. Aguarde um momento.' });
      }
    }

    const { history } = req.body;
    if (!history || !Array.isArray(history)) {
      return res.status(400).json({ success: false, error: 'Histórico inválido.' });
    }

    const systemInstruction = `Você é o Assistente Virtual Oficial da Vyxfotos.IA.
Sua missão é resolver dúvidas rapidamente, ser direto, educado e passar extrema confiança para converter vendas.
Seja conciso e profissional em português do Brasil. Nunca diga que é um robô do Google ou mencione o modelo Gemini.

Conhecimento Base:
- Plataforma: Vyxfotos.IA — Ensaios fotográficos de altíssima qualidade gerados por IA.
- Teste Gratuito: O usuário pode gerar até 3 amostras gratuitas na página inicial (com marca d'água).
- Bloqueio: Após 3 testes, o cliente é redirecionado para comprar um plano.
- Preços:
  * Essencial (10 fotos) por R$ 34,90
  * Performance (20 fotos, Mais Vendido) por R$ 69,90
  * Premium (30 fotos) por R$ 119,90
- Temas: Executivo, Luxo, Aniversário, Sonhos & Fantasia.
- Qualidade: As fotos finais são entregues em alta qualidade, sem marca d'água, por e-mail.
- Prazo: Entrega imediata após confirmação do pagamento via Kiwify.
- Segurança: Pagamento processado pela plataforma segura Kiwify.`;

    const formattedContents = history
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash', systemInstruction });
    const response = await model.generateContent({
      contents: formattedContents,
      generationConfig: { temperature: 0.5 }
    });

    res.json({ success: true, reply: response.response.text() });
  } catch (error) {
    console.error('[CHAT ERROR]', error.message);
    res.status(500).json({ success: false, error: 'Erro de conexão com o chat.' });
  }
});

// ─────────────────────────────────────────────
// ROTA: /api/contact
// ─────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Campos obrigatórios faltando.' });
  }

  try {
    await transporter.sendMail({
      from: `"Suporte Vyxfotos" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `[CONTATO] ${subject} - ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #C9A84C; background: #000; padding: 10px; text-align: center;">Novo Contato Recebido</h2>
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Assunto:</strong> ${subject}</p>
          <p><strong>Mensagem:</strong></p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; border-left: 4px solid #C9A84C;">${message}</div>
        </div>
      `
    });

    await transporter.sendMail({
      from: `"Vyxfotos IA" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `📸 Vyxfotos - Recebemos sua mensagem!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <div style="background-color: #000; padding: 20px; text-align: center;">
            <h1 style="color: #C9A84C; margin: 0; font-size: 24px; letter-spacing: 2px;">VYXFOTOS IA</h1>
          </div>
          <div style="padding: 30px; background-color: #fcfcfc;">
            <h2 style="color: #111;">Olá, ${name}!</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #444;">
              Recebemos sua mensagem sobre <strong>"${subject}"</strong>.
              Nossa equipe entrará em contato em breve.
            </p>
            <p style="font-size: 14px; color: #777; margin-top: 25px;">
              <i>Atenciosamente,<br><strong>Equipe Vyxfotos.IA</strong></i>
            </p>
          </div>
        </div>
      `
    });

    console.log(`[CONTACT] Mensagem de ${name} (${email})`);
    res.json({ success: true });
  } catch (error) {
    console.error('[CONTACT ERROR]', error.message);
    console.log('LEAD (ERRO SMTP):', { name, email, subject, message });
    res.status(500).json({ success: false, error: 'Erro ao enviar mensagem.' });
  }
});

// ─────────────────────────────────────────────
// ROTA: /api/parse-dreams
// ─────────────────────────────────────────────
app.post('/api/parse-dreams', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length === 0)
      return res.json({ success: false, scenarios: [] });
    const scenarios = await parseDreamsWithAI(text);
    res.json({ success: true, scenarios });
  } catch (error) {
    console.error('[VYX] Erro em /api/parse-dreams:', error.message);
    res.status(500).json({ success: false, scenarios: [req.body.text] });
  }
});

// ─────────────────────────────────────────────
// ROTA: /api/generate (preview com marca d'água)
// ─────────────────────────────────────────────
app.post('/api/generate', upload.single('selfieFile'), async (req, res) => {
  try {
    const { theme, customTheme } = req.body;
    if (!req.file) return res.status(400).json({ success: false, error: 'Selfie obrigatória.' });

    const clientIp = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();

    if (!freeTrialLimits[clientIp]) freeTrialLimits[clientIp] = { count: 0, lastAttempt: 0 };
    const userLimit = freeTrialLimits[clientIp];
    const diffMinutes = (now - userLimit.lastAttempt) / (1000 * 60);

    if (userLimit.count >= LIMIT_ATTEMPTS && diffMinutes < COOLDOWN_MINUTES) {
      const waitRemaining = Math.ceil(COOLDOWN_MINUTES - diffMinutes);
      return res.status(429).json({
        success: false,
        error: `Limite de ${LIMIT_ATTEMPTS} testes gratuitos atingido.`,
        detail: `Aguarde ${waitRemaining} minutos ou adquira um pacote para gerações ilimitadas.`
      });
    }

    if (diffMinutes >= COOLDOWN_MINUTES) userLimit.count = 0;
    userLimit.count += 1;
    userLimit.lastAttempt = now;

    const imageBase64 = req.file.buffer.toString('base64');
    const gender = await detectGender(imageBase64);

    const defaultSubtheme = {
      executivo:   'classico',
      luxo:        'classico',
      aniversario: 'vip',
      sonhos:      'fantasia',
    };
    const subtheme = defaultSubtheme[theme] || 'classico';

    const prompt = await buildPrompt(theme, subtheme, customTheme, gender, 0);
    console.log(`[VYX] Gerando preview | tema: ${theme} | subtema: ${subtheme} | gênero: ${gender} | IP: ${clientIp} (${userLimit.count}/${LIMIT_ATTEMPTS})`);

    const generatedImageBase64 = await generateImage(imageBase64, prompt);
    if (!generatedImageBase64) throw new Error('API não retornou imagem.');

    const watermarkedBuffer = await addWatermark(Buffer.from(generatedImageBase64, 'base64'));
    const orderId = 'Vyx_' + Math.floor(Math.random() * 999999);

    const bkpDir = path.join(__dirname, 'temp_orders');
    if (!fs.existsSync(bkpDir)) fs.mkdirSync(bkpDir);

    fs.writeFileSync(path.join(bkpDir, `${orderId}.json`), JSON.stringify({
      orderId, gender, theme, customTheme, imageBase64
    }));

    console.log(`[VYX] Pedido ${orderId} salvo | gênero: ${gender}`);

    res.json({
      success: true,
      data: {
        output_url: `data:image/jpeg;base64,${watermarkedBuffer.toString('base64')}`,
        orderId,
        message: 'Gerado com Qualidade Fotográfica!'
      }
    });

  } catch (error) {
    console.error('[VYX] Erro em /api/generate:', error.message);
    res.status(500).json({ success: false, error: 'Falha na geração da imagem.' });
  }
});

// ─────────────────────────────────────────────
// GERAÇÃO EM LOTE (pós-pagamento via webhook)
// ─────────────────────────────────────────────
async function processApprovedOrder(email, orderId, distributionVars) {
  console.log(`\n${'='.repeat(54)}`);
  console.log(`[PAID] INICIANDO FÁBRICA DE RETRATOS`);
  console.log(`  Cliente : ${email}`);
  console.log(`  Pedido  : ${orderId}`);
  console.log(`  Fotos   :`, distributionVars);

  try {
    const bkpPath = path.join(__dirname, 'temp_orders', `${orderId}.json`);
    if (!fs.existsSync(bkpPath)) {
      console.error(`❌ Dados do pedido ${orderId} não encontrados.`);
      return;
    }

    const { theme, customTheme, gender, imageBase64 } = JSON.parse(fs.readFileSync(bkpPath, 'utf8'));
    const finalImages = [];
    let globalPhotoIndex = 0;

    for (const [subthemeId, entry] of Object.entries(distributionVars)) {
      const { quantity, dreamText } = entry;
      for (let i = 0; i < quantity; i++) {
        console.log(`[GERANDO] Foto ${globalPhotoIndex + 1} | subtema: ${subthemeId} | índice: ${i}`);

        const promptCustomTheme = theme === 'sonhos' ? dreamText : customTheme;
        const prompt = await buildPrompt(theme, subthemeId, promptCustomTheme, gender, i);
        const imgData = await generateImage(imageBase64, prompt);

        if (imgData) {
          finalImages.push(imgData);
          console.log(`✅ Foto ${globalPhotoIndex + 1} concluída.`);
        } else {
          console.warn(`⚠️ Foto ${globalPhotoIndex + 1} não gerada.`);
        }
        globalPhotoIndex++;
      }
    }

    console.log(`🎯 ENSAIO CONCLUÍDO! ${finalImages.length} fotos geradas.`);

    if (finalImages.length > 0 && email) {
      await sendPhotosEmail(email, orderId, finalImages);
    }

    fs.unlinkSync(bkpPath);
    console.log(`${'='.repeat(54)}\n`);

  } catch (err) {
    console.error('[VYX] Erro fatal no lote:', err.message);
  }
}

// ─────────────────────────────────────────────
// WEBHOOK KIWIFY
// SRC format: "Vyx_123_vars_classico:2,moderno:3"
// SRC sonhos: "Vyx_123_vars_sonho_0[policial]:2"
// ─────────────────────────────────────────────
app.post('/api/webhook/kiwify', (req, res) => {
  res.status(200).send('OK');

  const payload = req.body;
  if (payload.order_status !== 'paid') return;

  const srcRaw = payload.TrackingParameters?.src || '';
  let orderId = '';
  let distributionVars = {};

  if (srcRaw.includes('_vars_')) {
    const [idPart, varsPart] = srcRaw.split('_vars_');
    orderId = idPart;

    varsPart.split(',').forEach(pair => {
      const dreamMatch = pair.match(/^(.+?)\[(.+?)\]:(\d+)$/);
      if (dreamMatch) {
        const [, subId, encodedText, qty] = dreamMatch;
        distributionVars[subId] = {
          quantity: parseInt(qty) || 0,
          dreamText: decodeURIComponent(encodedText)
        };
      } else {
        const colonIdx = pair.lastIndexOf(':');
        if (colonIdx > 0) {
          const subId = pair.substring(0, colonIdx);
          const qty = parseInt(pair.substring(colonIdx + 1)) || 0;
          distributionVars[subId] = { quantity: qty, dreamText: null };
        }
      }
    });
  } else {
    orderId = srcRaw;
  }

  if (orderId) {
    processApprovedOrder(payload.Customer?.email, orderId, distributionVars);
  } else {
    console.log(`⚠️ Pagamento aprovado de ${payload.Customer?.email} sem OrderID no SRC.`);
  }
});

// ─────────────────────────────────────────────
// INSTAGRAM BOT (Webhook + Polling)
// ─────────────────────────────────────────────
const SalesAgentService = require('./services/salesAgent');
const MetaMessageService = require('./services/metaMessageService');
const { startPolling } = require('./services/igPoller');

// Verificação do webhook pela Meta (handshake)
app.get('/api/webhooks/instagram', (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'vyx_secret_token_2026';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[IG] Webhook verificado com sucesso!');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Recebimento de mensagens em tempo real via webhook
app.post('/api/webhooks/instagram', async (req, res) => {
  const body = req.body;
  if (body.object === 'instagram' || body.object === 'page') {
    res.status(200).send('EVENT_RECEIVED');
    for (const entry of body.entry || []) {
      let senderId = null;
      let messageText = null;

      if (entry.messaging?.length > 0) {
        const event = entry.messaging[0];
        if (event.message && !event.message.is_echo && event.message.text) {
          senderId = event.sender.id;
          messageText = event.message.text;
        }
      }
      if (!senderId && entry.changes?.length > 0) {
        const val = entry.changes[0].value;
        if (val?.message?.text && !val.message.is_echo) {
          senderId = val.sender.id;
          messageText = val.message.text;
        }
      }

      if (senderId && messageText) {
        console.log(`[IG] DM de ${senderId}: "${messageText}"`);
        try {
          const reply = await SalesAgentService.generateResponse(messageText);
          await MetaMessageService.sendTextMessage(senderId, reply);
          console.log(`[IG] Resposta enviada para ${senderId}`);
        } catch (err) {
          console.error('[IG] Erro ao responder:', err.message);
        }
      }
    }
  } else {
    res.sendStatus(404);
  }
});

// ─────────────────────────────────────────────
// HEALTHCHECK
// ─────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).send('Vyxfotos.IA Backend Operacional');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Vyxfotos.IA rodando na porta ${PORT}`);
  startPolling();
});
