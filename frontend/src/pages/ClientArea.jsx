import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, provider, signInWithPopup, signOut, db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export default function ClientArea() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Escutar autenticação e buscar dados caso logado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Buscar fotos do cliente no Firestore
        fetchClientOrders(currentUser.email);
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchClientOrders = async (email) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "marketing_orders"), 
        where("email", "==", email),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const userOrders = [];
      querySnapshot.forEach((doc) => {
        userOrders.push({ id: doc.id, ...doc.data() });
      });
      setOrders(userOrders);
    } catch (error) {
      console.error("Erro ao buscar fotos:", error);
      // Se não houver banco configurado ainda, evitamos travar a tela
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Erro no login", error);
      alert("Erro ao efetuar login pelo Google.");
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setOrders([]);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-ivory font-sans selection:bg-champagne selection:text-obsidian relative overflow-x-hidden">
        {/* Navbar Simplificado VIP */}
        <nav className="relative md:fixed top-0 w-full z-50 py-4 md:py-5 px-6 md:px-12 flex justify-between items-center border-b border-white/5 bg-[#0a0a0e]/80 backdrop-blur-xl">
            <div className="text-xl md:text-2xl font-black tracking-tight text-ivory cursor-pointer" onClick={() => navigate('/')}>
            Vyxfotos<span className="text-champagne ml-1">.</span>IA
            </div>
            {user ? (
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2 hidden md:flex">
                   <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-champagne" />
                   <span className="text-sm font-light text-ivory/80">{user.displayName}</span>
                </div>
                <button onClick={handleLogout} className="text-xs uppercase tracking-widest text-ivory/50 hover:text-red-400">
                  Sair
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/')} className="text-[10px] md:text-sm font-mono tracking-widest uppercase text-ivory/60 hover:text-champagne transition-colors">
                 Voltar Início
              </button>
            )}
        </nav>

        <main className="w-full pt-32 px-6 flex flex-col items-center">
            
            {/* TELA DE LOGIN */}
            {!user && !loading && (
               <div className="max-w-md w-full bg-[#0a0a0e]/60 border border-champagne/30 backdrop-blur-2xl p-10 md:p-14 rounded-[3rem] text-center shadow-2xl flex flex-col items-center">
                  <span className="text-6xl mb-6">📸</span>
                  <h1 className="text-3xl font-black text-ivory mb-2">Área do Cliente</h1>
                  <p className="text-ivory/60 text-sm font-light mb-10">Faça login com o e-mail que você utilizou no momento da compra para acessar as fotos em Ultra Definição (4K).</p>
                  
                  <button onClick={handleLogin} className="w-full flex items-center justify-center gap-3 bg-white text-black py-4 rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-xl">
                      <svg viewBox="0 0 24 24" className="w-6 h-6"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 15.02 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                      Entrar com Google
                  </button>
               </div>
            )}

            {/* DASHBOARD PRIVADO */}
            {user && (
               <div className="w-full max-w-6xl">
                 <div className="mb-12 md:mb-16">
                     <h2 className="text-3xl md:text-5xl font-black text-ivory tracking-tight mb-2">Painel de Imagens</h2>
                     <p className="text-ivory/60 text-lg font-light">Suas renderizações em Full-Res prontas para download.</p>
                 </div>

                 {loading ? (
                    <div className="flex flex-col items-center py-20">
                       <div className="w-12 h-12 border-4 border-white/10 border-t-champagne rounded-full animate-spin"></div>
                       <p className="text-champagne font-mono tracking-widest mt-6">Sincronizando com as redes neurais...</p>
                    </div>
                 ) : orders.length === 0 ? (
                    <div className="text-center py-32 bg-[#0a0a0e]/50 border border-white/5 rounded-3xl backdrop-blur-md">
                       <span className="text-6xl mb-4 block opacity-50">📂</span>
                       <h3 className="text-2xl font-bold text-ivory mb-2">Nenhum Pedido Encontrado.</h3>
                       <p className="text-ivory/50 font-light max-w-md mx-auto">Você ainda não possui projetos renderizados nesta conta ou as imagens estão sendo processadas no nosso servidor.</p>
                       <button onClick={() => navigate('/')} className="mt-8 text-champagne border border-champagne/50 hover:bg-champagne hover:text-obsidian py-3 px-8 rounded-full font-bold transition-all transition">Criar Meu Ensaio</button>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                       {orders.map((order) => (
                          <div key={order.id} className="bg-[#0a0a0e]/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl hover:border-champagne/50 transition-colors">
                             <div className="w-full aspect-[4/5] bg-obsidian relative">
                                <img src={order.fotoFinal} alt="Ensaio Final" className="w-full h-full object-cover" />
                             </div>
                             <div className="p-6">
                                <span className="text-[10px] text-champagne font-mono uppercase tracking-widest bg-champagne/10 px-3 py-1 rounded-full mb-3 inline-block">Projeto de IA</span>
                                <p className="text-sm text-ivory/60 font-light mb-4">Pedido entregue dia {new Date(order.timestamp).toLocaleDateString()}</p>
                                <a href={order.fotoFinal} target="_blank" rel="noreferrer" download className="w-full flex justify-center py-3 bg-white/5 hover:bg-champagne hover:text-black hover:font-bold border border-white/10 rounded-lg text-sm transition-all duration-300">
                                   Download High-Res 4K
                                </a>
                             </div>
                          </div>
                       ))}
                    </div>
                 )}
               </div>
            )}
        </main>
    </div>
  );
}
