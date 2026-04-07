require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const ImagePipelineService = require('./services/imagePipeline');
const MailerService = require('./services/mailer');
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
           
           // Em caso prático: Aqui verificaríamos o ${orderId} no Banco de Dados para ver qual foi a URL da imagem.
           // Mas para testes imediatos, vamos usar uma URL de foto fake de teste que já deixamos pronta:
           const fotoGerada4k = "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80"; 

           // SALVAMENTO NO BANCO DE DADOS DA 'ÁREA DO CLIENTE' (Firebase)
           try {
             const { db } = require('./services/firebaseAdmin');
             if (db && customerEmail !== "sem_email") {
                await db.collection('marketing_orders').add({
                   email: customerEmail,
                   orderId: orderId,
                   fotoFinal: fotoGerada4k,
                   timestamp: Date.now()
                });
                console.log(`[🔥 Firebase] Pedido Arquivado no Cofre VIP do Cliente (${customerEmail})!`);
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

        res.json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error("[API] Erro ao processar requisição:", error.message);
        res.status(500).json({ success: false, error: "Erro interno do Motor de Imagens." });
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

app.listen(port, () => {
    console.log(`🚀 [Vyxfotos-Backend] Servidor Neural rodando na porta ${port}`);
    console.log(`👉 Aguardando selfies e comandos de tema.`);
});
