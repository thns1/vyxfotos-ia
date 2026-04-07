import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { CheckCircle2, ArrowRight, Mail, LayoutDashboard } from 'lucide-react';

export default function ThankYou() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] text-ivory font-sans selection:bg-champagne selection:text-obsidian relative overflow-x-hidden">
      {/* GLOBAL CINEMATIC BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/60 via-transparent to-[#050508]/80 opacity-80 z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,168,76,0.15),transparent_70%)] z-10"></div>
        <img src="/hero-bg.jpg" alt="Cinematic Studio Background" className="w-full h-full object-cover opacity-40 grayscale contrast-125 scale-110 blur-[2px]" />
      </div>

      {/* NAVBAR SIMPLIFICADA */}
      <nav className="relative top-0 w-full z-50 py-6 px-12 flex justify-center items-center">
        <div className="text-2xl font-black tracking-tight text-ivory cursor-pointer" onClick={() => navigate('/')}>
          Vyxfotos<span className="text-champagne ml-1">.</span>IA
        </div>
      </nav>

      <main className="w-full min-h-[80vh] flex items-center justify-center px-6 relative z-10">
        <div className="max-w-2xl w-full bg-[#0a0a0e]/60 backdrop-blur-3xl p-12 md:p-20 rounded-[3rem] md:rounded-[4.5rem] border border-white/10 shadow-2xl text-center space-y-12 animate-fade-in">
          
          <div className="flex justify-center">
             <div className="w-24 h-24 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(34,197,94,0.3)] animate-bounce-slow">
                <CheckCircle2 size={48} />
             </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-ivory leading-tight">Sua jornada começou! ✨</h1>
            <p className="text-ivory/60 text-lg md:text-xl font-light leading-relaxed max-w-xl mx-auto">
              Pagamento confirmado. Nossas máquinas de IA já estão mapeando seus traços faciais para a renderização do cenário escolhido.
            </p>
          </div>

          {/* Cards de Entrega */}
          <div className="grid md:grid-cols-2 gap-6 text-left">
             <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-champagne/20 transition-colors group">
                <div className="flex items-center gap-3 text-champagne">
                   <LayoutDashboard size={24} className="group-hover:scale-110 transition-transform" />
                   <span className="font-black text-xs uppercase tracking-[0.2em]">Entrega Instantânea</span>
                </div>
                <p className="text-sm text-ivory/60 leading-relaxed overflow-hidden italic">
                  Suas fotos em 4K e os arquivos originais limpos já estão sendo salvos automaticamente na sua <b>Área do Cliente</b>.
                </p>
             </div>
             <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-4 hover:border-champagne/20 transition-colors group">
                <div className="flex items-center gap-3 text-champagne">
                   <Mail size={24} className="group-hover:scale-110 transition-transform" />
                   <span className="font-black text-xs uppercase tracking-[0.2em]">Cópia Segura</span>
                </div>
                <p className="text-sm text-ivory/60 leading-relaxed overflow-hidden italic">
                  Uma cópia Ultra-HD será enviada para o seu e-mail de compra dentro de um prazo máximo de <b>5 a 15 minutos</b>.
                </p>
             </div>
          </div>

          <div className="pt-8">
             <button 
                onClick={() => navigate('/cliente')}
                className="group w-full py-6 bg-champagne text-obsidian rounded-3xl font-black text-xl tracking-tight hover:bg-ivory transition-all shadow-2xl flex items-center justify-center gap-3"
             >
                ACESSAR MINHA ÁREA DO CLIENTE
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
             </button>
             <p className="mt-8 text-[11px] md:text-xs text-ivory/20 uppercase tracking-[0.3em] font-mono font-bold">
                Vyxfotos.IA — Renderização de Alto Luxo 4K
             </p>
          </div>

        </div>
      </main>
    </div>
  );
}
