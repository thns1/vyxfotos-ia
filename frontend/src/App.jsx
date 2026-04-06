import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronDown, Upload } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

// Constantes
const THEMES = [
  { id: 'aniversario', name: 'Aniversário VIP', icon: '🎉' },
  { id: 'jogador', name: 'Atleta de Elite', icon: '⚽' },
  { id: 'luxo', name: 'Luxo Clássico', icon: '💎' },
  { id: 'executivo', name: 'Poder Executivo', icon: '💼' },
];

const PACKAGES = [
  { id: 'p5', name: 'Essencial', limit: 5, price: '19,90', link: 'https://pay.kiwify.com.br/TFhEPp5' },
  { id: 'p7', name: 'Performance', limit: 7, price: '29,90', popular: true, link: 'https://pay.kiwify.com.br/QKuA1rr' },
  { id: 'p12', name: 'Enterprise', limit: 12, price: '49,90', link: 'https://pay.kiwify.com.br/PYxMyzy' },
];

const TESTIMONIALS = [
  { name: "Mariana S.", role: "CEO", text: "Fiz um ensaio executivo e estou usando as fotos no LinkedIn. Todos acharam que paguei um fotógrafo caríssimo para o estúdio iluminado!", rating: "⭐⭐⭐⭐⭐" },
  { name: "João V.", role: "Pai da Clara", text: "Criei fotos de aniversário pra minha filha no tema princesa. O melhor investimento. Parece mágico como os traços são idênticos.", rating: "⭐⭐⭐⭐⭐" },
  { name: "Flávia R.", role: "Influenciadora", text: "As luzes, o cenário... é assustadoramente realista. Economizei pelo menos R$1.500 no meu ensaio de branding este mês.", rating: "⭐⭐⭐⭐⭐" },
];

const FAQS = [
  { q: "Qual o prazo para as fotos ficarem prontas?", a: "Imediatamente. Nosso servidor de IA renderiza seu ensaio fotográfico em cerca de 3 minutos, após a confirmação do pagamento Kiwify." },
  { q: "Como eu recebo as fotos finais?", a: "Você receberá o acesso exclusivo e o link para download direto no seu e-mail assim que o pagamento for aprovado." },
  { q: "Será que vai parecer comigo?", a: "Nossa tecnologia mapeia as micro-expressões do seu rosto. O resultado é idêntico a você, como se estivesse fisicamente no cenário." }
];

export default function App() {
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [customTheme, setCustomTheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [orderId, setOrderId] = useState(null); // Guarantimos a comissão com parametro SRC
  const [isThankYouScreen, setIsThankYouScreen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null); // Imagem REAL cuspidada pela IA

  useEffect(() => {
    // Escuta se a Kiwify redirecionou a gente de volta após a venda
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('checkout') && urlParams.get('checkout') === 'sucesso') {
       setIsThankYouScreen(true);
    }
  }, []);

  const containerRef = useRef(null);
  const heroTextRef = useRef(null);
  const philosophyRef = useRef(null);
  const stackContainerRef = useRef(null);
  const cardsRef = useRef([]);

  // Retorna uma imagem fictícia que combina perfeitamente com o tema escolhido para a fase de "borrão/teste"
  const getPreviewImage = () => {
    if (generatedImage) return generatedImage; // Se a IA já gerou a sua foto real, mostra a SUA FOTO REAL com a marca d'água!
    
    switch(selectedTheme) {
      case 'aniversario': return 'https://images.unsplash.com/photo-1518806118471-f28b20a1d79d?auto=format&fit=crop&q=80'; // Princesa
      case 'jogador': return 'https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&q=80'; // Esporte/Estádio
      case 'luxo': return 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80'; // Beauty Clássico
      case 'executivo': return 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80'; // Terno corporativo
      default: return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80'; // Um borrão criativo mágico/metálico para temas customizados
    }
  };

  // GSAP Animacoes - Executam apenas na Landing Page (step 1)
  useGSAP(() => {
    if (step !== 1) return;

    ScrollTrigger.create({
      start: 'top -50',
      end: 99999,
      toggleClass: {className: 'bg-obsidian/80 backdrop-blur-xl border-b border-white/10', targets: '#navbar'}
    });

    gsap.fromTo(
      heroTextRef.current.children,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.2 }
    );

    cardsRef.current.forEach((card, index) => {
      ScrollTrigger.create({
        trigger: card,
        start: "top 15%",
        endTrigger: stackContainerRef.current,
        end: "bottom bottom",
        pin: true,
        pinSpacing: false,
        animation: gsap.to(card, {
          scale: 0.9,
          opacity: 0.4,
          filter: "blur(20px)",
          ease: "none",
        }),
        scrub: true,
      });
    });

    gsap.fromTo(".phil-reveal", 
      { opacity: 0, y: 40 },
      { scrollTrigger: { trigger: philosophyRef.current, start: "top 60%" }, opacity: 1, y: 0, duration: 1, stagger: 0.3, ease: "power4.out" }
    );
  }, { dependencies: [step], scope: containerRef });

  const handleNextStep = () => {
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      setIsGenerating(true);
      setGeneratedImage(null); // Limpa gerações antigas
      setStep(3); // Mostra as telas rodando
      window.scrollTo(0, 0);

      try {
        const formData = new FormData();
        formData.append('selfieFile', file);
        formData.append('theme', selectedTheme);
        formData.append('customTheme', customTheme);

        // Comunicação Real com a nova API Backend
        const response = await fetch('http://localhost:3001/api/generate', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if(result.success) {
           console.log("Sucesso no Processamento Neural: ", result.data);
           // Armazena o Protocolo para não perder o link do cliente e o dinheiro!
           setOrderId(result.data.orderId);
           setGeneratedImage(result.data.output_url); // INJETA FOTO REAL!
           // Libera para o cliente visualizar a imagem borrada e comprar a original
           setIsGenerating(false);
        } else {
           console.error("Backend Error:", result.error);
           setIsGenerating(false);
           alert("Houve um erro no servidor de Imagens da Vyxfotos.");
        }

      } catch (error) {
        console.error("Erro ao chamar o servidor Backend (Ele pode estar desligado):", error);
        // Desbloqueia pros testes continuarem caso o backend n esteja rodando direito
        setIsGenerating(false);
      }
    }
  };

  const isContinueEnabled = selectedTheme === 'custom' ? customTheme.trim().length > 2 : selectedTheme !== null;

  return (
    <div ref={containerRef} className="min-h-screen text-ivory font-sans selection:bg-champagne selection:text-obsidian relative overflow-x-hidden bg-[#050508]">
      
      {/* GLOBAL CINEMATIC BACKGROUND EXTENDS ACROSS ALL THE SITE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80')] bg-cover bg-center bg-fixed opacity-15 filter blur-[2px]"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian/20 to-obsidian/70"></div>
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.04] mix-blend-overlay pointer-events-none"></div>
      </div>

      {/* NAVBAR */}
      <nav id="navbar" className="fixed top-0 w-full z-50 py-5 transition-all duration-500 ease-in-out px-6 md:px-12 flex justify-between items-center bg-transparent">
        <div className="text-2xl font-black tracking-tight text-ivory cursor-pointer flex items-center" onClick={() => setStep(1)}>
          Vyxfotos<span className="text-champagne ml-1">.</span>IA
        </div>
        <button className="text-sm font-mono tracking-widest uppercase text-ivory/60 hover:text-champagne transition-colors relative z-10">
          Area do Cliente
        </button>
      </nav>

      <main className="w-full flex flex-col items-center relative z-10">
        
        {/* ============================================================== */}
        {/* TELA DE OBRIGADO (PÓS COMPRA KIWIFY)                           */}
        {/* ============================================================== */}
        {isThankYouScreen && (
          <div className="w-full min-h-[90vh] flex flex-col justify-center items-center text-center px-4 relative z-20">
            <div className="bg-[#0a0a0e]/80 border border-champagne/40 backdrop-blur-2xl p-10 md:p-16 rounded-[3rem] shadow-[0_0_80px_rgba(201,168,76,0.15)] max-w-3xl">
              <span className="text-6xl mb-6 block">✨</span>
              <h2 className="text-4xl md:text-5xl font-black text-ivory mb-4">Pagamento Aprovado.</h2>
              <p className="text-xl text-ivory/60 mb-8 font-light">
                O seu projeto foi oficialmente engatilhado nos servidores de inteligência artificial da <span className="text-champagne font-bold">Vyxfotos</span>.
              </p>
              
              <div className="bg-black/30 w-full p-6 text-left rounded-2xl border border-white/5 space-y-4 shadow-inner mb-8">
                 <div className="flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-full bg-champagne text-obsidian flex justify-center items-center font-bold">1</div>
                    <p className="text-ivory/80 text-sm md:text-base">Mapeamento em andamento. Nossas redes neurais estão ajustando seus poros e características faciais ao cenário.</p>
                 </div>
                 <div className="flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-full bg-champagne text-obsidian flex justify-center items-center font-bold">2</div>
                    <p className="text-ivory/80 text-sm md:text-base">Pós-Processamento e Upscale para <span className="font-bold">Alta Definição (4K)</span>.</p>
                 </div>
                 <div className="flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-full bg-champagne text-obsidian flex justify-center items-center font-bold">3</div>
                    <p className="text-ivory/80 text-sm md:text-base">Entrega Confidencial via <span className="font-bold text-champagne">E-mail</span> cadastrado no Checkout dentro de 5 a 15 minutos.</p>
                 </div>
              </div>

              <button onClick={() => { setIsThankYouScreen(false); window.location.search = ''; setStep(1); }} className="px-8 py-3 uppercase font-mono tracking-widest text-xs border border-white/20 rounded-full hover:bg-white/10 transition">
                 Voltar ao Início
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PASSO 1: LANDING PAGE & ESCOLHA DO TEMA                      */}
        {/* ============================================================== */}
        {step === 1 && !isThankYouScreen && (
          <div className="w-full">
            
            {/* HERO SECTION OPTIMIZED (100vh NO SCROLL GUARANTEED) */}
            <section className="h-[100dvh] min-h-[600px] flex flex-col justify-center items-center relative px-4 md:px-6 w-full overflow-hidden">
              <div ref={heroTextRef} className="max-w-4xl mx-auto text-center space-y-2 z-10 w-full mt-10 md:mt-16">
                <div className="inline-block px-3 py-1 border border-white/10 rounded-full bg-white/5 backdrop-blur-md mb-2">
                  <span className="text-[10px] md:text-xs font-mono text-champagne uppercase tracking-[0.2em] font-bold">I.A. RENDERIZADORA 🟢</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-ivory tracking-tighter leading-[1.05]">
                  ENSAIOS DE ALTO PADRÃO<br/> gerados a partir de uma <br/>
                  <span className="font-drama italic text-champagne font-black drop-shadow-2xl">SIMPLES SELFIE.</span>
                </h1>
                
                <p className="text-sm md:text-lg text-ivory/60 max-w-2xl mx-auto font-light leading-snug pt-2">
                  Esqueça estúdios e fotógrafos. Renderize fotos corporativas, festas infantis ou artísticas com absoluta e perfeita resolução 4k em 3 minutos.
                </p>
              </div>

              {/* PASSO A PASSO INTUITIVO COMPACTO */}
              <div className="max-w-4xl mx-auto w-full mt-6 mb-4 grid grid-cols-3 gap-2 md:gap-4 text-center z-20 relative">
                 <div className="flex flex-col items-center justify-center bg-[#0a0a0e]/60 border border-champagne/30 py-2 md:py-3 rounded-xl backdrop-blur-sm">
                    <h3 className="font-bold text-ivory text-xs md:text-sm flex items-center gap-1 md:gap-2"><span className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-champagne text-obsidian flex items-center justify-center text-[10px] md:text-xs">1</span> <span className="hidden md:inline">Escolha o</span> Cenário</h3>
                 </div>
                 <div className="flex flex-col items-center justify-center bg-[#0a0a0e]/60 border border-white/5 py-2 md:py-3 rounded-xl backdrop-blur-sm">
                    <h3 className="font-bold text-ivory/60 text-xs md:text-sm flex items-center gap-1 md:gap-2"><span className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-white/20 text-ivory/50 flex items-center justify-center text-[10px] md:text-xs">2</span> <span className="hidden md:inline">Envie uma</span> Foto</h3>
                 </div>
                 <div className="flex flex-col items-center justify-center bg-[#0a0a0e]/60 border border-white/5 py-2 md:py-3 rounded-xl backdrop-blur-sm">
                    <h3 className="font-bold text-ivory/60 text-xs md:text-sm flex items-center gap-1 md:gap-2"><span className="w-5 h-5 md:w-6 md:h-6 rounded-full border border-white/20 text-ivory/50 flex items-center justify-center text-[10px] md:text-xs">3</span> I.A. <span className="hidden md:inline">Renderiza</span></h3>
                 </div>
              </div>

              {/* SELETOR DE TEMAS LUXE */}
              <div className="max-w-4xl mx-auto p-4 md:p-6 bg-[#0a0a0e]/60 backdrop-blur-2xl rounded-[1.5rem] border border-white/10 shadow-2xl shadow-black/80 z-20 w-full relative mb-10">
                <h2 className="text-base md:text-xl font-bold text-center mb-4 tracking-tight">Qual a Direção Estética do Ensaio? 👇</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {THEMES.map((t) => (
                    <div 
                      key={t.id}
                      onClick={() => { setSelectedTheme(t.id); setCustomTheme(""); }}
                      className={`cursor-pointer group flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl border transition-all duration-300 hover:scale-[1.03] ${
                        selectedTheme === t.id ? 'bg-champagne border-champagne text-obsidian shadow-[0_0_20px_rgba(201,168,76,0.3)]' : 'bg-white/5 border-white/5 text-ivory hover:border-champagne/50'
                      }`}
                    >
                      <span className="text-xl md:text-2xl group-hover:-translate-y-1 transition-transform">{t.icon}</span>
                      <span className="font-bold text-xs md:text-sm tracking-wide text-left">{t.name}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-col items-center">
                  <div className={`relative w-full max-w-lg p-[1px] rounded-[15px] transition-all ${
                      selectedTheme === 'custom' ? 'bg-gradient-to-r from-champagne to-yellow-600' : 'bg-white/10'
                    }`}>
                    <div className="bg-[#0a0a0e] rounded-[14px] flex items-center p-1 md:p-2">
                      <span className="text-lg ml-2 mr-2">✨</span>
                      <input 
                        type="text" 
                        placeholder="Ex: Ensaio de Bebê Recém Nascido..."
                        value={customTheme}
                        onChange={(e) => { 
                          setCustomTheme(e.target.value); 
                          setSelectedTheme('custom'); 
                        }}
                        className="w-full py-2 px-2 text-ivory text-sm bg-transparent outline-none rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <button 
                    disabled={!isContinueEnabled}
                    onClick={handleNextStep}
                    className="w-full max-w-sm py-3 md:py-4 flex items-center justify-center gap-2 bg-champagne text-obsidian font-black rounded-full shadow-[0_0_30px_rgba(201,168,76,0.2)] hover:shadow-[0_0_30px_rgba(201,168,76,0.5)] transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none text-sm md:text-base tracking-wider"
                  >
                    <span>Avançar para o Passo 2</span>
                    <span className="text-lg md:text-xl transition-transform group-hover:translate-x-1">→</span>
                  </button>
                </div>
              </div>
            </section>

            {/* SEÇÃO FILOSOFIA */}
            <section ref={philosophyRef} className="w-full py-32 px-6 relative flex flex-col items-center justify-center border-t border-white/5 bg-transparent">
               <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
                 <h2 className="phil-reveal text-xl md:text-3xl text-ivory/60 font-light max-w-3xl leading-relaxed mb-4">
                   A maioria dos estúdios foca em cenários caros, sessões de horas e a cobrança de milhares de reais por iluminação perfeita.
                 </h2>
                 <h3 className="phil-reveal mt-6 text-5xl md:text-7xl lg:text-8xl font-drama italic text-champagne drop-shadow-lg">
                   Nós produzimos resultados de cinema por R$ 19,90.
                 </h3>
               </div>
            </section>

            {/* SEÇÃO GALERIA DE RESULTADOS (PESSOAS FICTÍCIAS TOTALMENTE REALISTAS) */}
            <section className="w-full py-20 px-6 relative z-10 border-b border-white/5 pb-32">
               <div className="max-w-6xl mx-auto text-center relative z-10">
                 <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-ivory">Nossa Renderização Orgânica</h2>
                 <p className="text-ivory/50 text-lg font-light mb-16 max-w-2xl mx-auto">Estas imagens não são fotografias originais. Elas foram sintetizadas completamente pela nossa I.A. a partir de simples selfies, com realismo fotográfico imperceptível (Luz, sombra, poros e imperfeições).</p>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Imagem 1 - Mulher Corporativa muito Realista, poros naturais */}
                    <div className="relative group overflow-hidden rounded-[2rem] aspect-[3/4] border border-white/10 shadow-2xl bg-slate-900">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-left">
                         <span className="font-bold text-ivory text-sm">Escritório Premium</span>
                      </div>
                    </div>
                    {/* Imagem 2 - Criança estilo Princesa */}
                    <div className="relative group overflow-hidden rounded-[2rem] aspect-[3/4] border border-white/10 shadow-2xl bg-slate-900 md:mt-8">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518806118471-f28b20a1d79d?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-left">
                         <span className="font-bold text-ivory text-sm">Aniversário VIP (Princesa)</span>
                      </div>
                    </div>
                    {/* Imagem 3 - Recém nascido Newborn (Emocional) */}
                    <div className="relative group overflow-hidden rounded-[2rem] aspect-[3/4] border border-white/10 shadow-2xl bg-slate-900">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566004100631-35d015d6a491?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-left">
                         <span className="font-bold text-ivory text-sm">Ensaio Newborn Premium</span>
                      </div>
                    </div>
                    {/* Imagem 4 - Homem sorrindo */}
                    <div className="relative group overflow-hidden rounded-[2rem] aspect-[3/4] border border-white/10 shadow-2xl bg-slate-900 md:mt-8">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-left">
                         <span className="font-bold text-ivory text-sm">Casual Premium</span>
                      </div>
                    </div>
                 </div>
               </div>
            </section>

            {/* PROTOCOLO: CARDS EMPILHÁVEIS */}
            <section className="w-full px-6 py-20 pb-[10vh] bg-transparent">
               <div className="max-w-4xl mx-auto text-center mb-20 text-ivory">
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight">O Protocolo Vyxfotos</h2>
               </div>
               
               <div ref={stackContainerRef} className="relative w-full">
                  <div ref={el => cardsRef.current[0] = el} className="w-full max-w-4xl mx-auto h-[60vh] bg-[#121217] rounded-[3rem] p-12 md:p-20 shadow-2xl flex flex-col justify-center mb-8 border border-white/10 relative overflow-hidden">
                     <span className="absolute top-10 right-10 font-mono text-champagne text-xl">01</span>
                     <h3 className="text-4xl md:text-6xl font-black mb-6">Custos Reduzidos.</h3>
                     <p className="text-lg md:text-xl text-ivory/70 max-w-xl">Sem aluguel de estúdio. Sem fotógrafo físico. Nós eliminamos todos os gargalos para te entregar um projeto de luxo a um centésimo do preço normal.</p>
                  </div>
                  
                  <div ref={el => cardsRef.current[1] = el} className="w-full max-w-4xl mx-auto h-[60vh] bg-obsidian rounded-[3rem] p-12 md:p-20 shadow-2xl flex flex-col justify-center mb-8 border border-champagne/30 relative overflow-hidden">
                     <span className="absolute top-10 right-10 font-mono text-champagne text-xl">02</span>
                     <h3 className="text-4xl md:text-6xl font-black mb-6">Mágica Exata.</h3>
                     <p className="text-lg md:text-xl text-ivory/70 max-w-xl">Redes neurais avançadas mapeiam as suas características faciais únicas para criar reflexos, luzes e sombras exatos em qualquer ambiente do mundo.</p>
                  </div>

                  <div ref={el => cardsRef.current[2] = el} className="w-full max-w-4xl mx-auto h-[60vh] bg-[#121217] rounded-[3rem] p-12 md:p-20 shadow-2xl flex flex-col justify-center mb-8 border border-white/10 relative overflow-hidden">
                     <span className="absolute top-10 right-10 font-mono text-champagne text-xl">03</span>
                     <h3 className="text-4xl md:text-6xl font-black mb-6">Rapidez Implacável.</h3>
                     <p className="text-lg md:text-xl text-ivory/70 max-w-xl">Sem semanas de espera para edição. Suas fotografias são pós-produzidas e entregues em alta resolução Ultra 4K quase instantaneamente.</p>
                  </div>
               </div>
            </section>

            {/* SEÇÃO TESTIMONIALS (O QUE DIZEM) */}
            <section className="w-full py-32 px-6 border-b border-t border-white/5 bg-transparent relative z-10">
               <div className="max-w-6xl mx-auto">
                 <h2 className="text-center text-4xl font-bold mb-16 tracking-tight">Eles Escolheram a I.A.</h2>
                 <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, idx) => (
                      <div key={idx} className="bg-[#0a0a0e]/60 backdrop-blur-md border border-white/5 p-10 rounded-[2rem] hover:border-champagne/30 transition-colors shadow-2xl">
                        <div className="text-sm mb-6 opacity-80">{t.rating}</div>
                        <p className="text-ivory/70 italic leading-relaxed mb-8">"{t.text}"</p>
                        <hr className="border-white/5 mb-6"/>
                        <p className="font-bold text-champagne">{t.name}</p>
                        <p className="text-sm font-mono uppercase tracking-widest text-ivory/30">{t.role}</p>
                      </div>
                    ))}
                 </div>
               </div>
            </section>

             {/* FAQ (Dúvidas Comuns) */}
             <section className="w-full max-w-3xl mx-auto py-32 px-6 bg-transparent relative z-10">
                <h2 className="text-center text-4xl font-bold mb-16 tracking-tight">Dúvidas Frequentes</h2>
                <div className="space-y-4">
                  {FAQS.map((faq, i) => (
                    <div key={i} className="bg-[#0a0a0e]/60 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden transition-all duration-300">
                      <button 
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex justify-between items-center p-6 text-left focus:outline-none"
                      >
                        <span className="font-semibold text-lg">{faq.q}</span>
                        <ChevronDown className={`transform transition-transform duration-300 ${openFaq === i ? 'rotate-180 text-champagne' : 'text-ivory/40'}`} />
                      </button>
                      <div className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${openFaq === i ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-ivory/60 leading-relaxed font-light">{faq.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </section>

            {/* FOOTER */}
            <footer className="w-full py-12 text-center text-ivory/40 bg-transparent border-t border-white/5">
               <p className="font-bold text-ivory text-xl mb-2 font-drama italic">Vyxfotos.IA</p>
               <p className="text-sm font-mono uppercase tracking-widest">A Revolução Digital</p>
            </footer>
          </div>
        )}

        {/* ============================================================== */}
        {/* PASSO 2: UPLOAD (Mantendo o luxo com fundo transparente)       */}
        {/* ============================================================== */}
        {step === 2 && !isThankYouScreen && (
          <div className="w-full min-h-screen flex items-center justify-center pt-20 px-6 animate-fade-in relative z-10">
            <div className="w-full max-w-xl text-center space-y-8 bg-[#0a0a0e]/60 backdrop-blur-3xl p-12 rounded-[3.5rem] border border-white/10 shadow-2xl">
              <h2 className="text-3xl font-black text-ivory">Forneça os Dados Biométricos.</h2>
              <p className="text-ivory/60">Para a renderização do cenário <b className="text-champagne">{selectedTheme === 'custom' ? customTheme : THEMES.find(t=>t.id===selectedTheme)?.name}</b>, anexe uma selfie limpa e iluminada de frente.</p>
              
              <div className="w-full p-12 border border-dashed border-champagne/40 rounded-[2.5rem] bg-black/30 hover:bg-champagne/10 hover:border-champagne transition-all duration-300 cursor-pointer relative group">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept="image/*"
                  onChange={handleUpload}
                />
                <div className="flex flex-col items-center justify-center space-y-6">
                  <div className="w-20 h-20 bg-champagne/10 text-champagne rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <span className="font-bold text-ivory text-xl tracking-tight">Anexar Fotografia</span>
                </div>
              </div>
              <button onClick={() => setStep(1)} className="mt-8 text-ivory/30 hover:text-ivory text-sm font-mono tracking-widest uppercase transition-colors">
                VOLTAR AO INÍCIO
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PASSO 3: GERAÇÃO FAKE E CHECKOUT (Tabela de Preços)            */}
        {/* ============================================================== */}
        {step === 3 && !isThankYouScreen && (
          <div className="w-full min-h-screen pt-32 pb-20 px-6 animate-fade-in relative z-10 flex flex-col items-center">
            
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] bg-black/50 p-16 rounded-full backdrop-blur-xl border border-white/5">
                 <div className="w-20 h-20 border-4 border-white/10 border-t-champagne rounded-full animate-spin mb-8"></div>
                 <h2 className="text-2xl font-mono uppercase tracking-widest text-champagne drop-shadow-lg">Renderizando Redes Neurais...</h2>
              </div>
            ) : (
              <div className="max-w-6xl mx-auto w-full flex flex-col items-center space-y-24 bg-[#050508]/60 p-10 md:p-16 rounded-[4rem] border border-white/5 backdrop-blur-xl">
                
                {/* Cabeçalho do Sucesso */}
                <div className="text-center space-y-6 max-w-3xl">
                  <span className="inline-block px-4 py-1 bg-green-500/10 text-green-400 font-mono text-sm tracking-widest uppercase rounded-full border border-green-500/20">
                    SÍNTESE CONCLUÍDA ✨
                  </span>
                  <h2 className="text-5xl md:text-7xl font-black text-ivory tracking-tighter">O resultado é visceral.</h2>
                  <p className="text-ivory/60 text-xl font-light">Seu projeto de alta definição foi concluído. Liberamos uma prévia restrita abaixo, selecione sua licença para desbloquear os arquivos originais.</p>
                </div>

                {/* Grid Duplo: Imagem Quase Nítida + Tabela Kiwify */}
                <div className="w-full grid lg:grid-cols-2 gap-16 lg:gap-10 items-center">
                  
                  {/* Esquerda: A Imagem Protegida (Nítida com Marca D'água Anti-Cópia) */}
                  <div className="relative w-full max-w-md mx-auto aspect-[4/5] bg-black rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group select-none pointer-events-none">
                    <div 
                      className="absolute inset-0 bg-cover bg-center filter brightness-100 group-hover:scale-105 transition-all duration-700"
                      style={{ backgroundImage: `url(${getPreviewImage()})` }}
                    ></div>
                    
                    {/* Malha de Marca d'água Anti-Cópia (Repeating Full Coverage) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 z-10 overflow-hidden rounded-[3rem]">
                      <div className="w-[200%] h-[200%] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 opacity-60 flex flex-col justify-center items-center gap-12 pointer-events-none">
                         {[...Array(12)].map((_, rowIndex) => (
                           <div key={`row-${rowIndex}`} className="flex gap-8 whitespace-nowrap">
                             {[...Array(10)].map((_, colIndex) => (
                               <span key={`col-${colIndex}`} className="text-4xl font-black text-white/40 tracking-[0.3em] font-drama uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mix-blend-overlay">VYXFOTOS</span>
                             ))}
                           </div>
                         ))}
                      </div>
                      <span className="absolute bottom-10 px-4 py-2 bg-obsidian/80 backdrop-blur-md border border-white/10 rounded-full text-xs font-mono tracking-widest text-white/80 z-20 shadow-xl">Ativo Protegido | Compre a Licença</span>
                    </div>
                  </div>

                  {/* Direita: Tabela/Cards da Kiwify */}
                  <div className="w-full flex flex-col space-y-6">
                    <h3 className="text-2xl font-bold tracking-tight mb-4 text-center md:text-left text-ivory">Pacotes Comerciais (Kiwify)</h3>
                     {PACKAGES.map((pkg) => (
                      <div key={pkg.id} className={`p-8 rounded-[2rem] flex flex-col justify-between transition-all w-full border ${
                        pkg.popular ? 'bg-[#121217] border-champagne shadow-[0_0_30px_rgba(201,168,76,0.15)] scale-100 lg:scale-105 z-10' : 'bg-[#0a0a0e] border-white/5 hover:border-white/20'
                      }`}>
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h4 className="text-2xl font-bold tracking-tight">{pkg.name}</h4>
                            <p className="text-ivory/40 text-sm mt-1">{pkg.limit} Ativos Digitais 4K</p>
                          </div>
                          <div className={`text-4xl font-black ${pkg.popular ? 'text-champagne' : 'text-ivory'}`}>
                            <span className="text-lg mr-1 opacity-50">R$</span>{pkg.price}
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => {
                             // Redireciona para o Kiwify do pacote escolhido enviando o rastreio (orderId)
                             if(pkg.link.includes('SUBSTITUIR_DEPOIS')) {
                               alert('Modo Desenvolvedor: Links da Kiwify ainda não configurados no código.');
                             } else {
                               window.location.href = `${pkg.link}?src=${orderId}`;
                             }
                          }}
                          className={`w-full py-4 rounded-xl font-bold tracking-wide transition-all uppercase text-sm ${
                           pkg.popular 
                            ? 'bg-champagne text-obsidian shadow-lg hover:bg-yellow-500 hover:scale-105' 
                            : 'bg-white/10 text-ivory hover:bg-white/20 hover:scale-[1.02]'
                        }`}>
                          Quero Esse Pacote
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
