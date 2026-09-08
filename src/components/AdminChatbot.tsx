import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Headset, X, Send, Loader2, Bot, User, Settings, Sparkles, Terminal } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
}

interface AdminChatbotProps {
  onActionSuccess?: () => void;
}

const AdminChatbot: React.FC<AdminChatbotProps> = ({ onActionSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: 'Halo Admin! Saya Asisten Operasional Anda. Butuh bantuan memperbarui status pesanan atau inventaris stok produk hari ini?'
    }
  ]);

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [history, isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: textToSend };
    setHistory(prev => [...prev, userMessage]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('token');

      const response = await axios.post(
        '/api/admin/chat',
        { message: textToSend, history: history },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const botMessage: ChatMessage = {
        role: 'model',
        parts: response.data.reply
      };

      setHistory(prev => [...prev, botMessage]);

      if (response.data.dbUpdated && onActionSuccess) {
        onActionSuccess();
      }
    } catch (error: any) {
      console.error("Error Admin Chatbot:", error);
      let errorMsg = 'Maaf, terjadi kendala komunikasi dengan server database.';
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMsg = 'Sesi akses Anda tidak valid atau telah kedaluwarsa. Silakan masuk ulang.';
      }
      setHistory(prev => [...prev, { role: 'model', parts: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Cek pesanan yang belum diproses",
    "Produk apa yang stoknya menipis?",
    "Berapa total transaksi hari ini?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end gap-3 pointer-events-none select-none">
      
      {/* ======================================================== */}
      {/* 1. ADMIN CHAT WINDOW                                     */}
      {/* ======================================================== */}
      <div
        className={`
          w-[360px] sm:w-[380px] h-[540px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col
          transition-all duration-300 ease-out origin-bottom-right transform
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-8 pointer-events-none h-0'
          }
        `}
      >
        {/* Header */}
        <div className="bg-slate-950 p-4 flex justify-between items-center text-white border-b border-white/10 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Terminal size={17} />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">AI Asisten Operasional</h3>
              <div className="flex items-center gap-1.5 opacity-90 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight">Terhubung ke Database POS</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
            title="Tutup Obrolan (Esc)"
            aria-label="Tutup Obrolan"
          >
            <X size={18} />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/60 text-xs">
          {history.map((msg, index) => (
            <div key={index} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot size={14} className="text-amber-400" />
                </div>
              )}

              <div className={`max-w-[82%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`p-3.5 leading-relaxed shadow-2xs text-xs whitespace-pre-wrap ${
                    msg.role === 'user' 
                      ? 'bg-slate-950 text-white rounded-2xl rounded-tr-xs' 
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-xs'
                  }`}
                >
                  {msg.parts}
                </div>
                <span className="text-[10px] text-slate-400 font-medium px-1 mt-1">
                  {msg.role === 'user' ? 'Anda (Admin)' : 'Asisten Backoffice'}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-[11px]">
                  A
                </div>
              )}

            </div>
          ))}

          {/* Quick Prompt Chips (Shown when history is short) */}
          {history.length <= 2 && !isLoading && (
            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1">Instruksi Cepat:</span>
              <div className="flex flex-col gap-1.5">
                {quickPrompts.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-left text-[11px] p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-medium transition shadow-2xs"
                  >
                    &bull; {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} className="text-amber-400" />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-2xs flex items-center gap-2">
                <Loader2 size={14} className="text-amber-600 animate-spin" />
                <span className="text-xs text-slate-500 font-medium">Memproses data operasional...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full pr-1.5 pl-4 py-1 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-600 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Instruksikan aksi database..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-900 placeholder-slate-400 py-2 font-medium"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="bg-slate-950 hover:bg-slate-900 disabled:bg-slate-200 text-white p-2 rounded-full transition-colors shadow-2xs active:scale-95 shrink-0"
              aria-label="Kirim Instruksi"
            >
              <Send size={14} className={input.trim() && !isLoading ? 'translate-x-0.5 -translate-y-0.5 transition-transform' : ''} />
            </button>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 2. FLOATING TRIGGER BUTTON                               */}
      {/* ======================================================== */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          pointer-events-auto flex items-center justify-center w-14 h-14 rounded-2xl shadow-xl transition-all duration-200 active:scale-95
          ${isOpen 
            ? 'bg-slate-900 text-white' 
            : 'bg-slate-950 text-white hover:bg-slate-900 border border-white/10 shadow-slate-950/20'
          }
        `}
        aria-label={isOpen ? "Tutup AI asisten admin" : "Buka AI asisten admin"}
      >
        {isOpen ? <X size={22} /> : <Headset size={22} className="text-amber-400" />}
      </button>

    </div>
  );
};

export default AdminChatbot;
