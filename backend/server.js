require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ImagePipelineService = require('./services/imagePipeline');
const MailerService = require('./services/mailer');
const app = express();
const port = process.env.PORT || 3001;

// Configuração do Multer (Recepção de Imagens temporárias)
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

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

app.listen(port, () => {
    console.log(`🚀 [Vyxfotos-Backend] Servidor Neural rodando na porta ${port}`);
    console.log(`👉 Aguardando selfies e comandos de tema.`);
});
