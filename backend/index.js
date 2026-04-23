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
const admin = require('firebase-admin');
const { google } = require('googleapis');

dotenv.config();

// ─────────────────────────────────────────────
// FIREBASE ADMIN (Firestore para leads)
// ─────────────────────────────────────────────
let firestoreDb = null;
try {
  let credential;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    // Produção (Render): credencial vem de variável de ambiente
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    credential = admin.credential.cert(serviceAccount);
  } else {
    // Local: lê do arquivo
    const serviceAccount = require('./firebase-admin-key.json');
    credential = admin.credential.cert(serviceAccount);
  }
  admin.initializeApp({ credential, projectId: 'vyxfotos' });
  firestoreDb = admin.firestore();
  console.log('[Firebase] Admin inicializado com sucesso.');
} catch (e) {
  console.warn('[Firebase] Admin não inicializado:', e.message);
}

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
const freeTrialLimits = {};       // por IP (fallback)
const freeTrialLimitsByUID = {};  // por Firebase UID (primário)
const chatLimits = {};
const CHAT_LIMIT_PER_HOUR = 20;
const CHAT_COOLDOWN_MS = 60 * 60 * 1000;

// Cliente Google Sheets (usa mesma service account do Firebase Admin)
function getSheetsClient() {
  try {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const key = raw ? JSON.parse(raw) : require('./firebase-admin-key.json');
    const auth = new google.auth.GoogleAuth({
      credentials: key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    return google.sheets({ version: 'v4', auth });
  } catch (e) {
    console.warn('[Sheets] Erro ao criar cliente:', e.message);
    return null;
  }
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID || '1qL9oHPvK7mZ0XHp0EFwXE95Fk3uYmRqn8kTzcqPW2E4';
const leadsRegistrados = new Set(); // evita duplicar na mesma sessão do servidor

// Cria aba de Dashboard profissional
const MESES_NOMES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

// Cria aba do mês se não existir e retorna o sheetId
async function getOrCreateMonthTab(sheets, monthIndex) {
  const tabName = MESES_NOMES[monthIndex];
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existing = meta.data.sheets.find(s => s.properties.title === tabName);
  if (existing) return { sheetId: existing.properties.sheetId, tabName };

  const addRes = await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests: [{ addSheet: { properties: { title: tabName } } }] },
  });
  const sheetId = addRes.data.replies[0].addSheet.properties.sheetId;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID, range: `'${tabName}'!A1:F1`, valueInputOption: 'RAW',
    requestBody: { values: [['📧 Email', '👤 Nome', '📅 Data & Hora', '🔖 Status', '🌐 Origem', '🆔 UID']] },
  });
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests: [
      { repeatCell: { range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
        cell: { userEnteredFormat: {
          backgroundColor: { red: 0.11, green: 0.37, blue: 0.22 },
          textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 },
          horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE',
        }}, fields: 'userEnteredFormat' }},
      { updateSheetProperties: { properties: { sheetId, gridProperties: { frozenRowCount: 1 } }, fields: 'gridProperties.frozenRowCount' }},
      { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 260 }, fields: 'pixelSize' }},
      { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 180 }, fields: 'pixelSize' }},
      { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 }, properties: { pixelSize: 175 }, fields: 'pixelSize' }},
      { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 3, endIndex: 4 }, properties: { pixelSize: 120 }, fields: 'pixelSize' }},
      { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 4, endIndex: 5 }, properties: { pixelSize: 100 }, fields: 'pixelSize' }},
      { updateDimensionProperties: { range: { sheetId, dimension: 'COLUMNS', startIndex: 5, endIndex: 6 }, properties: { pixelSize: 260 }, fields: 'pixelSize' }},
      { updateDimensionProperties: { range: { sheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 40 }, fields: 'pixelSize' }},
    ]},
  });
  return { sheetId, tabName };
}

async function createDashboardSheet(sheets) {
  try {
    const addSheetRes = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: '📊 Dashboard', index: 0 } } }] },
    });
    const dashSheetId = addSheetRes.data.replies[0].addSheet.properties.sheetId;

    const anoAtual = new Date().getFullYear();
    const rows = [
      ['📊 DASHBOARD — Vyxfotos IA', '', ''],
      ['', '', ''],
      ['📅 Mês', `📈 Leads ${anoAtual}`, ''],
    ];
    MESES_NOMES.forEach(mes => {
      // Conta linhas na aba do mês (A2:A = ignora cabeçalho). SEERRO evita erro se aba não existe ainda
      rows.push([mes, `=SEERRO(CONT.VALORES(${mes}!A2:A);0)`, '']);
    });
    rows.push(['', '', '']);
    rows.push(['🏆 TOTAL GERAL', `=SOMA(B4:B15)`, '']);
    rows.push(['📆 Este mês', `=ÍNDICE(B4:B15;MÊS(HOJE()))`, '']);

    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `'📊 Dashboard'!A1:C${rows.length}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: rows },
    });

    // Formatação do dashboard
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: [
        // Título principal — dark green, large, bold
        { repeatCell: {
          range: { sheetId: dashSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 3 },
          cell: { userEnteredFormat: {
            backgroundColor: { red: 0.07, green: 0.27, blue: 0.16 },
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 16 },
            horizontalAlignment: 'CENTER', verticalAlignment: 'MIDDLE',
          }},
          fields: 'userEnteredFormat',
        }},
        // Merge células do título
        { mergeCells: { range: { sheetId: dashSheetId, startRowIndex: 0, endRowIndex: 1, startColumnIndex: 0, endColumnIndex: 3 }, mergeType: 'MERGE_ALL' }},
        // Cabeçalho dos meses — verde médio
        { repeatCell: {
          range: { sheetId: dashSheetId, startRowIndex: 2, endRowIndex: 3, startColumnIndex: 0, endColumnIndex: 2 },
          cell: { userEnteredFormat: {
            backgroundColor: { red: 0.11, green: 0.37, blue: 0.22 },
            textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true, fontSize: 11 },
            horizontalAlignment: 'CENTER',
          }},
          fields: 'userEnteredFormat',
        }},
        // Linhas dos meses — alternadas
        ...Array.from({ length: 12 }, (_, i) => ({
          repeatCell: {
            range: { sheetId: dashSheetId, startRowIndex: 3 + i, endRowIndex: 4 + i, startColumnIndex: 0, endColumnIndex: 2 },
            cell: { userEnteredFormat: {
              backgroundColor: i % 2 === 0
                ? { red: 0.88, green: 0.96, blue: 0.90 }
                : { red: 1, green: 1, blue: 1 },
              textFormat: { foregroundColor: { red: 0.13, green: 0.13, blue: 0.13 }, fontSize: 10 },
              horizontalAlignment: i === 0 ? 'LEFT' : 'LEFT',
            }},
            fields: 'userEnteredFormat',
          },
        })),
        // Linhas de total — dourado
        { repeatCell: {
          range: { sheetId: dashSheetId, startRowIndex: 16, endRowIndex: 18, startColumnIndex: 0, endColumnIndex: 2 },
          cell: { userEnteredFormat: {
            backgroundColor: { red: 1, green: 0.84, blue: 0.0 },
            textFormat: { foregroundColor: { red: 0.1, green: 0.1, blue: 0.1 }, bold: true, fontSize: 11 },
          }},
          fields: 'userEnteredFormat',
        }},
        // Larguras das colunas do dashboard
        { updateDimensionProperties: { range: { sheetId: dashSheetId, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 180 }, fields: 'pixelSize' }},
        { updateDimensionProperties: { range: { sheetId: dashSheetId, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 }, properties: { pixelSize: 140 }, fields: 'pixelSize' }},
        { updateDimensionProperties: { range: { sheetId: dashSheetId, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 }, properties: { pixelSize: 100 }, fields: 'pixelSize' }},
        // Altura do título
        { updateDimensionProperties: { range: { sheetId: dashSheetId, dimension: 'ROWS', startIndex: 0, endIndex: 1 }, properties: { pixelSize: 52 }, fields: 'pixelSize' }},
        // Congela linha de cabeçalho
        { updateSheetProperties: { properties: { sheetId: dashSheetId, gridProperties: { frozenRowCount: 3 } }, fields: 'gridProperties.frozenRowCount' }},
      ]},
    });

    // Adiciona gráfico de barras
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: [{
        addChart: {
          chart: {
            spec: {
              title: `Leads por Mês — ${anoAtual}`,
              basicChart: {
                chartType: 'COLUMN',
                legendPosition: 'BOTTOM_LEGEND',
                axis: [
                  { position: 'BOTTOM_AXIS', title: 'Mês' },
                  { position: 'LEFT_AXIS', title: 'Quantidade de Leads' },
                ],
                domains: [{ domain: { sourceRange: { sources: [{ sheetId: dashSheetId, startRowIndex: 3, endRowIndex: 15, startColumnIndex: 0, endColumnIndex: 1 }] } } }],
                series: [{ series: { sourceRange: { sources: [{ sheetId: dashSheetId, startRowIndex: 3, endRowIndex: 15, startColumnIndex: 1, endColumnIndex: 2 }] } }, targetAxis: 'LEFT_AXIS' }],
                headerCount: 0,
              },
            },
            position: {
              overlayPosition: {
                anchorCell: { sheetId: dashSheetId, rowIndex: 2, columnIndex: 3 },
                offsetXPixels: 0, offsetYPixels: 0,
                widthPixels: 520, heightPixels: 340,
              },
            },
          },
        },
      }]},
    });

    console.log('[Sheets] ✅ Dashboard criado com sucesso.');
  } catch (e) {
    console.warn('[Sheets] Erro ao criar dashboard:', e.message);
  }
}

// Pré-cria todas as 12 abas mensais com cabeçalho
async function createMonthlyTabs(sheets) {
  for (let i = 0; i < 12; i++) {
    await getOrCreateMonthTab(sheets, i);
  }
}

// Salva lead no Firestore + Google Sheets
async function saveLead({ uid, email, name, photoURL }) {
  if (!uid || !email) return;

  // Firestore
  if (firestoreDb) {
    try {
      const ref = firestoreDb.collection('leads').doc(uid);
      const existing = await ref.get();
      const now = admin.firestore.FieldValue.serverTimestamp();
      if (!existing.exists) {
        await ref.set({ uid, email, name: name || '', photoURL: photoURL || '', createdAt: now, attempts: 1, lastAttempt: now });
      } else {
        await ref.update({ attempts: admin.firestore.FieldValue.increment(1), lastAttempt: now });
      }
    } catch (e) {
      console.warn('[Firebase] Erro ao salvar lead:', e.message);
    }
  }

    // Google Sheets — só adiciona se for a primeira vez (verifica flag no Firestore)
  if (leadsRegistrados.has(uid)) {
    console.log(`[Sheets] UID já registrado nesta sessão: ${uid}`);
    return;
  }

  try {
    const sheets = getSheetsClient();
    if (!sheets) {
      console.warn('[Sheets] getSheetsClient() retornou null — credenciais inválidas?');
      return;
    }

    leadsRegistrados.add(uid);

    const dataBR = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const monthIndex = new Date().getMonth(); // 0-11

    // Verifica se o Dashboard já existe; se não, cria tudo pela primeira vez
    const metaCheck = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const hasDashboard = metaCheck.data.sheets.some(s => s.properties.title === '📊 Dashboard');
    if (!hasDashboard) {
      await createDashboardSheet(sheets);
      await createMonthlyTabs(sheets);
    }

    // Garante que a aba do mês existe e obtém o sheetId
    const { sheetId: monthSheetId, tabName } = await getOrCreateMonthTab(sheets, monthIndex);

    // Adiciona o lead na aba do mês correto
    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID, range: `'${tabName}'!A:F`,
      valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS',
      requestBody: { values: [[email, name || '—', dataBR, '🟢 Novo Lead', 'Google', uid]] },
    });

    // Formata a linha inserida com cores alternadas
    const updatedRange = appendRes.data.updates?.updatedRange || '';
    const rowMatch = updatedRange.match(/(\d+)$/);
    if (rowMatch) {
      const rowIndex = parseInt(rowMatch[1]) - 1;
      const isEven = rowIndex % 2 === 0;
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { requests: [{ repeatCell: {
          range: { sheetId: monthSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1 },
          cell: { userEnteredFormat: {
            backgroundColor: isEven ? { red: 0.88, green: 0.96, blue: 0.90 } : { red: 1, green: 1, blue: 1 },
            textFormat: { foregroundColor: { red: 0.13, green: 0.13, blue: 0.13 }, fontSize: 10 },
          }},
          fields: 'userEnteredFormat(backgroundColor,textFormat)',
        }}]},
      });
    }

    if (firestoreDb) {
      await firestoreDb.collection('leads').doc(uid).set({ addedToSheets: true }, { merge: true });
    }

    console.log(`[Sheets] ✅ Lead adicionado em ${tabName}: ${email}`);
  } catch (e) {
    console.warn('[Sheets] Erro ao salvar lead:', e.message, e.stack?.split('\n')[1]);
  }
}

// ─────────────────────────────────────────────
// ATUALIZA STATUS DO LEAD PARA CLIENTE NA PLANILHA
// ─────────────────────────────────────────────
async function upgradeLeadToCliente(email) {
  if (!email) return;
  try {
    const sheets = getSheetsClient();
    if (!sheets) return;

    // Busca metadados da planilha para listar todas as abas de meses
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const monthTabs = meta.data.sheets.filter(s =>
      MESES_NOMES.includes(s.properties.title)
    );

    for (const tab of monthTabs) {
      const tabName = tab.properties.title;
      const sheetId = tab.properties.sheetId;

      // Lê coluna A (emails) da aba
      const readRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID,
        range: `'${tabName}'!A:F`,
      });

      const rows = readRes.data.values || [];
      for (let i = 1; i < rows.length; i++) { // i=0 é header
        if ((rows[i][0] || '').toLowerCase().trim() === email.toLowerCase().trim()) {
          const rowIndex = i; // 0-based já (header é linha 0)

          // Atualiza coluna D (status) para Cliente
          await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: `'${tabName}'!D${rowIndex + 1}`,
            valueInputOption: 'USER_ENTERED',
            requestBody: { values: [['🏆 Cliente']] },
          });

          // Aplica formatação dourada na linha inteira
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SHEET_ID,
            requestBody: { requests: [{ repeatCell: {
              range: { sheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1 },
              cell: { userEnteredFormat: {
                backgroundColor: { red: 1.0, green: 0.87, blue: 0.27 }, // dourado
                textFormat: {
                  foregroundColor: { red: 0.15, green: 0.10, blue: 0.0 },
                  fontSize: 10,
                  bold: true,
                },
              }},
              fields: 'userEnteredFormat(backgroundColor,textFormat)',
            }}]},
          });

          console.log(`[Sheets] ⭐ Lead promovido a Cliente: ${email} (${tabName}, linha ${rowIndex + 1})`);

          // Atualiza Firestore também
          if (firestoreDb) {
            const snap = await firestoreDb.collection('leads').where('email', '==', email).limit(1).get();
            if (!snap.empty) {
              await snap.docs[0].ref.update({ status: 'cliente', upgradedAt: admin.firestore.FieldValue.serverTimestamp() });
            }
          }

          return; // Encontrou e atualizou — sai
        }
      }
    }

    // Email não estava na planilha — pessoa comprou sem ter feito login antes
    // Adiciona diretamente como Cliente no mês atual para não perder a venda
    console.warn(`[Sheets] ⚠️ COMPRA SEM LEAD PRÉVIO — email não encontrado: ${email}`);
    console.warn(`[Sheets] ⚠️ Possível causa: email diferente do login Google. Adicionando como Cliente direto.`);

    try {
      const monthIndex = new Date().getMonth();
      const { sheetId: monthSheetId, tabName } = await getOrCreateMonthTab(sheets, monthIndex);
      const dataBR = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

      const appendRes = await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: `'${tabName}'!A:F`,
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [[email, '—', dataBR, '🏆 Cliente', 'Kiwify (sem login)', '—']] },
      });

      const updatedRange = appendRes.data.updates?.updatedRange || '';
      const rowMatch = updatedRange.match(/(\d+)$/);
      if (rowMatch) {
        const rowIndex = parseInt(rowMatch[1]) - 1;
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: { requests: [{ repeatCell: {
            range: { sheetId: monthSheetId, startRowIndex: rowIndex, endRowIndex: rowIndex + 1 },
            cell: { userEnteredFormat: {
              backgroundColor: { red: 1.0, green: 0.87, blue: 0.27 },
              textFormat: { foregroundColor: { red: 0.15, green: 0.10, blue: 0.0 }, fontSize: 10, bold: true },
            }},
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          }}]},
        });
      }

      console.log(`[Sheets] ✅ Cliente sem login adicionado em ${tabName}: ${email}`);
    } catch (innerErr) {
      console.error(`[Sheets] ❌ Falha ao adicionar cliente sem login: ${email} — ${innerErr.message}`);
    }
  } catch (e) {
    console.warn('[Sheets] Erro ao promover lead:', e.message);
  }
}

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

// 10 tipos de shot que garantem fotos completamente diferentes entre si numa mesma série
const DREAM_SHOT_TYPES = [
  // 0 — O Momento Épico: a cena mais emocionante e icônica do sonho
  {
    label: 'THE EPIC MOMENT',
    directive: `SHOT TYPE: THE EPIC MOMENT — This is the single most thrilling, peak-emotion scene of this entire dream. For a footballer: the goal celebration sprinting to the corner flag, arms wide, stadium exploding. For an astronaut: the first step onto another planet. For a princess: the grand entrance down the staircase. Capture the absolute PEAK of this dream. Wide or medium shot. Maximum emotional impact.`,
  },
  // 1 — Close Emocional: rosto em destaque, emoção pura no olhar
  {
    label: 'EMOTIONAL CLOSE-UP',
    directive: `SHOT TYPE: EMOTIONAL CLOSE-UP — An intimate portrait capturing pure, raw emotion on the subject's face in the context of this dream. For a footballer: tears of joy right after scoring, face flushed, stadium lights reflecting in the eyes. For a luxury scenario: serene confidence, the look of someone who has arrived. Tight close-up or bust shot. The environment is visible but blurred — the FACE is everything here.`,
  },
  // 2 — Editorial/Pose Icônica: composição de capa de revista, confiança total
  {
    label: 'EDITORIAL / ICONIC POSE',
    directive: `SHOT TYPE: EDITORIAL / ICONIC POSE — A strong, composed, magazine-cover-worthy pose. The subject owns the frame completely. For a footballer: standing tall at the center of the pitch, ball under one foot, jersey perfectly fitted, stadium empty and majestic behind them. For a luxury scenario: leaning on the car with absolute ease. Think Sports Illustrated cover or Vogue editorial. Full-body or three-quarter. Confident, direct gaze into camera.`,
  },
  // 3 — Ação em Movimento: capturado em plena ação, pose dinâmica
  {
    label: 'ACTION IN MOTION',
    directive: `SHOT TYPE: ACTION IN MOTION — The subject is frozen mid-action, full of energy and movement. For a footballer: sprinting with the ball at full speed, leaning into a turn, or striking a shot — boot connecting with ball, muscles engaged, hair and kit in motion. For a dancer: mid-spin. For a pilot: hands on controls in turbulence. Freeze-frame of peak physical action. Dynamic angle, motion blur in background, sharp on subject.`,
  },
  // 4 — Escala Épica: sujeito no ambiente grandioso, sensação de pertencimento
  {
    label: 'EPIC SCALE & ENVIRONMENT',
    directive: `SHOT TYPE: EPIC SCALE & ENVIRONMENT — Pull back to reveal the full grandeur of the dream world around the subject. The subject is part of something MASSIVE. For a footballer: standing at the center circle of Camp Nou, 90,000 fans roaring in the background, the sheer scale of the stadium dwarfing everything. For a luxury dream: the full panorama of Paris at golden hour. Wide establishing shot. The environment is the star — the subject is perfectly placed within it.`,
  },
  // 5 — Preparo/Concentração: antes da ação, foco total, tensão dramática
  {
    label: 'PREPARATION & FOCUS',
    directive: `SHOT TYPE: PREPARATION & FOCUS — The calm before the storm. The subject is in a state of total focus and preparation before the big moment. For a footballer: in the tunnel about to walk out, eyes locked forward, fists clenched, stadium noise building. For an astronaut: helmet in hand, looking at the rocket. For a musician: backstage before the concert. Medium or close shot. Dramatic shadows. Pure concentration.`,
  },
  // 6 — Conquista/Vitória: o momento após o sucesso, celebração ou orgulho
  {
    label: 'VICTORY & TRIUMPH',
    directive: `SHOT TYPE: VICTORY & TRIUMPH — The aftermath of success. The subject has won, achieved, arrived. For a footballer: lifting a trophy, champagne raining down, teammates celebrating around them. For a businessperson: signing the big deal. For a traveler: standing at the summit. The expression is pure, earned joy — not just happiness but the specific feeling of having fought for something and won it.`,
  },
  // 7 — Lifestyle Autêntico: sujeito à vontade, humanizado, no ambiente
  {
    label: 'AUTHENTIC LIFESTYLE',
    directive: `SHOT TYPE: AUTHENTIC LIFESTYLE — A relaxed, human, candid-feeling moment. The subject is completely at ease in their dream, not performing for the camera. For a footballer: sitting on the grass after training, jersey slightly disheveled, laughing at something. For a luxury scenario: lounging by the pool of the penthouse suite, drink in hand, city below. Feels like a private moment caught on camera. Natural, warm, real.`,
  },
  // 8 — Maestria/Técnica: demonstrando habilidade, detalhe da execução perfeita
  {
    label: 'SKILL & MASTERY',
    directive: `SHOT TYPE: SKILL & MASTERY — A shot that highlights the subject's mastery of their craft within this dream. For a footballer: perfect technique — a flawless first touch, a delicate chip, the precision of a free kick setup. For a chef: plating a dish with surgical precision. For a musician: fingers on the instrument. Focus on the detail of the action — hands, feet, the tool of the trade. Close or medium shot emphasizing craft and expertise.`,
  },
  // 9 — Drama Cinematográfico: ângulo inusitado, iluminação épica, arte pura
  {
    label: 'CINEMATIC DRAMA',
    directive: `SHOT TYPE: CINEMATIC DRAMA — A purely cinematic, visually striking composition that feels like a movie poster or a scene from an epic film. Unexpected angle — low ground shot looking up at the subject against the sky, silhouette against stadium lights, dramatic fog, rim lighting only, extreme close-up of a single detail. For a footballer: silhouette against floodlights, fog rolling across the pitch, ball at feet. Pure visual poetry. This shot is about MOOD and ATMOSPHERE above all.`,
  },
];

async function expandCustomTheme(rawTheme, gender, photoIndex = 0) {
  const shotType = DREAM_SHOT_TYPES[photoIndex % DREAM_SHOT_TYPES.length];
  try {
    const genderLabel = gender === 'feminino' ? 'female' : 'male';
    const aiPrompt = `You are the creative director of the world's most prestigious AI portrait studio. You are shooting a ${genderLabel} client in a series of photos. Each photo in the series must be COMPLETELY DIFFERENT — a unique moment, angle, and mood within the same dream scenario.

CLIENT DREAM SCENARIO: "${rawTheme}"

THIS IS PHOTO #${photoIndex + 1} IN THE SERIES.
SHOT TYPE FOR THIS PHOTO: ${shotType.label}

${shotType.directive}

YOUR TASK — Write the scene for THIS specific shot type (4 to 6 sentences in English):
Describe ONLY these four elements, all in service of the shot type above:
1. WARDROBE: Exact outfit, fabric, colors, fit, accessories — authentic and specific to the scenario (real team jersey and number, actual car model, real location details, etc.).
2. SETTING: The environment — exact location, time of day, crowd, atmosphere, key props. Make it feel REAL and IMMERSIVE. Stay faithful to what the client described.
3. LIGHTING: The lighting that best serves THIS specific shot type and moment.
4. CAMERA: Angle, lens, framing, depth of field — chosen specifically to serve this shot type.

ABSOLUTE RULES:
- Stay 100% faithful to the client's dream — their words are sacred. Never replace their concept.
- NEVER mention face, eyes, skin, smile, expression, or identity — handled separately.
- This photo must feel DISTINCT from every other photo in the series — different moment, different energy, different framing.
- Return ONLY the final scene description. No labels, no explanations, no shot type header in the output.`;

    const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const response = await model.generateContent(aiPrompt);
    return response.response.text().trim();
  } catch (error) {
    console.error('[VYX] Erro no elaborador de sonhos:', error.message);
    return `Ultra-high quality cinematic portrait. Shot type: ${shotType.label}. The subject is in the following dream scenario: ${rawTheme}. Professional photography with dramatic cinematic lighting, detailed wardrobe matching the scene, and immersive background fully realized. Photorealistic, 8K.`;
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
async function buildPrompt(themeId, subthemeId, customTheme, gender, photoIndex = 0, isPreview = false) {
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
    sonhos:      `genuine joy and presence, as if living inside their biggest dream`,
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
FACE (non-negotiable): Keep 100% identical — same eyes, same nose, same mouth, same eyebrows, same skin tone, same hair color and texture, ${genderLine} FACE STRUCTURE (absolute): Preserve EXACTLY the facial bone structure from the reference — same jawline width, same cheekbone prominence, same face shape (round, square, oval, etc.). Do NOT make the face thinner, wider, more angular, or rounder than in the reference photo. The face weight and proportions must match the reference precisely. If the person has a round face in the reference, keep it round. If they have a slim face, keep it slim. Zero alterations to facial geometry.
SKIN RETOUCHING (professional studio standard): Apply high-end retouching as a professional photographer would in post-production: (1) completely eliminate dark circles and puffiness under the eyes while preserving natural eye depth; (2) remove all visible blemishes, acne spots, blackheads, and redness; (3) smooth uneven skin texture and enlarged pores; (4) correct any skin discoloration or blotchy patches; (5) soften fine lines without erasing natural facial structure. The result must look like a professional studio session with expert retouching — healthy, luminous, magazine-quality skin. Do NOT make it plastic, AI-filtered, or unrealistically smooth. The person must look like the best version of themselves, not a different person.
${clothingOverride}
EXPRESSION: ${expressionGuide}
FRAMING (ABSOLUTE RULE — ZERO EXCEPTIONS): Wide waist-up portrait shot. The camera MUST be zoomed out enough so the top of the skull and every strand of hair has at least 30% of empty background space above it before reaching the top edge of the image. Imagine placing a closed fist of empty space above the top of the head — that much room. NEVER let the head touch or approach the top edge. Bottom frame cuts at hip level. ${isPreview ? 'Arms crossed on chest — confident signature pose.' : 'Natural confident pose appropriate to the scene — standing, hands relaxed, or as fits the setting.'} When in doubt, zoom out further.
OUTPUT: RAW photographic quality. Only the face is preserved from the reference. Everything else — clothing, background, lighting — is replaced entirely as described.
[/END IDENTITY RULES]
`;

  if (themeId === 'sonhos' || themeId === 'custom') {
    console.log(`✨ Elaborando Sonho [pose ${photoIndex % 5}]: "${customTheme}"...`);
    const expandedStyle = await expandCustomTheme(customTheme, gender, photoIndex);
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
    const { theme, customTheme, uid, userEmail, userName, userPhoto } = req.body;
    if (!req.file) return res.status(400).json({ success: false, error: 'Selfie obrigatória.' });

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.ip || 'unknown';
    const now = Date.now();

    // Rate limit: UID tem prioridade sobre IP
    const limitKey = uid || clientIp;
    const limitMap = uid ? freeTrialLimitsByUID : freeTrialLimits;

    if (!limitMap[limitKey]) limitMap[limitKey] = { count: 0, lastAttempt: 0 };
    const userLimit = limitMap[limitKey];
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

    // Salva/atualiza lead no Firestore
    if (uid) saveLead({ uid, email: userEmail, name: userName, photoURL: userPhoto });

    const imageBase64 = req.file.buffer.toString('base64');
    const gender = await detectGender(imageBase64);

    const defaultSubtheme = {
      executivo:   'classico',
      luxo:        'classico',
      aniversario: 'vip',
      sonhos:      'fantasia',
    };
    const subtheme = defaultSubtheme[theme] || 'classico';

    const prompt = await buildPrompt(theme, subtheme, customTheme, gender, 0, true);
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

  const customerEmail = payload.Customer?.email;

  // Promove o lead para Cliente na planilha imediatamente ao pagamento
  if (customerEmail) {
    upgradeLeadToCliente(customerEmail);
  }

  if (orderId) {
    processApprovedOrder(customerEmail, orderId, distributionVars);
  } else {
    console.log(`⚠️ Pagamento aprovado de ${customerEmail} sem OrderID no SRC.`);
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
// ROTA: /api/register-lead (chamada no login)
// ─────────────────────────────────────────────
app.post('/api/register-lead', async (req, res) => {
  const { uid, email, name, photoURL } = req.body;
  console.log(`[Lead] Recebido: ${email} | uid: ${uid}`);
  if (!uid || !email) return res.status(400).json({ success: false });
  await saveLead({ uid, email, name, photoURL });
  res.json({ success: true });
});

// ─────────────────────────────────────────────
// ADMIN: Exportar leads como CSV
// GET /api/admin/leads?secret=SUA_SENHA
// ─────────────────────────────────────────────
app.get('/api/admin/leads', async (req, res) => {
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'vyxadmin2026';
  if (req.query.secret !== ADMIN_SECRET) return res.status(401).send('Não autorizado.');
  if (!firestoreDb) return res.status(500).send('Firestore não disponível.');

  try {
    const snapshot = await firestoreDb.collection('leads').orderBy('createdAt', 'desc').get();
    const rows = [['UID', 'Email', 'Nome', 'Tentativas', 'Cadastrado em']];
    snapshot.forEach(doc => {
      const d = doc.data();
      const date = d.createdAt?.toDate ? d.createdAt.toDate().toISOString().split('T')[0] : '';
      rows.push([d.uid || '', d.email || '', d.name || '', d.attempts || 1, date]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="leads_vyxfotos.csv"');
    res.send('﻿' + csv); // BOM para Excel abrir com acentos corretos
  } catch (e) {
    res.status(500).send('Erro ao buscar leads: ' + e.message);
  }
});

// GET /api/admin/rebuild-dashboard?secret=SUA_SENHA — migra leads para abas mensais e recria tudo
app.get('/api/admin/rebuild-dashboard', async (req, res) => {
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'vyxadmin2026';
  if (req.query.secret !== ADMIN_SECRET) return res.status(401).send('Não autorizado.');
  try {
    const sheets = getSheetsClient();
    if (!sheets) return res.status(500).send('Sheets client indisponível.');

    const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const allSheets = meta.data.sheets || [];

    // Lê leads da aba "🟢 Leads Vyxfotos" ou "Leads Vyxfotos" se existir (para migração)
    let leadsParaMigrar = [];
    const leadsTab = allSheets.find(s => s.properties.title.includes('Leads Vyxfotos'));
    if (leadsTab) {
      const leadsData = await sheets.spreadsheets.values.get({
        spreadsheetId: SHEET_ID, range: `'${leadsTab.properties.title}'!A2:F`,
      });
      leadsParaMigrar = leadsData.data.values || [];
    }

    // Apaga Dashboard, abas mensais e aba de Leads centralizada
    const toDelete = allSheets.filter(s =>
      MESES_NOMES.includes(s.properties.title) ||
      s.properties.title === '📊 Dashboard' ||
      s.properties.title.includes('Leads Vyxfotos')
    );
    if (toDelete.length > 0) {
      // Não pode deletar a única aba — verifica se sobra alguma
      const sobram = allSheets.length - toDelete.length;
      const deleteList = sobram > 0 ? toDelete : toDelete.slice(0, toDelete.length - 1);
      if (deleteList.length > 0) {
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId: SHEET_ID,
          requestBody: { requests: deleteList.map(s => ({ deleteSheet: { sheetId: s.properties.sheetId } })) },
        });
      }
    }

    // Recria Dashboard + 12 abas mensais
    await createDashboardSheet(sheets);
    await createMonthlyTabs(sheets);

    // Migra leads antigos para as abas mensais corretas
    let migrados = 0;
    for (const row of leadsParaMigrar) {
      const [email, nome, dataHora, status, origem, uid] = row;
      if (!dataHora) continue;
      // Extrai o mês da data no formato "DD/MM/YYYY, HH:MM:SS"
      const match = dataHora.match(/(\d{2})\/(\d{2})\/(\d{4})/);
      if (!match) continue;
      const mesIndex = parseInt(match[2]) - 1; // 0-indexed
      if (mesIndex < 0 || mesIndex > 11) continue;
      const { tabName } = await getOrCreateMonthTab(sheets, mesIndex);
      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID, range: `'${tabName}'!A:F`,
        valueInputOption: 'USER_ENTERED', insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [[email || '', nome || '—', dataHora || '', status || '🟢 Novo Lead', origem || 'Google', uid || '']] },
      });
      migrados++;
    }

    // Limpa a aba padrão "Página1" se existir e estiver vazia
    const metaFinal = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
    const page1 = metaFinal.data.sheets.find(s => s.properties.title === 'Página1' || s.properties.title === 'Sheet1');
    if (page1 && metaFinal.data.sheets.length > 1) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SHEET_ID,
        requestBody: { requests: [{ deleteSheet: { sheetId: page1.properties.sheetId } }] },
      });
    }

    leadsRegistrados.clear();
    res.send(`✅ Rebuild concluído! Dashboard + 12 abas mensais criadas. ${migrados} leads migrados para as abas corretas.`);
  } catch (e) {
    res.status(500).send('Erro: ' + e.message);
  }
});

// GET /api/admin/reset-sheets?secret=SUA_SENHA — limpa flag addedToSheets de todos os leads
app.get('/api/admin/reset-sheets', async (req, res) => {
  const ADMIN_SECRET = process.env.ADMIN_SECRET || 'vyxadmin2026';
  if (req.query.secret !== ADMIN_SECRET) return res.status(401).send('Não autorizado.');
  if (!firestoreDb) return res.status(500).send('Firestore não disponível.');
  try {
    leadsRegistrados.clear(); // limpa cache de sessão
    const snapshot = await firestoreDb.collection('leads').get();
    const batch = firestoreDb.batch();
    snapshot.forEach(doc => batch.update(doc.ref, { addedToSheets: false }));
    await batch.commit();
    res.send(`✅ Flag resetada para ${snapshot.size} leads. Próximos logins serão registrados na nova planilha.`);
  } catch (e) {
    res.status(500).send('Erro: ' + e.message);
  }
});

// ─────────────────────────────────────────────
// HEALTHCHECK / PING
// ─────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.status(200).send('Vyxfotos.IA Backend Operacional');
});

app.get('/ping', (_req, res) => {
  res.status(200).json({ status: 'ok', ts: Date.now() });
});

// ─────────────────────────────────────────────
// SELF-PING — mantém o Render acordado a cada 10 min
// ─────────────────────────────────────────────
function selfPing() {
  const url = process.env.BACKEND_URL || 'https://vyxfotos-backend.onrender.com';
  const mod = url.startsWith('https') ? require('https') : require('http');
  mod.get(`${url}/ping`, (res) => {
    console.log(`[SelfPing] ${res.statusCode} - servidor ativo`);
  }).on('error', (err) => {
    console.warn('[SelfPing] Falha:', err.message);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Vyxfotos.IA rodando na porta ${PORT}`);
  startPolling();
  // Inicia self-ping a cada 10 minutos (600000ms)
  setInterval(selfPing, 10 * 60 * 1000);
});
