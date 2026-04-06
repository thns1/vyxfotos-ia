const nodemailer = require('nodemailer');

class MailerService {
    constructor() {
        // Configuramos o protocolo SMTP apontando direto pros datacenters do Google
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    async sendFinalPhotos(clienteEmail, photoUrl, orderId) {
        // Bloqueio de Segurança para não rodar se o usuário não preencheu a Senha de APP
        if (!process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'SUA_SENHA_AQUI') {
            console.log(`[Correios] ⚠️ AVISO: E-mail não enviado para ${clienteEmail}! Senha de App do Gmail não configurada no .env`);
            return false;
        }

        try {
            // Montando o Corpo do E-mail como HTML (Profissional)
            const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #000; padding: 20px; text-align: center;">
                    <h1 style="color: #FFD700; margin: 0; font-size: 24px; letter-spacing: 2px;">VYXFOTOS IA</h1>
                </div>
                
                <div style="padding: 30px; background-color: #fcfcfc;">
                    <h2 style="color: #111;">Seus Resultados Chegaram! 🎉</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #444;">
                        O servidor finalizou a renderização pesada da sua imagem e nós destrancamos a Malha Física. 
                        A sua foto profissional em alta qualidade e sem marca d'água está logo abaixo nos <strong>Anexos deste e-mail</strong>. (Para não perder qualidade, sempre salve diretamente do anexo).
                    </p>
                    
                    <p style="font-size: 14px; color: #777; margin-top: 30px;">
                        <i>Referência do Pedido: ${orderId}</i><br>
                        Se precisar de ajuda, basta responder este e-mail falando com o nosso time de Qualidade.
                    </p>
                </div>
            </div>
            `;

            const mailOptions = {
                from: `"Vyxfotos IA" <${process.env.EMAIL_USER}>`,
                to: clienteEmail,
                subject: `📸 Estúdio Vyxfotos - Suas Imagens em 4K Prontas!`,
                html: htmlContent,
                attachments: [
                    {
                        filename: 'Vyxfotos_Premium_4K.jpg',
                        path: photoUrl // O Nodemailer faz o download automático da URL e joga no anexo.
                    }
                ]
            };

            console.log(`[Correios] Despachando Carta Registrada (Link de Download) para: ${clienteEmail}`);
            await this.transporter.sendMail(mailOptions);
            console.log(`[Correios] E-mail ENTREGUE na Caixa de Entrada com SUCESSO! ✅`);
            return true;

        } catch (error) {
            console.error(`[Correios] ERRO CRÍTICO ao enviar E-mail:`, error.message);
            return false;
        }
    }
}

module.exports = new MailerService();
