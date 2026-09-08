import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { 
  Eye, EyeOff, ShieldCheck, ArrowRight, Lock, 
  Mail, User, Loader2, ArrowLeft, CheckCircle2, 
  Package, Truck, Clock, KeyRound, Send
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface LoginProps {
  initialMode?: 'login' | 'register' | 'forgot';
}

export default function Login({ initialMode = 'login' }: LoginProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Mode: 'login' | 'register' | 'forgot'
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>(() => {
    const queryMode = searchParams.get('mode');
    if (queryMode === 'forgot' || queryMode === 'register') return queryMode;
    return initialMode;
  });

  // Form State Login & Register
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State Forgot Password
  const [forgotUsername, setForgotUsername] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  // Handle Login & Register Submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'register') {
        await axios.post('/api/register', {
          username: username.trim(),
          email: email.trim(),
          password,
        });
        
        toast.success("Akun berhasil didaftarkan. Silakan masuk dengan kredensial Anda.", "Registrasi Sukses");
        setAuthMode('login');
        setPassword("");
      } else {
        const response = await axios.post('/api/login', {
          username: username.trim(),
          password
        });
        
        // Simpan sesi autentikasi ke sessionStorage
        sessionStorage.setItem('token', response.data.token);
        sessionStorage.setItem('role', response.data.role);
        sessionStorage.setItem('username', response.data.username);
        
        // Bersihkan token lama di localStorage jika ada
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        toast.success(`Selamat datang kembali, ${response.data.username}.`, "Autentikasi Berhasil");

        if (response.data.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast.error(error.response?.data?.error || "Gagal memproses autentikasi. Silakan periksa kembali data Anda.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password Submit in-place
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotMessage("");

    try {
      const res = await axios.post('/api/forgot-password', { username: forgotUsername.trim() });
      setForgotMessage(res.data.message || "Tautan pemulihan kata sandi telah dikirim ke alamat email terdaftar Anda.");
      toast.success("Tautan pemulihan telah dikirim ke email terdaftar.", "Instruksi Terkirim");
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.error || "Username tidak ditemukan dalam sistem kami.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full bg-slate-950 font-sans antialiased text-slate-800 selection:bg-amber-600 selection:text-white">
      
      {/* ======================================================== */}
      {/* LEFT COLUMN: BRAND STORY & ENTERPRISE VALUE (DESKTOP)   */}
      {/* ======================================================== */}
      <div className="hidden lg:flex lg:w-[48%] xl:w-[50%] bg-slate-950 relative flex-col justify-between p-12 xl:p-16 border-r border-white/10 overflow-hidden">
        
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-3xl pointer-events-none -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-800/40 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center p-1.5 backdrop-blur-md transition-transform group-hover:scale-105">
              <img src="/logobulet.png" alt="PT Radhika Narya Daruna" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <span className="text-base font-bold font-display tracking-tight text-white block leading-none">
                PT Radhika Narya Daruna
              </span>
              <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase block mt-1">
                Portal Kemitraan & Perdagangan B2B
              </span>
            </div>
          </Link>
        </div>

        {/* Middle Narrative */}
        <div className="relative z-10 max-w-lg my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-6 backdrop-blur-xs">
            <ShieldCheck size={14} />
            <span>Sistem Masuk Terverifikasi</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold font-display tracking-tight text-white leading-tight mb-4">
            Gerbang Transaksi Komoditas Kelapa Nusantara.
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Masuk untuk mengakses pemesanan tonase besar, pelacakan alur logistik gudang, dan sinkronisasi data inventaris operasional secara terpusat.
          </p>

          {/* 3 Real Value Points (Antislop: real evidence) */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Package size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Akses Katalog Prioritas</h4>
                <p className="text-xs text-slate-400 mt-0.5">Pembaruan harga komoditas terkini dan alokasi stok kopra/kelapa harian.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Truck size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Pelacakan Status Kontrak</h4>
                <p className="text-xs text-slate-400 mt-0.5">Pantau nomor resi logistik, jadwal muat gudang, dan invoice komoditas.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                <Clock size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dukungan Operasional Responsif</h4>
                <p className="text-xs text-slate-400 mt-0.5">Layanan bantuan langsung melalui tim administrasi dan chatbot terintegrasi.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-white/5">
          <span>Hak Cipta 2026 PT Radhika Narya Daruna</span>
          <Link to="/" className="hover:text-amber-400 transition flex items-center gap-1">
            <span>Kembali ke Beranda</span>
            <ArrowRight size={12} />
          </Link>
        </div>

      </div>

      {/* ======================================================== */}
      {/* RIGHT COLUMN: FOCUSED FORM PANEL (DESKTOP & MOBILE)     */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[52%] xl:w-[50%] bg-[#FAFAF9] flex flex-col justify-between p-6 sm:p-12 lg:p-16 min-h-screen overflow-y-auto">
        
        {/* Mobile Brand Bar */}
        <div className="flex items-center justify-between lg:hidden mb-8 pb-4 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logobulet.png" alt="Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold font-display text-sm text-slate-900 tracking-tight">PT Radhika Narya Daruna</span>
          </Link>
          <Link to="/" className="text-xs font-semibold text-slate-500 hover:text-amber-600 flex items-center gap-1">
            <ArrowLeft size={14} />
            <span>Beranda</span>
          </Link>
        </div>

        {/* Center Card */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          
          {/* ==================================================== */}
          {/* VIEW 1: FORGOT PASSWORD (PEMULIHAN KATA SANDI)       */}
          {/* ==================================================== */}
          {authMode === 'forgot' ? (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              
              {/* Back to Login Button */}
              <button 
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setForgotMessage("");
                }} 
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition group"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-200/80 flex items-center justify-center text-slate-600 group-hover:bg-slate-300 transition">
                  <ArrowLeft size={14} />
                </div>
                <span>Kembali ke Halaman Masuk</span>
              </button>

              {/* Icon & Title */}
              <div className="mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-700 flex items-center justify-center mb-4">
                  <KeyRound size={22} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                  Pemulihan Kata Sandi
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
                  Masukkan <b>Username</b> akun Anda. Sistem akan memverifikasi dan mengirimkan tautan reset kata sandi ke email terdaftar.
                </p>
              </div>

              {/* Success Message or Form */}
              {forgotMessage ? (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200/70 text-emerald-900 text-xs">
                    <div className="flex items-center gap-2.5 font-bold text-emerald-950 mb-1.5">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                      <span>Instruksi Berhasil Dikirim</span>
                    </div>
                    <p className="text-emerald-800 leading-relaxed pl-7">
                      {forgotMessage}
                    </p>
                    <p className="text-[11px] text-emerald-700/80 mt-3 pt-3 border-t border-emerald-200/60 pl-7">
                      Periksa kotak masuk (inbox) atau folder spam pada email Anda dalam beberapa saat.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setForgotMessage("");
                    }}
                    className="w-full bg-slate-950 hover:bg-slate-900 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-xs tracking-wide transition shadow-xs"
                  >
                    Kembali Masuk Akun
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-4 text-xs">
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
                        value={forgotUsername}
                        onChange={(e) => setForgotUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition shadow-2xs"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={forgotLoading || !forgotUsername.trim()}
                    className="w-full mt-2 bg-slate-950 hover:bg-slate-900 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition flex justify-center items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    {forgotLoading ? (
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

              {/* Bottom Support Note */}
              <div className="mt-8 pt-6 border-t border-slate-200/80 text-center">
                <p className="text-[11px] text-slate-400">
                  Mengalami kendala pemulihan akun? Hubungi administrasi PT Radhika Narya Daruna via WhatsApp resmi.
                </p>
              </div>

            </div>
          ) : (
            /* ==================================================== */
            /* VIEW 2: LOGIN & REGISTER                            */
            /* ==================================================== */
            <div className="animate-in fade-in duration-200">
              
              {/* Header Segmented Switcher */}
              <div className="mb-8">
                <div className="flex bg-slate-200/80 p-1 rounded-xl mb-6 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      authMode === 'login'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Masuk Akun
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      authMode === 'register'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Daftar Baru
                  </button>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
                  {authMode === 'register' ? "Buat Akun Pembeli Baru" : "Selamat Datang Kembali"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                  {authMode === 'register' 
                    ? "Lengkapi formulir berikut untuk membuat akun kemitraan resmi." 
                    : "Masukkan kredensial terdaftar untuk mengakses dashboard Anda."}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                
                {/* Username Input */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Username Akun
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User size={16} />
                    </div>
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition shadow-2xs"
                      placeholder="Masukkan username Anda"
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Email Input (Register Only) */}
                {authMode === 'register' && (
                  <div className="animate-in fade-in duration-200">
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Alamat Email Aktif
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail size={16} />
                      </div>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition shadow-2xs"
                        placeholder="nama@perusahaan.com"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-700">
                      Kata Sandi
                    </label>
                    {authMode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => {
                          setAuthMode('forgot');
                          setForgotUsername(username);
                          setForgotMessage("");
                        }}
                        className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline transition"
                      >
                        Lupa sandi?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock size={16} />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition shadow-2xs"
                      placeholder={authMode === 'register' ? "Minimal 6 karakter" : "Masukkan kata sandi"}
                      autoComplete={authMode === 'register' ? "new-password" : "current-password"}
                      required
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

                {/* Submit Button */}
                <div className="pt-3">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-slate-950 hover:bg-slate-900 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-xs tracking-wide transition-all shadow-md shadow-slate-950/10 flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-amber-400" />
                        <span>Memproses...</span>
                      </>
                    ) : (
                      <>
                        <span>{authMode === 'register' ? "Daftar Akun Kemitraan" : "Masuk ke Dashboard"}</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Switch Mode Text */}
                <div className="text-center pt-5 border-t border-slate-200/80">
                  <p className="text-xs text-slate-500">
                    {authMode === 'register' ? "Sudah memiliki akun terdaftar? " : "Belum memiliki akun kemitraan? "}
                    <button 
                      type="button"
                      onClick={() => {
                        setAuthMode(authMode === 'register' ? 'login' : 'register');
                        setPassword("");
                      }}
                      className="text-amber-700 font-bold hover:text-amber-800 hover:underline transition"
                    >
                      {authMode === 'register' ? "Masuk di sini" : "Daftar akun baru"}
                    </button>
                  </p>
                </div>

              </form>
            </div>
          )}

        </div>

        {/* Privacy Note */}
        <div className="text-center text-[11px] text-slate-400 pt-6">
          Kerahasiaan akun dilindungi dengan standar sesi terenkripsi PT Radhika Narya Daruna.
        </div>

      </div>

    </div>
  );
}