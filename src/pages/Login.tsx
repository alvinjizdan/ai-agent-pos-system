import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Eye, EyeOff, ShieldCheck, ArrowRight, Lock, 
  Mail, User, Loader2, ArrowLeft, CheckCircle2, 
  Package, Truck, Clock
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // State Mode: Login vs Register
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Form State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegisterMode) {
        await axios.post('/api/register', {
          username: username.trim(),
          email: email.trim(),
          password,
        });
        
        toast.success("Akun berhasil didaftarkan. Silakan masuk dengan kredensial Anda.", "Registrasi Sukses");
        setIsRegisterMode(false);
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
      console.error("Login error:", error);
      toast.error(error.response?.data?.error || "Gagal memproses autentikasi. Silakan periksa kembali data Anda.");
    } finally {
      setLoading(false);
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
          
          {/* Header Segmented Switcher */}
          <div className="mb-8">
            <div className="flex bg-slate-200/80 p-1 rounded-xl mb-6 shadow-inner">
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isRegisterMode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Masuk Akun
              </button>
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isRegisterMode
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Daftar Baru
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 tracking-tight">
              {isRegisterMode ? "Buat Akun Pembeli Baru" : "Selamat Datang Kembali"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              {isRegisterMode 
                ? "Lengkapi formulir berikut untuk membuat akun kemitraan resmi." 
                : "Masukkan kredensial terdaftar untuk mengakses dashboard Anda."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            
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
            {isRegisterMode && (
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
                {!isRegisterMode && (
                  <Link 
                    to="/forgot-password" 
                    className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline transition"
                  >
                    Lupa sandi?
                  </Link>
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
                  placeholder={isRegisterMode ? "Minimal 6 karakter" : "Masukkan kata sandi"}
                  autoComplete={isRegisterMode ? "new-password" : "current-password"}
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
                    <span>{isRegisterMode ? "Daftar Akun Kemitraan" : "Masuk ke Dashboard"}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>

            {/* Bottom Switch Mode Text */}
            <div className="text-center pt-5 border-t border-slate-200/80">
              <p className="text-xs text-slate-500">
                {isRegisterMode ? "Sudah memiliki akun terdaftar? " : "Belum memiliki akun kemitraan? "}
                <button 
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setPassword("");
                  }}
                  className="text-amber-700 font-bold hover:text-amber-800 hover:underline transition"
                >
                  {isRegisterMode ? "Masuk di sini" : "Daftar akun baru"}
                </button>
              </p>
            </div>

          </form>

        </div>

        {/* Privacy Note */}
        <div className="text-center text-[11px] text-slate-400 pt-6">
          Kerahasiaan akun dilindungi dengan standar sesi terenkripsi PT Radhika Narya Daruna.
        </div>

      </div>

    </div>
  );
}