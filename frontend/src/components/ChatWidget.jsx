import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, User, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'https://vyxfotos-backend.onrender.com';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou o Assistente Oficial da Vyxfotos.IA. Como posso ajudar você hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newMessages })
      });

      if (response.status === 429) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Desculpe, recebemos muitas mensagens no momento. Para a segurança do nosso sistema, por favor, tente novamente em alguns minutos.' 
        }]);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Houve um pequeno problema ao conectar com minha base de dados. Pode tentar novamente?' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Botão Minimizado */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-14 h-14 bg-champagne rounded-full shadow-[0_0_20px_rgba(201,168,76,0.3)] hover:scale-105 hover:shadow-[0_0_30px_rgba(201,168,76,0.5)] transition-all duration-300 flex items-center justify-center text-obsidian overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 rounded-full transition-transform duration-300 origin-center"></div>
          <MessageCircle size={24} className="relative z-10" />
          <span className="absolute -top-1 -right-1 bg-red-500 w-3 h-3 rounded-full border-2 border-obsidian animate-pulse"></span>
        </button>
      )}

      {/* Janela Expandida */}
      <div 
        className={`absolute bottom-0 right-0 w-80 sm:w-96 h-[500px] bg-obsidian-gradient border border-white/10 shadow-2xl rounded-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-75 opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-black/40 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80" 
                alt="Suporte" 
                className="w-10 h-10 rounded-full object-cover border-2 border-champagne/30 shadow-[0_0_15px_rgba(201,168,76,0.15)]"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-obsidian rounded-full"></span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-ivory tracking-tight">Ana - Suporte Vyxfotos</h3>
              <p className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                Online
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-ivory/60 hover:text-ivory transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1 overflow-hidden ${
                msg.role === 'user' ? 'bg-white/10 text-ivory' : 'border border-champagne/20 shadow-sm'
              }`}>
                {msg.role === 'user' ? (
                  <User size={12} />
                ) : (
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80" alt="Ana" className="w-full h-full object-cover" />
                )}
              </div>
              <div className={`p-3 text-sm rounded-2xl leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-champagne text-obsidian rounded-tr-sm font-medium' 
                  : 'bg-black/50 text-ivory/90 rounded-tl-sm border border-white/5'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-7 h-7 rounded-full flex-shrink-0 border border-champagne/20 overflow-hidden mt-1 shadow-sm">
                <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80" alt="Ana" className="w-full h-full object-cover" />
              </div>
              <div className="p-3 text-sm rounded-2xl bg-black/50 text-ivory/60 rounded-tl-sm border border-white/5 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-ivory/40 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-ivory/40 animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-ivory/40 animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-black/40 border-t border-white/5">
          <form 
            onSubmit={handleSend}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 focus-within:border-champagne/50 focus-within:bg-white/10 transition-colors"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida..."
              className="flex-1 bg-transparent text-sm text-ivory placeholder-ivory/30 px-3 py-2 outline-none"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-lg bg-champagne text-obsidian flex items-center justify-center disabled:opacity-30 disabled:bg-white/10 disabled:text-ivory/30 hover:scale-105 transition-all"
            >
              <Send size={14} className={input.trim() && !isLoading ? 'ml-0.5' : ''} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[9px] font-mono uppercase tracking-widest text-ivory/20">
              IA Treinada Oficial • VyxFotos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
