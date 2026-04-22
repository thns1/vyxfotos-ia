import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PACKAGES } from '../constants/packages';
import { SUBTHEMES_MAP } from '../constants/themes';
import { ChevronLeft, Plus, Minus } from 'lucide-react';

export default function Plans() {
  const navigate = useNavigate();
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const [subThemeCounts, setSubThemeCounts] = useState({});
  const [theme, setTheme] = useState('executivo');
  const [availableSubthemes, setAvailableSubthemes] = useState([]);
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    // Carregar tema e OrderID do localStorage
    const savedTheme = localStorage.getItem('vyx_theme') || 'executivo';
    const savedOrderId = localStorage.getItem('vyx_order_id') || `PV_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    setTheme(savedTheme);
    setOrderId(savedOrderId);
    setAvailableSubthemes(SUBTHEMES_MAP[savedTheme] || []);
  }, []);

  const handleSelectPkg = (pkgId) => {
    setSelectedPkgId(pkgId);
    setSubThemeCounts({}); // Reseta as contagens se trocar de pacote
  };

  const updateCount = (subId, delta, limit) => {
    setSubThemeCounts(prev => {
      const currentCount = prev[subId] || 0;
      const totalSelected = Object.values(prev).reduce((a, b) => a + b, 0);

      // Validações Matemáticas (Não pode descer de 0 e não pode estourar o limite do pacote)
      if (currentCount + delta < 0) return prev;
      if (delta > 0 && totalSelected + delta > limit) return prev;

      return { ...prev, [subId]: currentCount + delta };
    });
  };

  const handlePayment = (pkg) => {
    const totalSelected = Object.values(subThemeCounts || {}).reduce((a, b) => a + b, 0);
    
    // Para pacotes com alocação necessária
    if (totalSelected < pkg.limit) return;

    // Constrói a URL para a Kiwify com as variáveis de seleção
    const varsText = Object.entries(subThemeCounts || {}).map(([k, v]) => `${k}:${v}`).join(',');
    window.location.href = `${pkg.link}?src=${orderId}_vars_${varsText}`;
  };

  return (
    <div className="min-h-screen bg-[#050508] text-ivory font-sans selection:bg-champagne selection:text-obsidian relative overflow-x-hidden">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 filter blur-[10px]"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian/20 to-obsidian/90"></div>
      </div>

      {/* NAVBAR */}
      <nav className="relative md:fixed top-0 w-full z-50 py-6 px-6 md:px-12 flex justify-between items-center bg-[#050508]/80 backdrop-blur-xl border-b border-white/5">
        <div className="text-xl md:text-2xl font-black tracking-tight text-ivory cursor-pointer flex items-center" onClick={() => navigate('/')}>
          Vyxfotos<span className="text-champagne ml-1">.</span>IA
        </div>
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs md:text-sm font-mono tracking-widest uppercase text-ivory/60 hover:text-champagne transition-colors"
        >
          <ChevronLeft size={16} />
          Voltar ao Início
        </button>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          
          {/* HEADER */}
          <div className="text-center mb-16 md:mb-24 space-y-6">
            <span className="inline-block px-4 py-1 bg-champagne/10 text-champagne font-mono text-[10px] md:text-xs tracking-widest uppercase rounded-full border border-champagne/20">
              Degustação Finalizada ✨
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-ivory tracking-tighter leading-[1] max-w-4xl">
              Escolha sua licença e domine o mercado.
            </h1>
            <p className="text-ivory/50 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
              Você já viu o potencial. Agora desbloqueie o ensaio completo em Alta Definição e receba os arquivos originais instantaneamente.
            </p>
          </div>

          {/* PRICING GRID */}
          <div className="grid md:grid-cols-3 gap-8 w-full max-w-6xl items-start">
            {PACKAGES.map((pkg) => {
              const isSelected = selectedPkgId === pkg.id;
              const totalSelected = Object.values(subThemeCounts || {}).reduce((a, b) => a + b, 0);
              const remaining = pkg.limit - totalSelected;
              const isComplete = totalSelected === pkg.limit;

              return (
                <div 
                  key={pkg.id} 
                  className={`group relative bg-[#0a0a0e]/60 backdrop-blur-2xl border p-8 md:p-10 rounded-[3rem] flex flex-col justify-between transition-all duration-500 hover:scale-[1.03] ${
                    isSelected 
                      ? 'border-champagne bg-obsidian-gradient shadow-[0_0_50px_rgba(201,168,76,0.15)] scale-100 lg:scale-105 z-10' 
                      : 'border-white/5 hover:border-white/20'
                  }`}
                  onClick={() => !isSelected && handleSelectPkg(pkg.id)}
                >
                  {pkg.id === 'performance' && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-champagne text-obsidian text-[10px] md:text-xs font-black uppercase tracking-widest rounded-full shadow-xl">
                      MAIS POPULAR
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className={`text-2xl md:text-3xl font-bold mb-2 tracking-tight ${isSelected ? 'text-champagne' : 'text-ivory'}`}>{pkg.name}</h4>
                      <p className={`text-sm font-medium ${isSelected ? 'text-champagne/80' : 'text-ivory/40'}`}>
                        🔥 {pkg.limit} Fotos em Altíssima Qualidade
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <div className="text-4xl md:text-5xl font-black flex items-baseline">
                        <span className="text-lg opacity-40 font-light mr-1">R$</span>
                        {pkg.price}
                      </div>
                    </div>

                    {!isSelected ? (
                      <ul className="space-y-4 pt-4">
                        <li className="flex items-center gap-3 text-sm text-ivory/70">
                          <div className="w-5 h-5 rounded-full bg-champagne/10 flex items-center justify-center text-champagne text-[10px]">✓</div>
                          Fotos de Altíssima Qualidade
                        </li>
                        <li className="flex items-center gap-3 text-sm text-ivory/70">
                          <div className="w-5 h-5 rounded-full bg-champagne/10 flex items-center justify-center text-champagne text-[10px]">✓</div>
                          Escolha de Cenários Favoritos
                        </li>
                        <li className="flex items-center gap-3 text-sm text-ivory/70">
                          <div className="w-5 h-5 rounded-full bg-champagne/10 flex items-center justify-center text-champagne text-[10px]">✓</div>
                          Multi-Temas Disponíveis
                        </li>
                      </ul>
                    ) : (
                      <div className="pt-4 space-y-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        
                        {/* SELETOR DE TEMA DENTRO DO CARD */}
                        <div className="flex flex-col gap-1.5">
                           <span className="text-[9px] font-mono uppercase tracking-widest text-ivory/30 ml-1">Tema Principal</span>
                           <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
                              {Object.keys(SUBTHEMES_MAP).map(t => (
                                <button 
                                  key={t}
                                  onClick={() => {
                                    setTheme(t);
                                    setAvailableSubthemes(SUBTHEMES_MAP[t]);
                                    setSubThemeCounts({});
                                  }}
                                  className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-tight rounded-md transition-all ${theme === t ? 'bg-champagne text-obsidian shadow-lg' : 'text-ivory/40 hover:text-ivory/80'}`}
                                >
                                  {t}
                                </button>
                              ))}
                           </div>
                        </div>

                        <div className="flex justify-between items-center bg-white/5 p-2.5 rounded-xl border border-white/5">
                           <span className="text-[9px] font-mono uppercase tracking-widest text-ivory/30">Faltam</span>
                           <span className={`text-xs font-bold ${remaining === 0 ? 'text-green-400' : 'text-champagne'}`}>
                              {remaining} fotos
                           </span>
                        </div>

                        <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                           {availableSubthemes.map(sub => {
                             const count = subThemeCounts[sub.id] || 0;
                             return (
                               <div key={sub.id} className="flex items-center justify-between p-2.5 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                 <span className="text-[11px] font-semibold text-ivory/70">{sub.name}</span>
                                 <div className="flex items-center gap-3">
                                   <button
                                     onClick={() => updateCount(sub.id, -1, pkg.limit)}
                                     className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center disabled:opacity-20 transition-all"
                                     disabled={count === 0}
                                   >
                                     <Minus size={12} />
                                   </button>
                                   <span className="font-mono text-xs font-bold w-3 text-center">{count}</span>
                                   <button
                                     onClick={() => updateCount(sub.id, 1, pkg.limit)}
                                     className="w-7 h-7 rounded-full bg-champagne text-obsidian hover:scale-105 flex items-center justify-center disabled:opacity-20 transition-all"
                                     disabled={remaining === 0}
                                   >
                                     <Plus size={12} />
                                   </button>
                                 </div>
                               </div>
                             );
                           })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) {
                          handleSelectPkg(pkg.id);
                        } else {
                          handlePayment(pkg);
                        }
                      }}
                      disabled={isSelected && !isComplete}
                      className={`w-full py-4 rounded-2xl font-black transition-all uppercase tracking-widest text-xs border shadow-lg ${
                        isSelected 
                          ? isComplete 
                            ? 'bg-champagne text-obsidian border-champagne hover:scale-[1.02] shadow-champagne/20' 
                            : 'bg-white/5 text-ivory/30 border-white/5 cursor-not-allowed shadow-none'
                          : 'bg-white/5 text-ivory hover:bg-white/10 border-white/10 hover:border-champagne/50'
                      }`}
                    >
                      {isSelected ? isComplete ? 'Finalizar Pagamento' : 'Selecione os Cenários' : 'Selecionar Pacote'}
                    </button>
                    <p className="text-center text-[10px] text-white/20 mt-4 font-mono tracking-tighter uppercase">
                      Pagamento Único. Sem Assinatura.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SECURITY BADGES */}
          <div className="mt-24 flex flex-wrap justify-center gap-8 md:gap-16 opacity-30 grayscale hover:opacity-100 transition-opacity">
             <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🔒</span>
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Ambiente Seguro</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Garantia Vyxfotos</span>
             </div>
             <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">⚡</span>
                <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Entrega Instantânea</span>
             </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full py-12 text-center text-ivory/20 bg-[#050508] border-t border-white/5 relative z-10">
         <p className="font-bold text-ivory/40 text-xl mb-2 font-drama italic">Vyxfotos.IA</p>
         <p className="text-[10px] font-mono uppercase tracking-[0.3em]">A Revolução Digital</p>
      </footer>
    </div>
  );
}
