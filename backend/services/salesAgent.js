/**
 * SERVIÇO DE VENDAS AUTOMÁTICO (Fixo e Estável)
 * Envia a mensagem padrão escolhida pelo usuário.
 */
class SalesAgentService {
    async generateResponse(userMessage) {
        // Mensagem final escolhida pelo Thiago
        return `Olá! Sou o especialista da VyxFotos. Notei seu interesse!

Estamos com uma fila de processamento alta hoje, mas você pode garantir seu ensaio de elite agora mesmo de forma 100% automática pelo site no link da BIO.

Ou se preferir pode acessar diretamente por aqui: https://vyxfotos-ia.vercel.app/`;
    }
}

module.exports = new SalesAgentService();
