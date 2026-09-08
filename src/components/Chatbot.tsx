import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, ShoppingCart, Sparkles, Check } from 'lucide-react';
import { getGeminiResponse } from '../services/geminiService';
import { useToast } from '../context/ToastContext';

interface ChatBotProps {
  products: any[];
  onAddToCart: (productId: number | string) => void;
}

interface ChatMessage {
  role: 'user' | 'model';
  parts: string;
  productIds?: string[];
}

const ChatBot: React.FC<ChatBotProps> = ({ products, onAddToCart }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedIds, setAddedIds] = useState<{ [key: string]: boolean }>({});

  const [history, setHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: 'Halo! Saya CS Virtual PT Radhika Narya Daruna. Ada spesifikasi kopra atau estimasi pengiriman komoditas kelapa yang ingin Anda tanyakan?',
      productIds: []
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

  const handleAddToCartClick = (id: number | string) => {
    onAddToCart(id);
    setAddedIds(prev => ({ ...prev, [String(id)]: true }));
    toast.success('Komoditas berhasil dimasukkan ke keranjang belanja!', 'Asisten CS');
    
    // Reset added check after 2 seconds
    setTimeout(() => {
      setAddedIds(prev => ({ ...prev, [String(id)]: false }));
    }, 2000);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', parts: input };
    setHistory(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const responseData = await getGeminiResponse(history, currentInput, products);

      const botMessage: ChatMessage = {
        role: 'model',
        parts: responseData.reply || responseData,
        productIds: responseData.productIds || (responseData.productId ? [responseData.productId] : [])
      };

      setHistory(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error Gemini CS:", error);
      setHistory(prev => [
        ...prev, 
        { 
          role: 'model', 
          parts: 'Maaf, koneksi layanan asisten sedang mengalami gangguan singkat. Silakan ajukan pertanyaan kembali atau hubungi WhatsApp resmi kami.', 
          productIds: [] 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60] font-sans flex flex-col items-end gap-3 pointer-events-none select-none">
      
      {/* ======================================================== */}
      {/* 1. CHAT WINDOW CONTAINER                                 */}
      {/* ======================================================== */}
      <div
        className={`
          w-[360px] sm:w-[380px] h-[540px] max-h-[82vh] bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col
          transition-all duration-300 ease-out origin-bottom-right transform pointer-events-auto
          ${isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-8 pointer-events-none h-0'
          }
        `}
      >
        {/* Header Bar */}
        <div className="bg-slate-950 p-4 flex justify-between items-center text-white border-b border-white/10 z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bot size={18} />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-white">CS Virtual Radhika</h3>
              <p className="text-[10px] text-slate-400 font-medium tracking-tight">Konsultasi Mutu & Stok B2B</p>
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

        {/* Chat History Messages */}
        <div className="flex-1 p-4 overflow-y-auto bg-slate-50/60 space-y-4 text-xs">
          {history.map((msg, idx) => (
            <div key={idx} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'model' && (
                <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  <Bot size={14} className="text-amber-400" />
                </div>
              )}

              <div className={`max-w-[82%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`p-3.5 leading-relaxed shadow-2xs text-xs ${
                    msg.role === 'user'
                      ? 'bg-slate-950 text-white rounded-2xl rounded-tr-xs'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-2xl rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.parts}</div>

                  {/* Product Cards Attachment */}
                  {msg.role === 'model' && msg.productIds && msg.productIds.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-2.5">
                      {msg.productIds.map((pid, pIdx) => {
                        const product = products.find(p => String(p.id) === String(pid));
                        if (!product) return null;
                        const isAdded = addedIds[String(pid)];

                        return (
                          <div 
                            key={pIdx} 
                            className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center gap-3 transition-all hover:bg-slate-100/70"
                          >
                            <img 
                              src={product.image || '/bannerbg.png'} 
                              alt={product.name} 
                              className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 shrink-0" 
                            />
                            
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block truncate">
                                {product.category}
                              </span>
                              <h5 className="font-bold text-slate-900 text-xs truncate leading-tight">
                                {product.name}
                              </h5>
                              <span className="font-bold text-amber-700 text-xs tabular-nums block mt-0.5">
                                Rp {product.price.toLocaleString('id-ID')}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddToCartClick(pid)}
                              className={`p-2 rounded-lg text-xs font-bold transition flex items-center justify-center shrink-0 ${
                                isAdded 
                                  ? 'bg-emerald-600 text-white' 
                                  : 'bg-slate-950 hover:bg-amber-600 text-white shadow-2xs active:scale-95'
                              }`}
                              title="Masukkan ke Keranjang"
                            >
                              {isAdded ? <Check size={15} /> : <ShoppingCart size={15} />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <span className="text-[10px] text-slate-400 font-medium px-1 mt-1">
                  {msg.role === 'user' ? 'Anda' : 'CS Virtual'}
                </span>
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5 shadow-2xs font-bold text-[11px]">
                  U
                </div>
              )}

            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Bot size={14} className="text-amber-400" />
              </div>
              <div className="bg-white border border-slate-200/80 px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-2xs flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-amber-600" />
                <span className="text-xs text-slate-500 font-medium">Menyusun jawaban spesifikasi...</span>
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
              placeholder="Tanyakan spesifikasi kadar air, stok..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-900 placeholder-slate-400 py-2 font-medium"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-2 bg-slate-950 hover:bg-slate-900 disabled:bg-slate-200 text-white rounded-full transition-colors shadow-2xs active:scale-95 shrink-0"
              aria-label="Kirim Pesan"
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
          pointer-events-auto flex items-center justify-center w-14 h-14 rounded-2xl shadow-xl transition-all duration-200 active:scale-95 group
          ${isOpen 
            ? 'bg-slate-900 text-white' 
            : 'bg-slate-950 text-white hover:bg-slate-900 border border-white/10 shadow-slate-950/20'
          }
        `}
        aria-label={isOpen ? "Tutup chat asisten" : "Buka chat asisten CS"}
      >
        {isOpen ? (
          <X size={22} />
        ) : (
          <div className="relative">
            <MessageCircle size={24} className="text-white group-hover:scale-105 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-slate-950" />
          </div>
        )}
      </button>

    </div>
  );
};

export default ChatBot;