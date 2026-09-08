import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Save, Lock, Eye, EyeOff, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.warning("Kata sandi baru minimal harus terdiri dari 6 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      toast.warning("Konfirmasi kata sandi tidak cocok. Silakan periksa kembali.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(`/api/reset-password/${token}`, { newPassword: password });
      toast.success("Kata sandi Anda berhasil diperbarui. Silakan masuk dengan kata sandi baru.", "Pembaruan Berhasil");
      navigate('/login');
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.error || "Token pemulihan tidak valid atau telah kedaluwarsa.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAF9] p-4 sm:p-6 text-slate-800 font-sans antialiased selection:bg-amber-600 selection:text-white relative">
      
      {/* Ambient Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/5 border border-slate-200/80 p-8 sm:p-10 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Back Link */}
        <Link 
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-200 transition">
            <ArrowLeft size={14} />
          </div>
          <span>Batal & Kembali ke Halaman Masuk</span>
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center mb-4">
            <Lock size={22} />
          </div>
          <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
            Atur Kata Sandi Baru
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Buat kombinasi kata sandi baru yang aman untuk akun kemitraan Anda.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleReset} className="space-y-4 text-xs">
          
          {/* Kata Sandi Baru */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Kata Sandi Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition shadow-2xs"
                required
                minLength={6}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                title={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
                aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Ulangi Kata Sandi Baru
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Ketik ulang kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition shadow-2xs"
                required
                minLength={6}
              />
            </div>
            {password && confirmPassword && password !== confirmPassword && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium">Kata sandi tidak cocok.</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-slate-950 hover:bg-slate-900 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition flex justify-center items-center gap-2 shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-amber-400" />
                  <span>Menyimpan Kata Sandi...</span>
                </>
              ) : (
                <>
                  <Save size={15} />
                  <span>Simpan Kata Sandi Baru</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Sistem keamanan akun PT Radhika Narya Daruna
          </p>
        </div>

      </div>

    </div>
  );
}
