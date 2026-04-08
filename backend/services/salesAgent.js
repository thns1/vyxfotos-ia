const { GoogleGenAI } = require('@google/genai');

/**
 * SERVIÇO DE VENDAS IA (Expert Conversacional)
 */
class SalesAgentService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
        if (apiKey) {
            this.ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        }
    }

    async generateResponse(userMessage, niche = "Geral") {
        console.log(`🔍 [Sales Agent] Iniciando geração inteligente para: "${userMessage}"`);

        if (!this.ai) {
            return this.getFallbackResponse();
        }

        const systemInstruction = `Você é o Especialista de Vendas da Vyxfotos-IA. Seu objetivo é converter seguidores em clientes de forma humana e inteligente.

DIRETRIZES DE PERSONALIDADE:
1. Reaja diretamente ao que o usuário disse. Se ele elogiou, agradeça. Se perguntou algo técnico (como realismo), explique que usamos redes neurais que mapeiam micro-expressões faciais (Ancoragem Facial 1:1).
2. NUNCA envie apenas uma mensagem padrão pronta. Cada resposta deve ser única.
3. Você pode mencionar que a demanda está alta, mas faça isso de forma natural na conversa.

OBJETIVO FINAL:
Sempre direcione o cliente para o link de compra/geração no site: https://vyxfotos-ia.vercel.app/

FORMATO:
- Responda em no máximo 1 parágrafo curto (2 a 4 frases).
- Use um tom de luxo e exclusividade.

MENSAGEM DO CLIENTE: "${userMessage}"

Sua resposta deve ser humanizada e persuasiva.`;

        try {
            const model = this.ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(systemInstruction);
            const text = result.response.text().trim();
            
            console.log(`✅ [Sales Agent AI] Resposta gerada: "${text}"`);
            return text;
        } catch (error) {
            console.error('❌ [Sales Agent AI Error]:', error.message);
            return this.getFallbackResponse();
        }
    }

    getFallbackResponse() {
        return `Olá! Sou o especialista da VyxFotos. Notei seu interesse! Estamos com uma fila de processamento alta hoje, mas você pode garantir seu ensaio de elite agora mesmo de forma 100% automática aqui: https://vyxfotos-ia.vercel.app/`;
    }
}

module.exports = new SalesAgentService();
