const { GoogleGenAI } = require('@google/genai');

/**
 * SERVIÇO DE VENDAS IA (Expert Specialist)
 * O cérebro por trás dos DMs do Instagram
 */
class SalesAgentService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
        this.ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    }

    async generateResponse(userMessage, niche = "Geral") {
        console.log(`🔍 [Sales Agent] Atendendo lead. Nicho: ${niche}`);

        const systemPrompt = `Você é o Especialista de Vendas da Vyxfotos-IA. Seu tom é profissional, autoritário e educativo.
Você não dá descontos, você vende valor e autoridade.

ESTRATÉGIA:
- Se o cliente perguntar se é real: Explique a tecnologia de "Ancoragem Facial 1:1" que preserva a geometria original.
- Se o cliente for de um nicho específico (${niche}): Use argumentos de sucesso profissional.
- ESCASSEZ: Mencione que o processamento premium suporta apenas 50 novos ensaios por dia para manter a elite da qualidade.
- CALL TO ACTION: Leve o cliente a clicar no link: https://vyxfotos-ia.vercel.app/

MENSAGEM DO USUÁRIO: "${userMessage}"

Responda de forma curta e impactante para o Direct do Instagram. Máximo 3 frases. Sempre termine com o link do site: https://vyxfotos-ia.vercel.app/`;

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-1.5-flash',
                contents: systemPrompt,
            });
            return response.text.trim();
        } catch (error) {
            console.error('❌ [Sales Agent Error]:', error.message);
            return "Olá! Sou o especialista da VyxFotos. Você pode garantir suas fotos de elite diretamente no nosso site! Ou se preferir acesse o site diretamente aqui: https://vyxfotos-ia.vercel.app/";
        }
    }
}

module.exports = new SalesAgentService();
