import { SUBTHEMES_MAP } from '../constants/themes';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Checkout() {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const [subThemeCounts, setSubThemeCounts] = useState({});
  const [theme, setTheme] = useState(null);
  const [availableSubthemes, setAvailableSubthemes] = useState([]);
  const [parsingDreams, setParsingDreams] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });

    const savedImage = localStorage.getItem('vyx_generated_image');
    const savedOrderId = localStorage.getItem('vyx_order_id');
    const savedTheme = localStorage.getItem('vyx_theme') || 'executivo';
    const savedDreamText = localStorage.getItem('vyx_custom_theme') || '';

    if (savedImage && savedOrderId) {
      setGeneratedImage(savedImage);
      setOrderId(savedOrderId);
      setTheme(savedTheme);

      if (savedTheme === 'sonhos') {
        // IA interpreta o texto do cliente — entende qualquer forma de escrita
        setParsingDreams(true);
        fetch(`${API_URL}/api/parse-dreams`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: savedDreamText }),
        })
          .then(r => r.json())
          .then(data => {
            const scenarios = data.scenarios || [savedDreamText];
            setAvailableSubthemes(
              scenarios.map((scenario, i) => ({
                id: `sonho_${i}`,
                name: scenario.charAt(0).toUpperCase() + scenario.slice(1),
                dreamText: scenario,
              }))
            );
          })
          .catch(() => {
            // Fallback simples se o backend falhar
            setAvailableSubthemes([{
              id: 'sonho_0',
              name: savedDreamText,
              dreamText: savedDreamText,
            }]);
          })
          .finally(() => setParsingDreams(false));
      } else {
        setAvailableSubthemes(SUBTHEMES_MAP[savedTheme] || []);
      }
    } else {
      navigate('/');
    }

    return () => unsubscribe();
  }, [navigate]);

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

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('vyx_generated_image');
    localStorage.removeItem('vyx_order_id');
    localStorage.removeItem('vyx_theme');
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
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent z-10 overflow-hidden pointer-events-none">

                <span className="absolute bottom-10 px-6 py-3 bg-obsidian/90 backdrop-blur-md border border-white/10 rounded-full text-[10px] md:text-xs font-mono tracking-widest text-white/80 z-20 shadow-2xl">
                  Ensaio de Corpo Inteiro | Ativo Protegido
                </span>
              </div>
            </div>

            {/* Direita: Tabela/Cards da Kiwify */}
            <div className="w-full flex flex-col space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-bold tracking-tight mb-2 text-center md:text-left text-ivory">Escolha seu pacote</h3>
              {PACKAGES.map((pkg) => {
                const isSelected = selectedPkgId === pkg.id;
                const totalSelected = Object.values(subThemeCounts || {}).reduce((a, b) => a + b, 0);
                const remaining = pkg.limit - totalSelected;
                const isComplete = totalSelected === pkg.limit;

                return (
                  <div
                    key={pkg.id}
                    onClick={() => !isSelected && handleSelectPkg(pkg.id)}
                    className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex flex-col justify-between transition-all w-full border cursor-pointer ${isSelected
                        ? 'bg-[#121217] border-champagne shadow-[0_0_30px_rgba(201,168,76,0.15)] scale-100 lg:scale-105 z-10'
                        : 'bg-[#0a0a0e] border-white/5 hover:border-white/20'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-4 md:mb-6">
                      <div>
                        <h4 className={`text-xl md:text-2xl font-bold tracking-tight ${isSelected ? 'text-champagne' : 'text-ivory'}`}>{pkg.name}</h4>
                        <p className="text-ivory/40 text-xs md:text-sm mt-1 mb-2">🔥 {pkg.limit} Fotos em Altíssima Qualidade</p>
                      </div>
                      <div className={`text-2xl md:text-4xl font-black ${isSelected ? 'text-champagne' : 'text-ivory'}`}>
                        <span className="text-lg mr-1 opacity-50 font-light">R$</span>{pkg.price}
                      </div>
                    </div>

                    {/* AREA DE ALOCAÇÃO DE SUBTEMAS */}
                    {isSelected && availableSubthemes.length > 0 && (
                      <div className="mb-6 p-4 bg-obsidian/50 rounded-xl border border-white/10" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                          <h5 className="font-bold text-sm tracking-widest text-ivory/80 uppercase">Como quer dividir?</h5>
                          <span className={`text-xs font-mono font-bold px-2 py-1 rounded-full ${remaining === 0 ? 'bg-green-500/20 text-green-400' : 'bg-champagne/10 text-champagne'}`}>
                            {remaining > 0 ? `Faltam ${remaining} foto(s)` : 'Completo ✅'}
                          </span>
                        </div>

                        <div className="space-y-3">
                          {parsingDreams ? (
                            <div className="flex items-center gap-3 py-2">
                              <div className="w-4 h-4 border-2 border-white/10 border-t-champagne rounded-full animate-spin flex-shrink-0"></div>
                              <span className="text-xs text-ivory/50 font-mono">Interpretando seu sonho...</span>
                            </div>
                          ) : availableSubthemes.map(sub => {
                            const count = subThemeCounts[sub.id] || 0;
                            return (
                              <div key={sub.id} className="flex items-center justify-between">
                                <span className="text-sm font-medium text-ivory/70">{sub.name}</span>
                                <div className="flex items-center gap-3">
                                  <button
                                    disabled={count === 0}
                                    onClick={() => updateCount(sub.id, -1, pkg.limit)}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center font-bold disabled:opacity-30 transition"
                                  >-</button>
                                  <span className="font-mono text-ivory font-bold w-4 text-center">{count}</span>
                                  <button
                                    disabled={remaining === 0}
                                    onClick={() => updateCount(sub.id, 1, pkg.limit)}
                                    className="w-8 h-8 rounded-full bg-champagne text-obsidian hover:scale-105 flex items-center justify-center font-bold disabled:opacity-30 transition"
                                  >+</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <button
                      disabled={isSelected && !isComplete}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSelected) {
                          handleSelectPkg(pkg.id);
                          return;
                        }
                        if (isComplete || availableSubthemes.length === 0) {
                          // Para sonhos: inclui o texto do sonho de cada subtema na URL
                          const varsText = Object.entries(subThemeCounts || {}).map(([k, v]) => {
                            if (theme === 'sonhos') {
                              const sub = availableSubthemes.find(s => s.id === k);
                              const encoded = encodeURIComponent(sub?.dreamText || k);
                              return `${k}[${encoded}]:${v}`;
                            }
                            return `${k}:${v}`;
                          }).join(',');
                          window.location.href = `${pkg.link}?src=${orderId}_vars_${varsText}`;
                        }
                      }}
                      className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all uppercase text-xs md:text-sm ${isSelected
                          ? isComplete || availableSubthemes.length === 0 ? 'bg-champagne text-obsidian hover:bg-ivory shadow-lg' : 'bg-white/10 text-ivory/30 cursor-not-allowed'
                          : 'bg-white/5 text-ivory hover:bg-white/10 border border-white/5 hover:border-champagne/40'
                        }`}
                    >
                      {isSelected && !isComplete ? 'Divida suas fotos acima ↑' : 'Quero esse pacote'}
                    </button>
                  </div>
                );
              })}

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
