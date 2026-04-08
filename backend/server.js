require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const ImagePipelineService = require('./services/imagePipeline');
const MailerService = require('./services/mailer');
const SalesAgentService = require('./services/salesAgent');
const MetaMessageService = require('./services/metaMessageService');
const app = express();
const port = process.env.PORT || 3001;

// Configuração do Multer para Marketing (Ponte Instagram)
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'mkt-' + uniqueSuffix + '.jpg'); // Força a extensão .jpg
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rota de Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: "ok", message: "Motor Neural Vyxfotos On-line." });
});

// ============================================
// WEBHOOK CEREBRAL: Escuta do Banco Kiwify
// ============================================
app.post('/api/webhooks/kiwify', async (req, res) => {
    try {
        const payload = req.body;
        console.log(`=============================================`);
        console.log(`[💰 KIWIFY WEBHOOK] Nova Atualização Financeira!`);
        console.log(`[💰 Status do Gatilho] -> ${payload.order_status}`);
        
        // Verifica se a venda foi paga com PIX ou Cartão
        if (payload.order_status === 'paid') {
           const orderId = payload.tracking_parameters?.src || "PEDIDO_MANUAL";
           const customerEmail = payload.Customer?.email || "sem_email";
           
           console.log(`[🚀 SINAL VERDE!] O cliente pagou.`);
           console.log(`[🚀 O Rastreio (src) da Câmera] -> ${orderId} | Conta: ${customerEmail}`);
           
           // BUSCA A FOTO REAL NO BANCO DE DADOS (Pendente)
           let fotoGerada4k = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80"; // Fallback de seguranca
           
           try {
             const { db } = require('./services/firebaseAdmin');
             if (db && orderId !== "PEDIDO_MANUAL") {
                const snap = await db.ref('pending_generations/' + orderId).get();
                if (snap.exists()) {
                   fotoGerada4k = snap.val().output_url;
                   console.log(`[🚀 SUCESSO!] Foto Real encontrada para o Pedido: ${orderId}`);
                } else {
                   console.warn(`[⚠️ Alerta] Pedido ${orderId} pago, mas imagem original não encontrada no banco pendente.`);
                }
             }

             // SALVAMENTO NO BANCO DE DADOS DA 'ÁREA DO CLIENTE' (Firebase)
             if (db && customerEmail !== "sem_email") {
                await db.ref('marketing_orders').push({
                   email: customerEmail,
                   orderId: orderId,
                   fotoFinal: fotoGerada4k,
                   timestamp: Date.now()
                });
                console.log(`[🔥 Firebase] Pedido Arquivado no Realtime Database do Cliente (${customerEmail})!`);
             }
           } catch(e) {
             console.error(`[🔥 Firebase Error]`, e.message);
           }

           console.log(`[✅ FASE 4 START] Mandando carta para o caminhão dos Correios Eletrônicos...`);
           
           // Aciona a sub-rotina para montar a caixa de HTML e enviar. O 'await' não é bloqueante.
           await MailerService.sendFinalPhotos(customerEmail, fotoGerada4k, orderId);
           
           console.log(`[✅ FASE 4 DONE] Workflow Encerrado! Cliente Feliz.`);
        }
        
        console.log(`=============================================`);
        // Avisa a kiwify que recebemos a mensagem pra ela não ficar mandando duplicado
        res.status(200).json({ received: true });
    } catch (err) {
        console.error("[Erro Webhook]", err.message);
        res.status(500).send("Bad Payload");
    }
});

// A Rota Principal de Geração de Fotos com Face-Swap (Início do Funil)
app.post('/api/generate', upload.single('selfieFile'), async (req, res) => {
    try {
        const file = req.file;
        const theme = req.body.theme;
        const customTheme = req.body.customTheme;

        if (!file) {
            return res.status(400).json({ error: "Nenhuma foto/selfie fornecida na requisição." });
        }

        console.log(`[API] Nova Rquisição de Geração: Tema: "${theme}"`);

        // Dispara o PipeLine Principal que foi programado junto de FaceID
        const result = await ImagePipelineService.generateWithFaceID(file, theme, customTheme);

        // SALVA NA FILA DE PENDENTES (Para o Webhook encontrar depois da compra)
        try {
            const { db } = require('./services/firebaseAdmin');
            if (db) {
                await db.ref('pending_generations/' + result.orderId).set({
                    output_url: result.output_url,
                    createdAt: Date.now()
                });
                console.log(`[🔥 Firebase] Geração ${result.orderId} registrada no aguardo do pagamento.`);
            }
        } catch (dbError) {
            console.error("[🔥 Firebase Cache Error]", dbError.message);
        }

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("[API] Erro ao processar requisição:", error.message);
        console.error("[API] Stack completo:", error.stack);
        // Retorna o erro real do Google para diagnóstico
        res.status(500).json({ 
            success: false, 
            error: "Erro interno do Motor de Imagens.",
            detail: error.message 
        });
    }
});

// ============================================
// WEBHOOK DE VENDAS: ManyChat IA Expert
// ============================================
app.post('/api/webhooks/manychat-sales', async (req, res) => {
    try {
        const { message, niche } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: "Mensagem vazia." });
        }

        console.log(`💬 [ManyChat] Lead perguntou: "${message.substring(0, 30)}..."`);
        
        const aiResponse = await SalesAgentService.generateResponse(message, niche);
        
        // Muitos bots de ManyChat esperam um campo 'content' ou 'response'
        res.json({ 
            success: true,
            response: aiResponse 
        });

    } catch (err) {
        console.error("[ManyChat Webhook Error]", err.message);
        res.status(500).json({ success: false, error: "Erro na IA de Vendas." });
    }
});

// ============================================
// PONTE DE MARKETING: Recebe fotos do Robô
// ============================================
app.post('/api/marketing/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado." });
    const publicUrl = `https://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url: publicUrl });
});

// ============================================
// WEBHOOK NATIVO: Instagram Messaging API
// ============================================

// 1. Verificação (Handshake da Meta)
app.get('/api/webhooks/instagram', (req, res) => {
    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'vyx_secret_token_2026';
    
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('✅ [Meta Webhook] Verificado com sucesso!');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
});

// 2. Recebimento de Mensagens
app.post('/api/webhooks/instagram', async (req, res) => {
    console.log('📬 [Meta Webhook] RAW BODY RECEIVED:', JSON.stringify(req.body, null, 2));
    const body = req.body;

    if (body.object === 'instagram' || body.object === 'page') {
        res.status(200).send('EVENT_RECEIVED'); // Responde imediatamente para a Meta

        body.entry.forEach(async (entry) => {
            let senderId = null;
            let messageText = null;

            // Formato 1: entry.messaging[] (DMs reais da Instagram Messaging API)
            if (entry.messaging && entry.messaging.length > 0) {
                const event = entry.messaging[0];
                if (event.message && !event.message.is_echo && event.message.text) {
                    senderId = event.sender.id;
                    messageText = event.message.text;
                }
            }

            // Formato 2: entry.changes[] (usado na API de Webhook do Instagram Business)
            if (!senderId && entry.changes && entry.changes.length > 0) {
                const change = entry.changes[0];
                if (change.field === 'messages' && change.value) {
                    const val = change.value;
                    if (val.message && val.message.text && !val.message.is_echo) {
                        senderId = val.sender.id;
                        messageText = val.message.text;
                    }
                }
            }

            if (senderId && messageText) {
                console.log(`💬 [IG Native] Mensagem de ${senderId}: "${messageText}"`);
                
                try {
                    const aiResponse = await SalesAgentService.generateResponse(messageText);
                    await MetaMessageService.sendTextMessage(senderId, aiResponse);
                    console.log(`✅ [IG Native] Resposta enviada com sucesso.`);
                } catch (aiError) {
                    console.error('❌ [IG Native Error] Falha ao processar resposta:', aiError.message);
                }
            } else {
                console.log('ℹ️ [IG Native] Evento recebido mas sem mensagem de texto para processar (eco, reação, etc).');
            }
        });
    } else {
        res.sendStatus(404);
    }
});


app.listen(port, () => {
    console.log(`🚀 [Vyxfotos-Backend] Servidor Neural rodando na porta ${port}`);
    console.log(`👉 Aguardando selfies e comandos de tema.`);
});
