import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, MessageCircle, Send, ArrowLeft, CheckCircle2, Loader2, Phone, MapPin } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Suporte Técnico',
    message: ''
  });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setStatus('success');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Contact error:', error);
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-ivory relative overflow-hidden font-inter selection:bg-champagne selection:text-obsidian flex flex-col">
      {/* BACKGROUND DECOR */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-champagne/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-900/10 blur-[150px] rounded-full"></div>
      </div>

      {/* HEADER / NAVIGATION */}
      <nav className="w-full h-24 flex items-center justify-between px-6 md:px-12 relative z-50">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-champagne/50 transition-all">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </div>
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-ivory/40 group-hover:text-ivory transition-colors">Voltar ao Início</span>
        </div>
        <div className="text-2xl font-black italic tracking-tighter text-champagne drop-shadow-[0_0_15px_rgba(201,168,76,0.2)]">Vyxfotos.IA</div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 relative z-10 flex flex-col md:flex-row gap-16 items-center">
        
        {/* LEFT SIDE - INFO */}
        <div className="w-full md:w-1/2 space-y-10">
          <div className="space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne/10 border border-champagne/20">
                <span className="w-2 h-2 rounded-full bg-champagne animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-champagne">Atendimento Oficial</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tighter italic">
                Como podemos <span className="text-champagne">ajudar?</span>
             </h1>
             <p className="text-lg md:text-xl text-ivory/60 font-light leading-relaxed max-w-md">
                Estamos prontos para resolver qualquer dúvida sobre seus ensaios, pagamentos ou parcerias. Fale com um especialista.
             </p>
          </div>
        </div>

        {/* RIGHT SIDE - FORM */}
        <div className="w-full md:w-1/2">
          {status === 'success' ? (
            <div className="bg-[#121217] border border-champagne/30 p-12 rounded-[3.5rem] shadow-2xl text-center space-y-6 animate-fade-in">
               <div className="w-24 h-24 bg-champagne/10 text-champagne rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} className="animate-scale-up" />
               </div>
               <h2 className="text-3xl font-black italic">Mensagem Enviada!</h2>
               <p className="text-ivory/60 leading-relaxed">
                  Recebemos sua dúvida com sucesso. Acabamos de enviar uma **confirmação para o seu e-mail**. Nossa equipe responderá em breve.
               </p>
               <button 
                onClick={() => navigate('/')}
                className="px-10 py-4 bg-champagne text-obsidian rounded-2xl font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-lg shadow-champagne/20"
               >
                 Voltar para Home
               </button>
            </div>
          ) : (
            <div className="bg-[#0a0a0e]/40 backdrop-blur-3xl border border-white/10 p-10 md:p-14 rounded-[3.5rem] shadow-2xl animate-fade-in">
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-ivory/30 ml-2">Seu Nome</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Ex: João Silva"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-ivory focus:outline-none focus:border-champagne/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-ivory/30 ml-2">E-mail para Resposta</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="joao@email.com"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-ivory focus:outline-none focus:border-champagne/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-ivory/30 ml-2">Assunto Principal</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-ivory focus:outline-none focus:border-champagne/50 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                    >
                      <option className="bg-obsidian">Suporte Técnico</option>
                      <option className="bg-obsidian">Financeiro / Pagamentos</option>
                      <option className="bg-obsidian">Sugestões / Parcerias</option>
                      <option className="bg-obsidian">Outros Assuntos</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-ivory/30 ml-2">Sua Mensagem</label>
                    <textarea 
                      required
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      placeholder="Como podemos ajudar?"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-ivory focus:outline-none focus:border-champagne/50 focus:bg-white/10 transition-all resize-none"
                    ></textarea>
                  </div>

                  {status === 'error' && (
                    <p className="text-red-400 text-xs font-mono text-center">Erro ao enviar. Verifique sua conexão.</p>
                  )}

                  <button 
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full py-5 bg-champagne text-obsidian rounded-[2rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-champagne/10 disabled:opacity-50"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        Enviar Mensagem
                      </>
                    )}
                  </button>
               </form>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-8 text-center text-ivory/20 bg-transparent relative z-10">
         <p className="text-[9px] font-mono uppercase tracking-widest">© 2024 Vyxfotos.IA — Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
