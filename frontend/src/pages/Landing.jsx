import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ChevronDown, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth, db, provider, signInWithPopup } from '../firebase';
import { doc, setDoc, serverTimestamp, increment } from 'firebase/firestore';

gsap.registerPlugin(ScrollTrigger);

// Constantes
const THEMES = [
  { id: 'executivo', name: 'Poder Executivo', icon: '💼' },
  { id: 'luxo', name: 'Luxo Clássico', icon: '💎' },
  { id: 'sonhos', name: 'Fantasia & Sonhos', icon: '✨' },
  { id: 'aniversario', name: 'Aniversário VIP', icon: '🎉' },
];

import { PACKAGES } from '../constants/packages';

const TESTIMONIALS = [
  { name: "Mariana S.", role: "CEO", text: "Fiz um ensaio executivo e estou usando as fotos no LinkedIn. Todos acharam que paguei um fotógrafo caríssimo para o estúdio iluminado!", rating: "⭐⭐⭐⭐⭐" },
  { name: "João V.", role: "Pai da Clara", text: "Criei fotos de aniversário pra minha filha no tema princesa. O melhor investimento. Parece mágico como os traços são idênticos.", rating: "⭐⭐⭐⭐⭐" },
  { name: "Flávia R.", role: "Influenciadora", text: "As luzes, o cenário... é assustadoramente realista. Economizei pelo menos R$1.500 no meu ensaio de branding este mês.", rating: "⭐⭐⭐⭐⭐" },
];

const FAQS = [
  { q: "Como o serviço da Vyxfotos funciona?", a: "O processo é simples e autônomo. Você seleciona o cenário exato que deseja para a estética da sua marca, envia uma selfie sua com o rosto iluminado, e nós renderizamos o retrato. Assim que você confirmar a compra da licença que mais se adequa a você, as fotos originais em Alta Qualidade são liberadas imediatamente na sua Área do Cliente e também enviadas para o seu e-mail." },
  { q: "Qual o prazo para as fotos ficarem prontas?", a: "Imediatamente. Nosso servidor de Inteligência Artificial renderiza e escala seu ensaio fotográfico na nuvem em cerca de 5 a 15 minutos, após a confirmação do evento de pagamento." },
  { q: "Como eu recebo as fotos finais?", a: "As fotos Alta Qualidade puras e brutas chegarão como anexo direto no seu e-mail logo após a compra. Como segurança extra, elas também ficam salvas automaticamente na sua 'Área do Cliente' aqui no site para download a qualquer momento, sem depender da sua caixa de entrada." },
  { q: "Será que vai parecer comigo?", a: "Nossa tecnologia mapeia as micro-expressões únicas do seu rosto humano, absorvendo detalhes como formato, íris e traços estruturais. O resultado é assustadoramente idêntico a você, como se estivesse fisicamente no estúdio fotográfico de luxo." }
];

export default function Landing() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [customTheme, setCustomTheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [orderId, setOrderId] = useState(null); // Garantimos a comissão com parâmetro SRC
  const [isThankYouScreen, setIsThankYouScreen] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null); // Imagem REAL gerada pela IA
  const [user, setUser] = useState(null);
  const [countdown, setCountdown] = useState(60);
  const [gender, setGender] = useState('masculino'); // 'masculino' ou 'feminino'
  const [hasImageArrival, setHasImageArrival] = useState(false);
  // Lógica de Suspense: Só libera quando contador chegar a 0 E a imagem chegar
  useEffect(() => {
    let timer;
    if (isGenerating && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isGenerating && countdown === 0 && hasImageArrival) {
       // FINALMENTE LIBERA O RESULTADO - AGORA REDIRECIONA PARA CHECKOUT
       localStorage.setItem('vyx_generated_image', generatedImage);
       localStorage.setItem('vyx_order_id', orderId);
       setIsGenerating(false);
       setHasImageArrival(false);
       navigate('/checkout');
    }
    return () => clearInterval(timer);
  }, [isGenerating, countdown, hasImageArrival, generatedImage, orderId, navigate]);

  useEffect(() => {
    const BASE_API_URL = import.meta.env.VITE_API_URL || 'https://vyxfotos-backend.onrender.com';
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetch(`${BASE_API_URL}/api/register-lead`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            uid: currentUser.uid,
            email: currentUser.email,
            name: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
          }),
        }).catch(() => {});
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Escuta se a Kiwify redirecionou a gente de volta após a venda
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('checkout') && urlParams.get('checkout') === 'sucesso') {
       setIsThankYouScreen(true);
    }
  }, []);

  // Limpa todos os ScrollTriggers ao sair da Landing (evita tela preta nas outras páginas)
  useEffect(() => {
    return () => {
      ScrollTrigger.killAll();
    };
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
      case 'executivo': return '/executivo.png';
      case 'luxo': return '/luxo.png';
      case 'sonhos': return '/sonhos.png';
      case 'aniversario': return '/princesa.png';
      default: return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80';
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

    if (heroTextRef.current && heroTextRef.current.children) {
      gsap.fromTo(
        heroTextRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.2 }
      );
    }

    cardsRef.current.forEach((card, index) => {
      if (!card) return;
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

  // Salva lead no Firestore (cria ou incrementa tentativas)
  const saveLeadToFirestore = async (currentUser) => {
    if (!currentUser) return;
    try {
      const ref = doc(db, 'leads', currentUser.uid);
      await setDoc(ref, {
        uid: currentUser.uid,
        email: currentUser.email,
        name: currentUser.displayName || '',
        photoURL: currentUser.photoURL || '',
        createdAt: serverTimestamp(),
        attempts: increment(1),
        lastAttempt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn('Erro ao salvar lead:', e.message);
    }
  };

  const doLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      // Salva no Firestore (frontend) e no Google Sheets (via backend)
      await saveLeadToFirestore(u);
      const BASE_API_URL = import.meta.env.VITE_API_URL || 'https://vyxfotos-backend.onrender.com';
      fetch(`${BASE_API_URL}/api/register-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: u.uid, email: u.email, name: u.displayName || '', photoURL: u.photoURL || '' }),
      }).catch(() => {});
      return u;
    } catch (error) {
      console.error("Erro no login", error);
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        alert("O login foi bloqueado. Clique em 'Abrir no Navegador' (Chrome/Safari) para continuar.");
      } else {
        alert("Erro de conexão. Tente abrir o site fora do Instagram/Facebook.");
      }
      return null;
    }
  };

  const handleNextStep = async () => {
    if (!user) {
      const loggedUser = await doLogin();
      if (loggedUser) { setStep(2); window.scrollTo(0, 0); }
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleThemeSelect = async (themeId) => {
    if (!user) {
      await doLogin();
      return;
    }
    setSelectedTheme(themeId);
    if (themeId !== 'sonhos' && themeId !== 'custom') {
      setCustomTheme("");
    }
  };

  const handleUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // ── Verificação localStorage (camada extra contra troca de IP/4G) ──
      const VYX_LIMIT = 3;
      const VYX_COOLDOWN_MS = 15 * 60 * 1000;
      const storedCount = parseInt(localStorage.getItem('vyx_attempt_count') || '0');
      const storedLast = parseInt(localStorage.getItem('vyx_attempt_last') || '0');
      const elapsed = Date.now() - storedLast;

      if (storedCount >= VYX_LIMIT && elapsed < VYX_COOLDOWN_MS) {
        navigate('/planos');
        return;
      }
      // Reset contador se cooldown passou
      if (elapsed >= VYX_COOLDOWN_MS) {
        localStorage.setItem('vyx_attempt_count', '0');
      }

      setIsGenerating(true);
      setCountdown(60);
      setGeneratedImage(null);
      setStep(3);
      window.scrollTo(0, 0);

      try {
        const formData = new FormData();
        formData.append('selfieFile', file);
        formData.append('theme', selectedTheme);
        formData.append('customTheme', customTheme);
        formData.append('gender', gender);
        if (user) {
          formData.append('uid', user.uid);
          formData.append('userEmail', user.email || '');
          formData.append('userName', user.displayName || '');
          formData.append('userPhoto', user.photoURL || '');
        }

        const BASE_API_URL = import.meta.env.VITE_API_URL || 'https://vyxfotos-backend.onrender.com';

        const response = await fetch(`${BASE_API_URL}/api/generate`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          // Incrementa contador localStorage
          const newCount = parseInt(localStorage.getItem('vyx_attempt_count') || '0') + 1;
          localStorage.setItem('vyx_attempt_count', String(newCount));
          localStorage.setItem('vyx_attempt_last', String(Date.now()));

          setOrderId(result.data.orderId);
          setGeneratedImage(result.data.output_url);

          localStorage.setItem('vyx_generated_image', result.data.output_url);
          localStorage.setItem('vyx_order_id', result.data.orderId);
          localStorage.setItem('vyx_theme', selectedTheme);

          setHasImageArrival(true);
        } else {
          setIsGenerating(false);

          if (response.status === 429) {
            localStorage.setItem('vyx_attempt_count', String(VYX_LIMIT));
            localStorage.setItem('vyx_attempt_last', String(Date.now()));
            navigate('/planos');
            return;
          }

          const errorMsg = result.detail || result.error || "Erro desconhecido";
          alert(`Erro no Motor de Imagens:\n${errorMsg}`);
        }

      } catch (error) {
        console.error("Erro ao chamar o servidor Backend:", error);
        setIsGenerating(false);
      }
    }
  };

  const isContinueEnabled = (selectedTheme === 'custom' || selectedTheme === 'sonhos') 
    ? customTheme.trim().length > 3 
    : selectedTheme !== null;

  return (
    <div ref={containerRef} className="min-h-screen text-ivory font-sans selection:bg-champagne selection:text-obsidian relative overflow-x-hidden bg-[#050508]">
      
      {/* GLOBAL CINEMATIC BACKGROUND EXTENDS ACROSS ALL THE SITE */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80')] bg-cover bg-center md:bg-fixed opacity-25 md:opacity-15 filter blur-[2px]"></div>
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian/20 to-obsidian/80"></div>
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;utf8,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.06] mix-blend-overlay pointer-events-none"></div>
      </div>

      {/* NAVBAR: VOLTADO PARA TEXTO CONFORME PEDIDO */}
      <nav id="navbar" className="relative md:fixed top-0 w-full z-50 py-4 md:py-5 transition-all duration-500 ease-in-out px-6 md:px-12 flex justify-between items-center bg-[#050508] md:bg-transparent">
        <div className="text-xl md:text-2xl font-black tracking-tight text-ivory cursor-pointer flex items-center" onClick={() => setStep(1)}>
          Vyxfotos<span className="text-champagne ml-1">.</span>IA
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <a
            href="https://www.instagram.com/vyxfotos.ia/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[10px] md:text-sm font-mono tracking-widest uppercase text-ivory/60 hover:text-champagne transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Instagram
          </a>
          <button onClick={() => navigate('/cliente')} className="text-[10px] md:text-sm font-mono tracking-widest uppercase text-ivory/60 hover:text-champagne transition-colors relative z-10">
            Área do Cliente
          </button>
        </div>
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
                    <p className="text-ivory/80 text-sm md:text-base">Pós-Processamento e Upscale para <span className="font-bold">Alta Definição (Alta Qualidade)</span>.</p>
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
            <section className="min-h-[100dvh] pt-8 md:pt-16 pb-16 flex flex-col justify-start items-center relative px-4 md:px-6 w-full overflow-hidden">
              <div ref={heroTextRef} className="max-w-4xl mx-auto text-center space-y-2 z-10 w-full mt-0">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-ivory tracking-tighter leading-[1.05]">
                  ENSAIOS DE ALTO PADRÃO<br/> gerados a partir de uma <br/>
                  <span className="font-drama italic text-champagne font-black drop-shadow-2xl">SIMPLES SELFIE.</span>
                </h1>

                {/* CHAMADA DE TESTE GRÁTIS - LOGO ABAIXO DO TÍTULO */}
                <div className="flex justify-center pt-2 pb-4">
                  <div className="px-6 py-2 rounded-full border-2 border-champagne bg-obsidian/40 backdrop-blur-md shadow-[0_0_15px_rgba(201,168,76,0.4)] animate-pulse">
                    <span className="text-champagne font-black text-sm md:text-base tracking-widest uppercase flex items-center gap-2">
                       Faça o teste de graça 👇
                    </span>
                  </div>
                </div>
                
                <p className="text-xs md:text-base text-ivory/60 max-w-2xl mx-auto font-light leading-snug">
                  Esqueça estúdios e fotógrafos. Renderize fotos corporativas, festas infantis ou artísticas com absoluta e perfeita resolução Alta Qualidade em 3 minutos.
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
                      onClick={() => handleThemeSelect(t.id)}
                      className={`cursor-pointer group flex items-center justify-center gap-2 p-3 md:p-4 rounded-xl border transition-all duration-300 hover:scale-[1.03] ${
                        selectedTheme === t.id ? 'bg-champagne border-champagne text-obsidian shadow-[0_0_20px_rgba(201,168,76,0.3)]' : 'bg-white/5 border-white/5 text-ivory hover:border-champagne/50'
                      }`}
                    >
                      <span className="text-xl md:text-2xl group-hover:-translate-y-1 transition-transform">{t.icon}</span>
                      <span className="font-bold text-xs md:text-sm tracking-wide text-left">{t.name}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-10 mb-4">
                   <p className="text-ivory/30 text-[10px] md:text-xs font-mono font-bold tracking-[0.2em] uppercase">
                      Ou se preferir, digite seu tema abaixo, especificando-o:
                   </p>
                </div>

                <div className="mt-2 flex flex-col items-center">
                  <div className={`relative w-full max-w-lg p-[1px] rounded-[15px] transition-all duration-500 ${
                      (selectedTheme === 'custom' || selectedTheme === 'sonhos') 
                        ? 'bg-gradient-to-r from-champagne via-yellow-500 to-champagne animate-shimmer shadow-[0_0_20px_rgba(201,168,76,0.3)]' 
                        : 'bg-white/10 opacity-40 hover:opacity-100'
                    }`}>
                    <div className="bg-[#0a0a0e] rounded-[14px] flex items-center p-1 md:p-2">
                      <span className="text-lg ml-2 mr-2">
                        {selectedTheme === 'sonhos' ? '✨' : '🎨'}
                      </span>
                      <input 
                        type="text" 
                        placeholder={
                          selectedTheme === 'sonhos' 
                            ? "Qual o seu sonho? Ex: Voando no espaço..." 
                            : "Ou se preferir, digite seu tema específico aqui..."
                        }
                        value={customTheme}
                        onChange={(e) => { 
                          setCustomTheme(e.target.value); 
                          // Se ele começar a digitar, e não tiver tema, seleciona o custom
                          if (!selectedTheme || (selectedTheme !== 'sonhos' && selectedTheme !== 'custom')) {
                            setSelectedTheme('custom');
                          }
                        }}
                        className="w-full py-2 px-2 text-ivory text-sm bg-transparent outline-none rounded-xl placeholder:text-ivory/30"
                      />
                    </div>
                  </div>
                  {(selectedTheme === 'sonhos' || selectedTheme === 'custom') && customTheme.trim().length <= 3 && (
                    <p className="text-[10px] text-champagne mt-2 font-bold animate-pulse">
                      Descreva com pelo menos 4 letras para prosseguir 👇
                    </p>
                  )}
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
            <section ref={philosophyRef} className="w-full py-16 md:py-32 px-6 relative flex flex-col items-center justify-center border-t border-white/5 bg-transparent">
               <div className="max-w-5xl mx-auto text-center flex flex-col items-center">
                 <h2 className="phil-reveal text-xl md:text-3xl text-ivory/60 font-light max-w-3xl leading-relaxed mb-4">
                   A maioria dos estúdios foca em cenários caros, sessões de horas e a cobrança de milhares de reais por iluminação perfeita.
                 </h2>
                 <h3 className="phil-reveal mt-6 text-5xl md:text-7xl lg:text-8xl font-drama italic text-champagne drop-shadow-lg">
                   Nós produzimos resultados de cinema por R$ 34,90.
                 </h3>
               </div>
            </section>

            {/* SEÇÃO GALERIA DE RESULTADOS (PESSOAS FICTÍCIAS TOTALMENTE REALISTAS) */}
            <section className="w-full py-12 md:py-20 px-6 relative z-10 border-b border-white/5 pb-16 md:pb-32">
               <div className="max-w-6xl mx-auto text-center relative z-10">
                 <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-ivory">Nossa Renderização Orgânica</h2>
                 <p className="text-ivory/50 text-lg font-light mb-16 max-w-2xl mx-auto">Estas imagens não são fotografias originais. Elas foram sintetizadas completamente pela nossa I.A. a partir de simples selfies, com realismo fotográfico imperceptível (Luz, sombra, poros e imperfeições).</p>
                 
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {/* Imagem 1 - Mulher Corporativa / Executivo */}
                    <div className="relative group overflow-hidden rounded-[2rem] aspect-[3/4] border border-white/10 shadow-2xl bg-slate-900">
                      <div className="absolute inset-0 bg-[url('/executivo.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-left">
                         <span className="font-bold text-ivory text-sm">Poder Executivo</span>
                      </div>
                    </div>
                    {/* Imagem 2 - Luxo Clássico */}
                    <div className="relative group overflow-hidden rounded-[2rem] aspect-[3/4] border border-white/10 shadow-2xl bg-slate-900 md:mt-8">
                      <div className="absolute inset-0 bg-[url('/luxo.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-left">
                         <span className="font-bold text-ivory text-sm">Luxo Clássico</span>
                      </div>
                    </div>
                    {/* Imagem 3 - Fantasia & Sonhos */}
                    <div className="relative group overflow-hidden rounded-[2rem] aspect-[3/4] border border-white/10 shadow-2xl bg-slate-900">
                      <div className="absolute inset-0 bg-[url('/sonhos.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-left">
                         <span className="font-bold text-ivory text-sm">Fantasia & Sonhos</span>
                      </div>
                    </div>
                    {/* Imagem 4 - Aniversário VIP */}
                    <div className="relative group overflow-hidden rounded-[2rem] aspect-[3/4] border border-white/10 shadow-2xl bg-slate-900 md:mt-8">
                      <div className="absolute inset-0 bg-[url('/princesa.png')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 text-left">
                         <span className="font-bold text-ivory text-sm">Aniversário VIP</span>
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
                     <p className="text-lg md:text-xl text-ivory/70 max-w-xl">Sem semanas de espera para edição. Suas fotografias são pós-produzidas e entregues em alta resolução Ultra Alta Qualidade quase instantaneamente.</p>
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
                      <div className={`px-6 overflow-hidden transition-all duration-500 ease-in-out ${openFaq === i ? 'max-h-60 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <p className="text-ivory/60 leading-relaxed font-light">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
             </section>

            {/* FOOTER */}
             <footer className="w-full py-16 text-center text-ivory/40 bg-transparent border-t border-white/5 space-y-4">
                <p className="font-bold text-ivory text-xl mb-1 font-drama italic">Vyxfotos.IA</p>
                <div className="flex flex-col items-center gap-6">
                  <p className="text-[10px] font-mono uppercase tracking-[0.3em]">A Revolução Digital</p>
                  <button 
                    onClick={() => navigate('/contato')}
                    className="px-6 py-2 rounded-full border border-white/10 text-[10px] font-mono uppercase tracking-widest hover:bg-white/5 hover:border-champagne/50 hover:text-champagne transition-all"
                  >
                    Fale Conosco
                  </button>
                </div>
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
              
              {/* SELETOR DE GÊNERO */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs font-mono tracking-[0.2em] uppercase text-ivory/40">Você é:</p>
                <div className="flex gap-3 p-1 bg-black/40 rounded-full border border-white/10">
                  <button
                    id="gender-masculino"
                    onClick={() => setGender('masculino')}
                    className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                      gender === 'masculino'
                        ? 'bg-champagne text-obsidian shadow-[0_0_15px_rgba(201,168,76,0.4)]'
                        : 'text-ivory/50 hover:text-ivory'
                    }`}
                  >
                    👔 Masculino
                  </button>
                  <button
                    id="gender-feminino"
                    onClick={() => setGender('feminino')}
                    className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
                      gender === 'feminino'
                        ? 'bg-champagne text-obsidian shadow-[0_0_15px_rgba(201,168,76,0.4)]'
                        : 'text-ivory/50 hover:text-ivory'
                    }`}
                  >
                    👗 Feminino
                  </button>
                </div>
              </div>

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

        {/* PASSO 3: TELA DE CARREGAMENTO (LOADING) */}
        {step === 3 && isGenerating && (
          <div className="w-full min-h-screen flex items-center justify-center pt-20 px-6 animate-fade-in relative z-10">
            <div className="flex flex-col items-center justify-center min-h-[50vh] bg-[#0a0a0e]/60 p-10 md:p-16 rounded-[3rem] backdrop-blur-2xl border border-white/10 shadow-2xl transition-all">
               <div className="relative mb-8">
                  <div className="w-24 h-24 border-4 border-white/5 border-t-champagne rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-champagne text-xl">
                     {countdown}s
                  </div>
               </div>
               <h2 className="text-xl md:text-2xl font-bold text-ivory text-center mb-2">Estamos gerando sua foto...</h2>
               <p className="text-ivory/60 font-light text-center max-w-xs md:max-w-md">Aguarde um momento enquanto nossa IA renderiza seus traços com perfeição.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
