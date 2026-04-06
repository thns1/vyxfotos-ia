const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Configuração do Multer (armazenamento temporário em memória para API)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const PORT = process.env.PORT || 3001;

// Rota de Teste Base
app.get('/api/status', (req, res) => {
  res.json({ status: 'Online', service: 'Vyxfotos.IA Backend' });
});

/**
 * 1. Endpoint de Geração da Amostra (Marca d'água)
 * Recebe a foto do usuário e o tema. Envia pra IA e retorna a amostra.
 */
app.post('/api/generate-preview', upload.single('faceImage'), async (req, res) => {
  try {
    const { themeId } = req.body;
    const file = req.file;

    if (!file || !themeId) {
      return res.status(400).json({ error: 'Imagem e Tema são obrigatórios.' });
    }

    console.log(`📸 Recebendo foto para o tema: ${themeId}. Processando IA...`);

    // SIMULAÇÃO: Aqui integrariamos com a API do Replicate ou similar (Flux FaceID)
    // const aiResponse = await axios.post('https://api.replicate.com/...', { ... })
    // e aplicaríamos a logica de marca d'agua em cima da imagem gerada.
    
    // Retornando Mock da Imagem Gerada
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Amostra gerada com sucesso!',
        watermarkedImageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80',
        orderId: 'Vyx_' + Math.floor(Math.random() * 100000) // ID único pro carrinho
      });
    }, 2000);

  } catch (error) {
    console.error('Erro ao gerar preview:', error);
    res.status(500).json({ error: 'Falha no processamento da IA.' });
  }
});

/**
 * 2. Webhook da Kiwify (Listener de Pagamentos Aprovados)
 * A Kiwify vai bater aqui quando o cliente aprovar o PIX ou Cartão.
 */
app.post('/api/webhook/kiwify', async (req, res) => {
  try {
    const kiwifyPayload = req.body;
    // Validação do Token da Kiwify para segurança (process.env.KIWIFY_WEBHOOK_TOKEN)

    console.log('💰 [WEBHOOK KIWIFY] Notificação recebida:', kiwifyPayload.order_status);

    if (kiwifyPayload.order_status === 'paid') {
      const customerEmail = kiwifyPayload.Customer.email;
      const productId = kiwifyPayload.Product.id; // Vai definir se é pacote d 5, 7 ou 12
      
      console.log(`🚀 Pagamento Aprovado! Desbloqueando fotos para: ${customerEmail}`);

      // Lógica Mock: Rodar a IA novamente em lote, em alta resolução
      // sendHighResPhotosToEmail(customerEmail, productId);
    }

    res.status(200).send('Webhook processado');
  } catch (error) {
    console.error('Erro no Webhook:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Motor da VYxFotos.IA rodando na porta ${PORT}`);
});
