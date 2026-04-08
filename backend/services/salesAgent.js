const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * SERVIÇO DE VENDAS IA (Expert Specialist)
 * O cérebro por trás dos DMs do Instagram
 */
class SalesAgentService {
    constructor() {
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_KEY;
        this.genAI = new GoogleGenerativeAI(apiKey.trim());
        // Usamos o modelo Pro para máxima estabilidade e inteligência nas vendas
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    }

    async generateResponse(userMessage, niche = "Geral") {
        console.log(`🔍 [Sales Agent] Atendendo lead. Nicho: ${niche}`);

        const systemPrompt = `
            Você é o Especialista de Vendas da Vyxfotos-IA. Seu tom é profissional, autoritário e educativo.
            Você não dá descontos, você vende valor e autoridade.
            
            ESTRATÉGIA:
            - Se o cliente perguntar se é real: Explique a tecnologia de "Ancoragem Facial 1:1" que preserva a geometria original.
            - Se o cliente for de um nicho específico (${niche}): Use argumentos de sucesso profissional.
            - ESCASSEZ: Mencione que o processamento premium suporta apenas 50 novos ensaios por dia para manter a elite da qualidade.
            - CALL TO ACTION: Leve o cliente a clicar no link da BIO ou no site para garantir o ensaio.

            MENSAGEM DO USUÁRIO: "${userMessage}"
            
            Responda de forma curta e impactante para o Direct do Instagram.
        `;

        try {
            const result = await this.model.generateContent(systemPrompt);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            console.error('❌ [Sales Agent Error]:', error.message);
            return "Olá! Sou o especialista da VyxFotos. No momento estamos com alta demanda de processamento, mas você pode garantir suas fotos de elite diretamente no link da nossa BIO. Lá o processo é 100% automático!";
        }
    }
}

module.exports = new SalesAgentService();
