import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050508] text-ivory font-sans selection:bg-champagne selection:text-obsidian p-8 md:p-24">
      <div className="max-w-3xl mx-auto border border-white/5 bg-[#0a0a0e]/50 backdrop-blur-xl p-8 md:p-16 rounded-2xl shadow-2xl">
        <div className="text-xl md:text-2xl font-black tracking-tight text-ivory cursor-pointer mb-12" onClick={() => navigate('/')}>
          Vyxfotos<span className="text-champagne ml-1">.</span>IA
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-champagne">Política de Privacidade</h1>
        
        <div className="space-y-6 text-sm md:text-base text-ivory/70 leading-relaxed font-light">
          <p>A <strong>Vyxfotos.IA</strong> está comprometida com a proteção da sua privacidade. Esta política descreve como tratamos seus dados ao utilizar nossos serviços e nossa integração com o Instagram.</p>

          <section>
            <h2 className="text-xl font-semibold text-ivory mb-3">1. Coleta de Informações</h2>
            <p>Coletamos apenas o necessário para fornecer nossos serviços de fotografia por IA: seu nome de usuário do Instagram (para responder DMs), as fotos que você envia para processamento e seu e-mail para entrega dos resultados.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ivory mb-3">2. Uso de Dados (Instagram)</h2>
            <p>Ao interagir com nosso robô no Instagram, processamos suas mensagens via Meta API apenas para responder dúvidas e fornecer links de acesso ao site. Não vendemos seus dados a terceiros.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ivory mb-3">3. Segurança</h2>
            <p>As fotos enviadas são processadas por nossos servidores de IA e deletadas após o término da geração do ensaio, garantindo que sua privacidade facial seja mantida.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ivory mb-3">4. Cookies</h2>
            <p>Utilizamos cookies apenas para manter sua sessão ativa na Área do Cliente.</p>
          </section>

          <div className="pt-12 border-t border-white/5 mt-12 text-xs text-ivory/40">
            Atualizado em: 08 de Abril de 2026.
          </div>
        </div>
        
        <button 
          onClick={() => navigate('/')} 
          className="mt-12 text-champagne hover:text-ivory transition-colors text-sm font-mono tracking-widest uppercase"
        >
          &larr; Voltar ao Início
        </button>
      </div>
    </div>
  );
}
