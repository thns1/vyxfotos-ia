import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PACKAGES } from '../constants/packages';
import { auth } from '../firebase';

export default function Checkout() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedPkgId, setSelectedPkgId] = useState('p7'); // Performance selecionado por padrão

  useEffect(() => {
    // Escuta estado do usuário
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    // Carrega dados do Checkout do LocalStorage (Persistência F5)
    const savedImage = localStorage.getItem('vyx_generated_image');
    const savedOrderId = localStorage.getItem('vyx_order_id');

    if (savedImage && savedOrderId) {
      setGeneratedImage(savedImage);
      setOrderId(savedOrderId);
    } else {
      // Se não tem nada salvo, volta pra home
      navigate('/');
    }

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('vyx_generated_image');
    localStorage.removeItem('vyx_order_id');
    window.location.href = '/';
  };

  if (!generatedImage) return null;

  return (
    <div className="min-h-screen bg-[#050508] text-ivory font-sans selection:bg-champagne selection:text-obsidian relative overflow-x-hidden">
      {/* GLOBAL CINEMATIC BACKGROUND */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/60 via-transparent to-[#050508]/80 opacity-60 z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,168,76,0.15),transparent_70%)] z-10"></div>
        <img src="/hero-bg.jpg" alt="Cinematic Studio Background" className="w-full h-full object-cover opacity-50 grayscale contrast-125 scale-110 blur-[1px]" />
      </div>

      {/* NAVBAR SIMPLIFICADA */}
      <nav className="relative md:fixed top-0 w-full z-50 py-4 md:py-5 px-6 md:px-12 flex justify-between items-center border-b border-white/5 bg-[#0a0a0e]/80 backdrop-blur-xl">
        <div className="text-xl md:text-2xl font-black tracking-tight text-ivory cursor-pointer" onClick={() => window.location.href = '/'}>
          Vyxfotos<span className="text-champagne ml-1">.</span>IA
        </div>
        <div className="flex items-center gap-6">
           <button onClick={() => window.location.href = '/'} className="text-[10px] md:text-sm font-mono tracking-widest uppercase text-ivory/60 hover:text-champagne transition-colors">
              Nova Foto
           </button>
           {user && (
             <button onClick={handleLogout} className="text-[10px] md:text-sm font-mono tracking-widest uppercase text-white/30 hover:text-red-400 transition-colors">
               SAIR
             </button>
           )}
        </div>
      </nav>

      <main className="w-full min-h-screen pt-32 pb-20 px-6 animate-fade-in relative z-10 flex flex-col items-center">
        <div className="max-w-6xl mx-auto w-full flex flex-col items-center space-y-16 md:space-y-24 bg-[#050508]/60 p-6 md:p-16 rounded-[2rem] md:rounded-[4rem] border border-white/5 backdrop-blur-xl">
          
          {/* Cabeçalho do Checkout */}
          <div className="text-center space-y-6 max-w-3xl">
            <span className="inline-block px-4 py-1 bg-green-500/10 text-green-400 font-mono text-xs md:text-sm tracking-widest uppercase rounded-full border border-green-500/20">
              SÍNTESE CONCLUÍDA ✨
            </span>
            <h2 className="text-4xl md:text-7xl font-black text-ivory tracking-tighter">O resultado é visceral.</h2>
            <p className="text-ivory/60 text-lg md:text-xl font-light leading-relaxed">Seu projeto de alta definição foi concluído. Liberamos uma prévia restrita abaixo, selecione sua licença para desbloquear os arquivos originais.</p>
          </div>

          {/* Grid: Imagem + Tabela Kiwify */}
          <div className="w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Esquerda: A Imagem Protegida */}
            <div className="relative w-full max-w-md mx-auto aspect-[4/5] bg-black rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group select-none">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                style={{ backgroundImage: `url(${generatedImage})` }}
              ></div>
              
              {/* Marca d'água Anti-Cópia */}
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 z-10 overflow-hidden">
                <div className="w-[200%] h-[200%] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 opacity-40 flex flex-col justify-center items-center gap-12 pointer-events-none">
                   {[...Array(12)].map((_, rowIndex) => (
                     <div key={`row-${rowIndex}`} className="flex gap-8 whitespace-nowrap">
                       {[...Array(10)].map((_, colIndex) => (
                         <span key={`col-${colIndex}`} className="text-3xl font-black text-white/50 tracking-[0.3em] font-drama uppercase mix-blend-overlay">VYXFOTOS</span>
                       ))}
                     </div>
                   ))}
                </div>

                <span className="absolute bottom-10 px-6 py-3 bg-obsidian/90 backdrop-blur-md border border-white/10 rounded-full text-[10px] md:text-xs font-mono tracking-widest text-white/80 z-20 shadow-2xl">
                  Ensaio de Corpo Inteiro | Ativo Protegido
                </span>
              </div>
            </div>

            {/* Direita: Tabela/Cards da Kiwify */}
            <div className="w-full flex flex-col space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2 text-center md:text-left text-ivory">Escolha seu pacote</h3>
               {PACKAGES.map((pkg) => (
                <div 
                  key={pkg.id} 
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-between transition-all w-full border cursor-pointer ${
                    selectedPkgId === pkg.id 
                      ? 'bg-[#121217] border-champagne shadow-[0_0_30px_rgba(201,168,76,0.15)] scale-100 lg:scale-105 z-10' 
                      : 'bg-[#0a0a0e] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4 md:mb-6">
                    <div>
                      <h4 className={`text-xl md:text-2xl font-bold tracking-tight ${selectedPkgId === pkg.id ? 'text-champagne' : 'text-ivory'}`}>{pkg.name}</h4>
                      <p className="text-ivory/40 text-xs md:text-sm mt-1 mb-2">🔥 {pkg.limit} Fotos 4K</p>
                    </div>
                    <div className={`text-2xl md:text-4xl font-black ${selectedPkgId === pkg.id ? 'text-champagne' : 'text-ivory'}`}>
                      <span className="text-lg mr-1 opacity-50 font-light">R$</span>{pkg.price}
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => {
                       e.stopPropagation();
                       window.location.href = `${pkg.link}?src=${orderId}`;
                    }}
                    className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all uppercase text-xs md:text-sm ${
                      selectedPkgId === pkg.id 
                        ? 'bg-champagne text-obsidian hover:bg-ivory shadow-lg' 
                        : 'bg-white/5 text-ivory hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    Quero esse pacote
                  </button>
                </div>
              ))}
              
              <p className="text-[10px] md:text-xs text-center text-ivory/30 mt-4 leading-relaxed uppercase tracking-tighter">
                Pagamento processado via Kiwify. Acesso imediato à área de download após aprovação.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
