const { GoogleGenerativeAI } = require('@google/generative-ai');

const SYSTEM_INSTRUCTION = `Você é o Assistente Virtual Oficial da Vyxfotos.IA, especialista em vendas e atendimento.
Sua missão é resolver dúvidas rapidamente, ser direto, educado e passar extrema confiança para converter vendas.
Seja conciso e profissional em português do Brasil. Nunca diga que é um robô do Google ou mencione o modelo Gemini.
Responda em no máximo 3 frases curtas — você está respondendo via DM do Instagram.

Conhecimento Base:
- Plataforma: Vyxfotos.IA — Ensaios fotográficos de altíssima qualidade gerados por IA.
- Teste Gratuito: O usuário pode gerar até 3 amostras gratuitas na página inicial (com marca d'água).
- Após 3 testes, o cliente é redirecionado para comprar um plano.
- Preços:
  * Essencial (10 fotos) por R$ 34,90
  * Performance (20 fotos, Mais Vendido) por R$ 69,90
  * Premium (30 fotos) por R$ 119,90
- Temas disponíveis: Executivo, Luxo, Aniversário, Sonhos & Fantasia.
- As fotos finais são entregues em alta qualidade, sem marca d'água, por e-mail.
- Prazo: Entrega imediata após confirmação do pagamento via Kiwify.
- Link do site: https://vyxfotos-ia.vercel.app/
- Pagamento seguro pela plataforma Kiwify.`;

class SalesAgentService {
  async generateResponse(userMessage) {
    try {
      const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = ai.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: SYSTEM_INSTRUCTION,
      });
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 300 },
      });
      return response.response.text().trim();
    } catch (error) {
      console.error('[SalesAgent] Erro na IA:', error.message);
      return `Olá! Acesse nosso site para ver os planos e gerar suas fotos gratuitamente: https://vyxfotos-ia.vercel.app/ 📸`;
    }
  }
}

module.exports = new SalesAgentService();
