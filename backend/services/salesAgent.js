const { GoogleGenAI } = require('@google/genai');

/**
 * SERVIÇO DE VENDAS IA (Elite Specialist)
 * O cérebro por trás dos DMs do Instagram da Vyxfotos
 */
class SalesAgentService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
        if (apiKey) {
            this.ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        }
    }

    async generateResponse(userMessage, niche = "Geral") {
        console.log(`🔍 [Sales Agent] Gerando resposta inteligente para: "${userMessage}"`);

        if (!this.ai) {
            return this.getFallbackResponse();
        }

        const systemInstruction = `Você é o Especialista de Vendas da Vyxfotos-IA. Seu tom é profissional, autoritário e educativo.
Você vende ensaios fotográficos de elite gerados por IA que economizam tempo e dinheiro do cliente.

BASE DA MENSAGEM (Obrigatório seguir este tom):
"Olá! Sou o especialista da VyxFotos. No momento estamos com alta demanda de processamento, mas você pode garantir suas fotos de elite diretamente no link da nossa BIO. Lá o processo é 100% automático! Ou se preferir acesse o site diretamente por aqui: https://vyxfotos-ia.vercel.app/"

REGRAS:
1. Responda à dúvida do cliente de forma inteligente se ele perguntar algo específico (ex: preço, como funciona, se é real).
2. Use a tecnologia "Ancoragem Facial 1:1" para explicar o realismo.
3. Garanta que o link do site SEMPRE esteja no final: https://vyxfotos-ia.vercel.app/
4. Mantenha a resposta curta (máximo 3 frases).

CLIENTE PERGUNTOU: "${userMessage}"`;

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: systemInstruction,
            });
            return response.text.trim();
        } catch (error) {
            console.error('❌ [Sales Agent AI Error]:', error.message);
            return this.getFallbackResponse();
        }
    }

    getFallbackResponse() {
        return `Olá! Sou o especialista da VyxFotos. No momento estamos com alta demanda de processamento, mas você pode garantir suas fotos de elite diretamente no link da nossa BIO. Lá o processo é 100% automático! Ou se preferir acesse o site diretamente por aqui: https://vyxfotos-ia.vercel.app/`;
    }
}

module.exports = new SalesAgentService();
