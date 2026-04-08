/**
 * SERVIÇO DE VENDAS AUTOMÁTICO (Fixo e Estável)
 * Envia a mensagem padrão aprovada pelo usuário.
 */
class SalesAgentService {
    async generateResponse(userMessage) {
        // Mensagem padrão 100% estável solicitada pelo Thiago
        return `Olá! Sou o especialista da Vyxfotos. No momento estamos com alta demanda de processamento, mas você pode garantir suas fotos de elite diretamente no link da nossa BIO. Lá o processo é 100% automático!

Ou se preferir acesse o site diretamente por aqui: https://vyxfotos-ia.vercel.app/`;
    }
}

module.exports = new SalesAgentService();
