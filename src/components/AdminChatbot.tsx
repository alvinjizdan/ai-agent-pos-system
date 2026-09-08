import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Headset, X, Send, Loader2, Bot, User, Settings } from 'lucide-react';

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
      parts: 'Halo Admin! Saya Asisten Operasional Anda. Ada produk atau status pesanan yang perlu saya perbarui hari ini?'
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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', parts: input };
    setHistory(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const token = sessionStorage.getItem('token');

      const response = await axios.post(
        '/api/admin/chat',
        { message: input, history: history },
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

      // Jika database diperbarui oleh agen, beri tahu parent (Dashboard) untuk refresh data
      if (response.data.dbUpdated && onActionSuccess) {
        onActionSuccess();
      }
    } catch (error: any) {
      console.error("Error Admin Chatbot:", error);
      let errorMsg = 'Maaf, terjadi kesalahan komunikasi dengan server.';
      if (error.response?.status === 401 || error.response?.status === 403) {
        errorMsg = 'Akses ditolak. Sesi Anda mungkin telah habis atau Anda bukan Admin.';
      }
      setHistory(prev => [...prev, { role: 'model', parts: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end gap-4 pointer-events-none">
      {/* WINDOW CHAT */}
      <div
        className={`
          w-[360px] h-[550px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col
          transition-all duration-300 ease-out origin-bottom-right transform
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-10 pointer-events-none h-0'
          }
        `}
      >
        {/* HEADER */}
        <div className="bg-slate-950 p-4 flex justify-between items-center text-white border-b border-white/10 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Settings size={18} className="animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">AI Operasional Admin</h3>
              <div className="flex items-center gap-1.5 opacity-90 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <p className="text-[10px] text-slate-400 font-medium tracking-tight">Sistem Terhubung</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* AREA PESAN */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 text-xs">
          {history.map((msg, index) => (
            <div key={index} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${msg.role === 'user' ? 'bg-amber-100 text-amber-800' : 'bg-slate-900 text-white'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>

              <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl shadow-2xs text-xs ${msg.role === 'user' ? 'bg-amber-600 text-white rounded-tr-xs' : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs leading-relaxed'}`}>
                  {msg.parts}
                </div>
                <span className="text-[10px] text-slate-400 font-medium px-1">
                  {msg.role === 'user' ? 'Anda (Admin)' : 'Asisten POS'}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-xs border border-slate-200/80 shadow-2xs flex items-center gap-2">
                <Loader2 size={14} className="text-amber-600 animate-spin" />
                <span className="text-xs text-slate-500 font-medium">Memproses database...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* INPUT AREA */}
        <div className="p-3 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full pr-1 pl-4 py-1 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-600 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Instruksikan asisten..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-800 placeholder-slate-400 py-2 font-medium"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 text-white p-2 rounded-full transition-colors shadow-xs"
            >
              <Send size={14} className={input.trim() && !isLoading ? 'translate-x-0.5 -translate-y-0.5 transition-transform' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* TOMBOL FLOATING */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          pointer-events-auto flex items-center justify-center w-13 h-13 rounded-2xl shadow-xl transition-all duration-200 active:scale-95
          ${isOpen ? 'bg-slate-900 text-white' : 'bg-slate-950 text-white hover:bg-slate-900 border border-white/10 shadow-slate-950/20'}
        `}
      >
        {isOpen ? <X size={22} /> : <Headset size={22} className="text-amber-400" />}
      </button>
    </div>
  );
};

export default AdminChatbot;
