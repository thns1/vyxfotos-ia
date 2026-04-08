const { GoogleGenAI } = require('@google/genai');

/**
 * SERVIÇO DE VENDAS IA (Elite Specialist)
 * O cérebro por trás dos DMs do Instagram da Vyxfotos
 */
class SalesAgentService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
        if (!apiKey) {
            console.error('⚠️ [Sales Agent] API KEY não encontrada.');
            this.ai = null;
        } else {
            this.ai = new GoogleGenAI({ apiKey: apiKey.trim() });
        }
    }

    async generateResponse(userMessage, niche = "Geral") {
        console.log(`🔍 [Sales Agent] Gerando resposta para: "${userMessage}"`);

        if (!this.ai) {
            return this.getFallbackResponse();
        }

        const systemPrompt = `Você é o Especialista de Vendas da Vyxfotos-IA. Seu tom é profissional, autoritário e focado em resultados executivos.
Você NÃO dá descontos. Você vende o valor de um ensaio fotográfico feito por IA que economiza tempo e dinheiro do cliente.

ESTRATÉGIA DE RESPOSTA:
1. Responda à dúvida do cliente de forma direta.
2. Argumente sobre a qualidade (Ancoragem Facial 1:1) - fotos que parecem 100% reais.
3. ESCASSEZ: Temos vagas limitadas para o lote premium de hoje.
4. CALL TO ACTION: Direcione o cliente para o link de compra: https://vyxfotos-ia.vercel.app/

MENSAGEM DO USUÁRIO: "${userMessage}"

REGRAS:
- Responda em no máximo 3 frases curtas.
- Seja cordial mas focado em fechar a venda.
- INCLUA SEMPRE o link do site no final: https://vyxfotos-ia.vercel.app/`;

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: systemPrompt,
            });
            return response.text.trim();
        } catch (error) {
            console.error('❌ [Sales Agent Error]:', error.message);
            return this.getFallbackResponse();
        }
    }

    getFallbackResponse() {
        return "Olá! Sou o especialista da VyxFotos. Você pode garantir seu ensaio executivo de elite agora mesmo de forma 100% automática em nosso site! Acesse aqui: https://vyxfotos-ia.vercel.app/";
    }
}

module.exports = new SalesAgentService();
