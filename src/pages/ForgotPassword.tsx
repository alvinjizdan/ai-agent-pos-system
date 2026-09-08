import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, Send, KeyRound, CheckCircle2, Loader2, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function ForgotPassword() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post('/api/forgot-password', { username: username.trim() });
      setMessage(res.data.message || "Tautan pemulihan kata sandi telah dikirim ke alamat email terdaftar Anda.");
      toast.success("Tautan pemulihan telah dikirim ke email terdaftar.", "Instruksi Terkirim");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.error || "Username tidak ditemukan dalam sistem kami.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9] p-4 sm:p-6 text-slate-800 font-sans antialiased selection:bg-amber-600 selection:text-white relative">
      
      {/* Subtle Ambient Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/80 p-8 sm:p-10 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Back to Login Button */}
        <button 
          onClick={() => navigate('/login')} 
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-200 transition">
            <ArrowLeft size={14} />
          </div>
          <span>Kembali ke Halaman Masuk</span>
        </button>

        {/* Brand Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center mb-4">
            <KeyRound size={22} />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            Pemulihan Kata Sandi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Masukkan <b>Username</b> akun Anda. Sistem akan memverifikasi dan mengirimkan tautan reset kata sandi ke email terdaftar.
          </p>
        </div>

        {/* Success State */}
        {message ? (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-900 text-xs">
              <div className="flex items-center gap-2.5 font-bold text-emerald-950 mb-1.5">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                <span>Instruksi Berhasil Dikirim</span>
              </div>
              <p className="text-emerald-800 leading-relaxed pl-7">
                {message}
              </p>
              <p className="text-[11px] text-emerald-700/80 mt-3 pt-3 border-t border-emerald-200/60 pl-7">
                Periksa kotak masuk (inbox) atau folder spam pada email Anda dalam beberapa saat.
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-slate-950 hover:bg-slate-900 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-xs tracking-wide transition shadow-xs"
            >
              Kembali Masuk Akun
            </button>
          </div>
        ) : (
          /* Form Input Username */
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Username Terdaftar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input 
                  type="text" 
                  placeholder="Ketik username akun Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition shadow-2xs"
                  required
                  autoFocus
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !username.trim()}
              className="w-full mt-2 bg-slate-950 hover:bg-slate-900 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition flex justify-center items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-amber-400" />
                  <span>Mengirimkan Tautan...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Kirim Tautan Pemulihan</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Mengalami kendala pemulihan akun? Hubungi administrasi PT Radhika Narya Daruna via WhatsApp resmi.
          </p>
        </div>

      </div>

    </div>
  );
}