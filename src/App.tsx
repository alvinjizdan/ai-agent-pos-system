import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios'; 
import ProductCard from './components/ProductCard';
import { 
  Search, ShoppingCart, Trash2, Plus, Minus, X, MapPin, Phone, Mail, Clock,
  ArrowRight, Menu as MenuIcon, ChevronRight, LogOut, User as UserIcon, ChevronDown, 
  LayoutDashboard, ShieldCheck, Scale, Truck, CheckCircle2, Award
} from 'lucide-react';
import { Product, CartItem } from './types';
import ChatBot from './components/Chatbot';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import { ToastProvider, useToast } from './context/ToastContext';

// Kategori Komoditas
const CATEGORIES = ["Semua", "Bahan Baku", "Kopra", "Kelapa Utuh"];

// 1. KOMPONEN HOME
const HomePage = ({ navigateTo, products, addToCart }: { navigateTo: (path: string) => void, products: Product[], addToCart: any }) => (
  <>
    {/* Hero Section */}
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden pt-28 pb-20">
      <div className="absolute inset-0 z-0">
        <img src="/bannerbg.png" alt="Banner Perkebunan Kelapa" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center text-white max-w-5xl">
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 border border-white/20 text-orange-400 text-xs font-bold tracking-widest uppercase mb-6 backdrop-blur-md">
          <ShieldCheck size={14} className="text-orange-400" />
          Supplier Komoditas Kopra & Kelapa Resmi
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold font-serif tracking-tight text-white mb-6 leading-[1.15]">
          Pasokan Terjaga,<br/>
          <span className="text-orange-400">Bisnis Anda Tetap Menyala.</span>
        </h1>

        <p className="text-base sm:text-lg lg:text-xl text-slate-200/90 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
          Jangan biarkan proses produksi terhenti karena kelangkaan bahan baku. PT Radhika Narya Daruna siap menjadi mitra suplai kopra rutin dengan tonase konsisten dan spesifikasi terpercaya.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => navigateTo('/menu')} 
            className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 group"
          >
            <span>Lihat Katalog Produk</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button 
            onClick={() => navigateTo('/about')} 
            className="w-full sm:w-auto bg-white/10 hover:bg-white/15 active:scale-[0.98] backdrop-blur-md border border-white/25 text-white font-medium py-4 px-8 rounded-xl transition-all flex items-center justify-center"
          >
            Tentang Perusahaan
          </button>
        </div>
      </div>
    </section>

    {/* Quality Pillars Strip */}
    <section className="relative z-20 -mt-10 max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/95 backdrop-blur-xl shadow-xl shadow-slate-900/5 border border-stone-200/80">
        <div className="flex items-start gap-3.5 p-3">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/50 shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">Sortir Grade Jelas</h4>
            <p className="text-xs text-slate-500 mt-0.5">Regular & Asongan terpisah secara tegas dan transparan.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-3">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/50 shrink-0">
            <Scale size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">Kadar Air Terstandar</h4>
            <p className="text-xs text-slate-500 mt-0.5">Pengeringan maksimal untuk rendemen minyak kelapa tinggi.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-3">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/50 shrink-0">
            <Truck size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">Kontinuitas Tonase</h4>
            <p className="text-xs text-slate-500 mt-0.5">Kapasitas suplai rutin untuk industri skala besar maupun UMKM.</p>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-3">
          <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200/50 shrink-0">
            <Award size={20} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 leading-snug">Pemesanan Langsung</h4>
            <p className="text-xs text-slate-500 mt-0.5">Terhubung otomatis dengan konfirmasi cepat via WhatsApp resmi.</p>
          </div>
        </div>
      </div>
    </section>

    {/* Home Favorites Catalog */}
    <section className="py-20 bg-stone-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold tracking-widest uppercase text-orange-600 mb-2 block">
              Katalog Unggulan
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
              Komoditas Pilihan Terbaik
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-lg">
              Dipanen dan diproses dari sentra kelapa terpercaya dengan inspeksi kualitas ketat sebelum pengiriman.
            </p>
          </div>
          <button 
            onClick={() => navigateTo('/menu')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600 hover:text-orange-700 transition self-start md:self-auto"
          >
            <span>Buka Semua Produk</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* 4 Produk Pilihan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </div>
    </section>

    <AboutSection isStandalone={false} />
    <LocationSection isStandalone={false} />
  </>
);

// 2. ABOUT SECTION
const AboutSection = ({ isStandalone = false }: { isStandalone?: boolean }) => (
  <section className={`${isStandalone ? 'min-h-screen pt-32 pb-24' : 'py-24'} bg-white border-t border-stone-100`}>
    <div className="container mx-auto px-6 max-w-6xl">
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="text-xs font-bold tracking-widest uppercase text-orange-600 mb-2 block">
          Profil Perusahaan
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight leading-snug">
          Dedikasi untuk Kualitas Komoditas Kelapa Nusantara.
        </h2>
        <p className="text-slate-500 text-sm mt-3 leading-relaxed">
          PT Radhika Narya Daruna bergerak sebagai agregator dan distributor resmi komoditas kopra dan kelapa utuh dengan komitmen integritas mutu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Gallery Preview */}
        <div className="lg:col-span-6 relative">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <img 
                src="/tentangkami1.jpg" 
                className="rounded-2xl w-full h-64 sm:h-72 object-cover shadow-lg border border-stone-200/80" 
                alt="Proses Sortir Kopra" 
              />
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/80 text-slate-800">
                <span className="text-2xl font-bold font-serif text-orange-600 block mb-1">100%</span>
                <span className="text-xs text-slate-600 leading-tight block">Sortir manual teliti tanpa campuran benda asing.</span>
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xl">
                <span className="text-2xl font-bold font-serif text-orange-400 block mb-1">B2B</span>
                <span className="text-xs text-slate-300 leading-tight block">Kesiapan kontrak suplai berkala untuk industri minyak.</span>
              </div>
              <img 
                src="/tentangkami2.jpg" 
                className="rounded-2xl w-full h-64 sm:h-72 object-cover shadow-lg border border-stone-200/80" 
                alt="Gudang Penampungan" 
              />
            </div>
          </div>
        </div>

        {/* Narrative & Pillars */}
        <div className="lg:col-span-6 space-y-6">
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            Mengapa Pelaku Industri Memilih Kami?
          </h3>
          <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
            Kami memahami bahwa stabilitas kadar air dan keaslian grade adalah faktor krusial dalam menentukan rendemen minyak kelapa Anda. Kami hadir memberikan kepastian spesifikasi barang di setiap transaksi.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70">
              <ShieldCheck className="text-orange-600 mb-2" size={22} />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Grade Standar</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Spesifikasi barang sesuai dengan kesepakatan tertulis awal.</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70">
              <Scale className="text-orange-600 mb-2" size={22} />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Timbangan Terverifikasi</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Jaminan akurasi bobot timbang saat serah terima barang.</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70">
              <Truck className="text-orange-600 mb-2" size={22} />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Jadwal Pengiriman Rapi</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Armada siap mendukung distribusi ke berbagai titik pelabuhan.</p>
            </div>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/70">
              <CheckCircle2 className="text-orange-600 mb-2" size={22} />
              <h4 className="font-bold text-slate-900 text-sm mb-1">Layanan Responsif</h4>
              <p className="text-xs text-slate-500 leading-relaxed">Pusat bantuan langsung ditangani tim operasional kami.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// 3. MENU PAGE
interface MenuPageProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  addToCart: (p: Product, q: number) => void;
  products: Product[];
}

const MenuPage: React.FC<MenuPageProps> = ({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, addToCart, products }) => {
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "Semua" || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory, products]);

  return (
    <section className="min-h-screen pt-28 pb-24 bg-stone-50 animate-in fade-in duration-300">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Catalog Header */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold tracking-widest uppercase text-orange-600 mb-2 block">
            Katalog & Pemesanan
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
            Pilihan Komoditas Siap Pasok
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            Pilih produk, tentukan jumlah tonase atau kilogram yang dibutuhkan, dan lanjutkan pesanan secara langsung.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 p-3 bg-white rounded-2xl border border-stone-200 shadow-sm">
          {/* Category Segmented Controls */}
          <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all active:scale-[0.98] ${
                  selectedCategory === cat 
                    ? 'bg-slate-900 text-white shadow-sm' 
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input 
              type="text" 
              placeholder="Cari komoditas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
            />
            {searchQuery && (
              <button 
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-16 text-center max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-4">
              <Search size={22} />
            </div>
            <h4 className="text-base font-bold text-slate-800 mb-1">Produk Tidak Ditemukan</h4>
            <p className="text-xs text-slate-500 mb-4">Tidak ada komoditas yang cocok dengan pencarian kata kunci atau kategori terpilih.</p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('Semua'); }}
              className="text-xs font-semibold text-orange-600 hover:underline"
            >
              Reset Filter Pencarian
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// 4. LOCATION PAGE
const LocationSection = ({ isStandalone = false }: { isStandalone?: boolean }) => (
  <section className={`${isStandalone ? 'min-h-screen pt-32 pb-24' : 'py-20'} bg-stone-50 border-t border-stone-200/70`}>
    <div className="container mx-auto px-6 max-w-6xl">
      <div className="text-center mb-12 max-w-xl mx-auto">
        <span className="text-xs font-bold tracking-widest uppercase text-orange-600 mb-2 block">
          Lokasi & Kontak
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 tracking-tight">
          Pusat Operasional Kami
        </h2>
        <p className="text-slate-500 text-sm mt-2">
          Kunjungi kantor pemasaran atau jadwalkan inspeksi fisik muatan di gudang penyimpanan kami.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Informasi Kantor & Gudang</h3>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-200/50 shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Alamat Perusahaan</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Apartement Educity Pakuwon City Tower Stamford, Jl. Kalisari Selatan, Surabaya, Jawa Timur.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-200/50 shrink-0">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Telepon / WhatsApp</h4>
                <p className="text-xs text-slate-600 mt-1">+62 888 626 8884</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl border border-orange-200/50 shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Jam Operasional</h4>
                <p className="text-xs text-slate-600 mt-1">Senin - Sabtu: 08.00 - 17.00 WIB</p>
                <p className="text-[11px] text-slate-400">Minggu & Hari Libur: Layanan Chat Terbatas</p>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-stone-100">
            <a 
              href="https://maps.app.goo.gl/suC8TopfzE9wuNLj7" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-full bg-slate-900 hover:bg-orange-600 active:scale-[0.98] text-white font-semibold py-3 px-6 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <MapPin size={16} />
              <span>Buka Petunjuk Arah di Google Maps</span>
            </a>
          </div>
        </div>

        <div className="lg:col-span-7 h-[380px] lg:h-auto min-h-[320px] bg-slate-200 rounded-2xl overflow-hidden border border-stone-200/80 relative shadow-sm">
          <img 
            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop" 
            alt="Peta Lokasi" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] flex items-center justify-center p-4">
            <a 
              href="https://maps.app.goo.gl/suC8TopfzE9wuNLj7" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-white/95 backdrop-blur-md px-6 py-3.5 rounded-full shadow-xl flex items-center gap-2.5 text-slate-900 hover:bg-white active:scale-95 transition-all text-xs font-bold border border-white/50"
            >
              <MapPin className="text-orange-600" size={18} />
              <span>Titik Lokasi PT Radhika Narya Daruna</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// MAIN APP COMPONENT
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [username, setUsername] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get('/api/products');
        setProducts(res.data);
      } catch (err) {
        console.error("Gagal mengambil data produk dari server", err);
      }
    };
    fetchProducts();
  }, [location.pathname]);

  // Check Login Status on Route Change via Session
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');

    const token = sessionStorage.getItem('token');
    const storedRole = sessionStorage.getItem('role');
    const storedUser = sessionStorage.getItem('username');
    
    if (token) {
      setIsLoggedIn(true);
      setUsername(storedRole === 'ADMIN' ? 'Admin' : (storedUser || 'User')); 
    } else {
      setIsLoggedIn(false);
      setUsername("");
    }
  }, [location.pathname]);

  // Cart Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const updateQuantity = (id: string | number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string | number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.info("Produk dihapus dari keranjang.");
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      toast.warning("Silakan Login terlebih dahulu untuk menyelesaikan pesanan.");
      navigate('/login');
      setIsCartOpen(false);
      return;
    }

    if (cart.length === 0) {
      toast.warning("Keranjang belanja Anda masih kosong.");
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const totalPayment = subtotal + tax;

    try {
      await axios.post('/api/orders', {
        customerName: username,
        items: cart,
        totalPrice: totalPayment
      });
      toast.success("Pesanan berhasil dicatat, membuka WhatsApp...", "Pesanan Dibuat");
    } catch (error) {
      console.error("Gagal menyimpan ke database:", error);
      toast.error("Gagal menyimpan ke database, namun Anda tetap diarahkan ke WhatsApp.");
    }

    const phoneNumber = "628886268884"; 
    let message = `Halo Admin PT Radhika Narya Daruna,\n\nSaya *${username}* ingin memesan komoditas:\n\n`;
    
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* (${item.quantity} kg) - Rp ${(item.price * item.quantity).toLocaleString('id-ID')}\n`;
    });

    message += `\n*Subtotal:* Rp ${subtotal.toLocaleString('id-ID')}`;
    message += `\n*Pajak (10%):* Rp ${tax.toLocaleString('id-ID')}`;
    message += `\n*Total Bayar:* Rp ${totalPayment.toLocaleString('id-ID')}`;
    message += `\n\nMohon konfirmasi ketersediaan stok & nomor rekening pembayaran. Terima kasih!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');

    setCart([]);
    localStorage.removeItem('shopping-cart');
    setIsCartOpen(false);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('shopping-cart');
    setIsLoggedIn(false);
    setUsername("");
    setCart([]);
    setShowProfileMenu(false);
    toast.info("Anda telah keluar dari sesi login.", "Logout");
    navigate('/');
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const searchPreviewItems = useMemo(() => {
    if (searchQuery.length === 0) return [];
    return products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);
  }, [searchQuery, products]);

  const isLoginPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen text-slate-800 font-sans relative bg-white selection:bg-orange-500 selection:text-white">
      
      {/* NAVBAR */}
      {!isLoginPage && !isAdminPage && (
        <nav 
          className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 backdrop-blur-xl ${
            scrolled || location.pathname !== '/' 
              ? 'bg-slate-950/90 border-b border-white/10 shadow-lg shadow-black/10 py-3.5' 
              : 'bg-slate-950/40 border-b border-white/5 py-4'
          }`}
        >
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="flex justify-between items-center">
              
              {/* Logo & Brand */}
              <button 
                onClick={() => navigate('/')} 
                className="flex items-center gap-3 group text-left"
              >
                <img 
                  src="/logobulet.png" 
                  alt="Logo PT Radhika" 
                  className="h-9 w-auto object-contain group-hover:scale-105 transition-transform" 
                />
                <div>
                  <span className="text-base font-bold font-serif tracking-tight text-white block leading-none">
                    PT Radhika Narya Daruna
                  </span>
                  <span className="text-[10px] text-orange-400 font-medium tracking-wider uppercase block mt-1">
                    Commodity Supplier
                  </span>
                </div>
              </button>

              {/* Desktop Menu Links */}
              <div className="hidden md:flex items-center gap-1">
                {[
                  { path: '/', label: 'Beranda' },
                  { path: '/menu', label: 'Katalog & Pesan' },
                  { path: '/about', label: 'Tentang Kami' },
                  { path: '/location', label: 'Lokasi Gudang' },
                ].map((link) => (
                  <button 
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                      location.pathname === link.path 
                        ? 'text-white bg-white/15 shadow-sm' 
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}

                {/* Search Bar Desktop */}
                <div className="relative mx-3 w-52 lg:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                  <input 
                    type="text" 
                    placeholder="Cari komoditas..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') navigate('/menu'); }}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/10 text-white placeholder-slate-400 text-xs border border-white/15 focus:outline-none focus:bg-white/15 focus:border-orange-500 transition"
                  />
                  {searchQuery && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                      {searchPreviewItems.map((product) => (
                        <button 
                          key={product.id} 
                          onClick={() => { setSearchQuery(product.name); navigate('/menu'); }} 
                          className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-white/10 transition text-left"
                        >
                          <img src={product.image || '/bannerbg.png'} alt={product.name} className="w-8 h-8 rounded-lg object-cover" />
                          <div className="flex-1 truncate">
                            <p className="text-xs font-semibold text-white truncate">{product.name}</p>
                            <p className="text-[10px] text-orange-400">Rp {product.price.toLocaleString('id-ID')}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Cart & Profile */}
              <div className="flex items-center gap-3">
                {/* Cart Button */}
                <button 
                  onClick={() => setIsCartOpen(true)} 
                  className="relative p-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-white/10 transition active:scale-95"
                  aria-label="Buka Keranjang"
                >
                  <ShoppingCart size={19} />
                  {cart.length > 0 && (
                    <span className="absolute top-1 right-1 bg-orange-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow">
                      {cart.length}
                    </span>
                  )}
                </button>

                {/* User Dropdown */}
                <div className="hidden md:block">
                  {isLoggedIn ? (
                    <div className="relative">
                      <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)} 
                        className="flex items-center gap-2.5 bg-white/10 hover:bg-white/15 text-white px-3.5 py-1.5 rounded-xl border border-white/15 transition text-xs font-semibold"
                      >
                        <div className="bg-orange-600 p-1 rounded-lg text-white">
                          <UserIcon size={13} />
                        </div>
                        <span className="truncate max-w-[120px]">{username}</span>
                        <ChevronDown size={13} className={`transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                      </button>

                      {showProfileMenu && (
                        <div className="absolute right-0 mt-2 w-52 bg-slate-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/10 overflow-hidden z-[100] p-1.5">
                          {sessionStorage.getItem('role') === 'ADMIN' && (
                            <button 
                              onClick={() => { setShowProfileMenu(false); navigate('/admin/dashboard'); }} 
                              className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white rounded-lg flex items-center gap-2.5 transition"
                            >
                              <LayoutDashboard size={15} className="text-orange-400" /> 
                              <span>Dashboard Admin</span>
                            </button>
                          )}
                          <button 
                            onClick={handleLogout} 
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2.5 transition"
                          >
                            <LogOut size={15} /> 
                            <span>Keluar Sesi</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button 
                      onClick={() => navigate('/login')} 
                      className="bg-orange-600 hover:bg-orange-500 active:scale-95 text-white px-5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-orange-600/20 flex items-center gap-2"
                    >
                      <UserIcon size={14} />
                      <span>Masuk / Daftar</span>
                    </button>
                  )}
                </div>

                {/* Hamburger Button Mobile */}
                <button 
                  className="md:hidden p-2 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Buka Menu"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Dropdown Drawer */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-slate-950/95 border-t border-white/10 px-6 py-4 space-y-2 animate-in slide-in-from-top-3">
              {[
                { path: '/', label: 'Beranda' },
                { path: '/menu', label: 'Katalog & Pesan' },
                { path: '/about', label: 'Tentang Kami' },
                { path: '/location', label: 'Lokasi Gudang' },
              ].map((link) => (
                <button 
                  key={link.path}
                  onClick={() => {
                    navigate(link.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                    location.pathname === link.path ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div className="pt-2 border-t border-white/10">
                {isLoggedIn ? (
                  <div className="space-y-1">
                    {sessionStorage.getItem('role') === 'ADMIN' && (
                      <button 
                        onClick={() => { setIsMobileMenuOpen(false); navigate('/admin/dashboard'); }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-orange-400 hover:bg-white/10 rounded-xl flex items-center gap-2"
                      >
                        <LayoutDashboard size={15} /> Dashboard Admin
                      </button>
                    )}
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-400 hover:bg-white/10 rounded-xl flex items-center gap-2"
                    >
                      <LogOut size={15} /> Keluar ({username})
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}
                    className="w-full bg-orange-600 text-white py-2.5 rounded-xl text-xs font-bold text-center block"
                  >
                    Masuk Akun
                  </button>
                )}
              </div>
            </div>
          )}
        </nav>
      )}

      {/* MAIN ROUTE CONTENT */}
      <main>
        <Routes>
          <Route path="/" element={<HomePage navigateTo={navigate} products={products} addToCart={addToCart} />} />
          <Route path="/about" element={<AboutSection isStandalone={true} />} />
          <Route path="/menu" element={
            <MenuPage 
              searchQuery={searchQuery} 
              setSearchQuery={setSearchQuery} 
              selectedCategory={selectedCategory} 
              setSelectedCategory={setSelectedCategory}
              addToCart={addToCart} 
              products={products}
            />
          } />
          <Route path="/location" element={<LocationSection isStandalone={true} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
        </Routes>
      </main>
      
      {/* FOOTER */}
      {!isLoginPage && !isAdminPage && (
        <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-white/10">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
              <div className="md:col-span-6 space-y-4">
                <div className="flex items-center gap-3">
                  <img src="/logobulet.png" alt="Logo" className="h-10 w-auto" />
                  <span className="text-lg font-bold font-serif text-white">PT Radhika Narya Daruna</span>
                </div>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Mitra terpercaya pasokan kopra dan komoditas kelapa Indonesia. Menjamin kontinuitas stok bahan baku industri Anda dengan standar kadar air andalan.
                </p>
              </div>

              <div className="md:col-span-3 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Tautan Cepat</h4>
                <ul className="space-y-2 text-xs">
                  <li><button onClick={() => navigate('/')} className="hover:text-orange-400 transition">Beranda</button></li>
                  <li><button onClick={() => navigate('/menu')} className="hover:text-orange-400 transition">Katalog Produk</button></li>
                  <li><button onClick={() => navigate('/about')} className="hover:text-orange-400 transition">Tentang Perusahaan</button></li>
                  <li><button onClick={() => navigate('/location')} className="hover:text-orange-400 transition">Titik Gudang & Lokasi</button></li>
                </ul>
              </div>

              <div className="md:col-span-3 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">Hubungi Kami</h4>
                <div className="space-y-2 text-xs text-slate-400">
                  <p>Surabaya, Jawa Timur - Indonesia</p>
                  <p className="text-orange-400 font-medium">+62 888 626 8884</p>
                  <p>Buka: Senin - Sabtu (08.00 - 17.00 WIB)</p>
                </div>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
              <p>© {new Date().getFullYear()} PT Radhika Narya Daruna. Hak Cipta Dilindungi Undang-Undang.</p>
              <div className="flex gap-4">
                <span>Standar Mutu Komoditas Kelapa</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* CART DRAWER SLIDE-OVER */}
      {isCartOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity" 
            onClick={() => setIsCartOpen(false)} 
          />
          <div className="fixed inset-y-0 right-0 z-[9999] w-full sm:w-[440px] bg-white shadow-2xl flex flex-col border-l border-stone-200 animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50/80">
              <div>
                <h2 className="text-lg font-bold font-serif text-slate-900">Keranjang Belanja</h2>
                <p className="text-xs text-stone-500 mt-0.5">{cart.length} jenis komoditas dipilih</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)} 
                className="p-2 hover:bg-stone-200/70 rounded-full transition text-stone-500"
                aria-label="Tutup Keranjang"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Item List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-24 text-stone-400">
                  <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
                    <ShoppingCart size={22} />
                  </div>
                  <h4 className="text-sm font-bold text-stone-700">Keranjang Anda Kosong</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-[200px] mx-auto">Silakan pilih produk dari katalog untuk mulai memesan.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl border border-stone-200/70 hover:border-stone-300 bg-white transition">
                    <img 
                      src={item.image || '/bannerbg.png'} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-lg border border-stone-100 bg-stone-50 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                      <p className="text-xs font-bold text-orange-600 mt-0.5">
                        Rp {item.price.toLocaleString('id-ID')} / kg
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50 overflow-hidden">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)} 
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition"
                          >
                            <Minus size={12}/>
                          </button>
                          <span className="text-xs font-bold w-6 text-center text-stone-800">{item.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)} 
                            className="w-6 h-6 flex items-center justify-center text-stone-600 hover:bg-stone-200 transition"
                          >
                            <Plus size={12}/>
                          </button>
                        </div>
                        <span className="text-[11px] font-medium text-stone-500">kg</span>
                        <button 
                          onClick={() => removeFromCart(item.id)} 
                          className="ml-auto text-stone-400 hover:text-rose-500 p-1 transition"
                          title="Hapus"
                        >
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & WhatsApp Checkout */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-stone-200 shadow-xl space-y-3">
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Subtotal Produk</span>
                  <span className="font-semibold text-stone-900">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-600">
                  <span>Pajak PPN (10%)</span>
                  <span className="font-semibold text-stone-900">Rp {tax.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-stone-100">
                  <span>Total Estimasi</span>
                  <span className="text-lg text-orange-600 font-bold">Rp {total.toLocaleString('id-ID')}</span>
                </div>
                <button 
                  onClick={handleCheckout} 
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white py-3.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  <span>Konfirmasi Pesanan via WhatsApp</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* AI Chatbot Assistant */}
      {!isAdminPage && !isLoginPage && (
        <ChatBot 
          products={products} 
          onAddToCart={(idProduk) => {
            const produkPilihan = products.find((p) => String(p.id) === String(idProduk));
            if (produkPilihan) {
              addToCart(produkPilihan, 1); 
            }
          }} 
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;