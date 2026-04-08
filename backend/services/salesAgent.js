const { GoogleGenAI } = require('@google/genai');

/**
 * SERVIÇO DE VENDAS IA (Customizado pelo Usuário)
 */
class SalesAgentService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
        if (apiKey) {
            this.ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        }
    }

    async generateResponse(userMessage, niche = "Geral") {
        console.log(`🔍 [Sales Agent] Processando mensagem: "${userMessage}"`);

        // Mensagem exata solicitada pelo usuário para garantir 100% de satisfação agora
        const exactMessage = `Olá! Sou o especialista da VyxFotos. No momento estamos com alta demanda de processamento, mas você pode garantir suas fotos de elite diretamente no link da nossa BIO. Lá o processo é 100% automático!

Ou se preferir acesse o site diretamente por aqui: https://vyxfotos-ia.vercel.app/`;

        // Se quiser usar a IA para personalizar, podemos voltar aqui depois. 
        // Por enquanto, vamos garantir a entrega do que foi pedido.
        return exactMessage;
    }
}

module.exports = new SalesAgentService();
