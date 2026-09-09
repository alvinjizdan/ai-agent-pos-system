import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, Package, Plus, Trash2, ClipboardList, 
  ShoppingCart, Users, Menu, X, Save, Edit3, Calendar, 
  RotateCcw, Loader2, Search, ExternalLink, TrendingUp, 
  AlertTriangle, CheckCircle2, Clock, Truck, ShieldCheck,
  ChevronRight, Filter, Eye, DollarSign
} from 'lucide-react';
import AdminChatbot from '../components/AdminChatbot';
import { useToast } from '../context/ToastContext';

interface Product {
  id?: number | string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
  description?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // --- STATE DATA ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // --- STATE UI ---
  const [activeTab, setActiveTab] = useState<'recap' | 'products' | 'orders' | 'users'>('recap');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- FILTER STATE ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [orderStatusFilter, setOrderStatusFilter] = useState('Semua');
  const [orderSearch, setOrderSearch] = useState('');

  // --- STATE FORM ---
  const [formData, setFormData] = useState<Product>({
    name: '', category: 'Bahan Baku', price: 0, stock: 0, image: '', description: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // 1. CEK LOGIN & AMBIL DATA (Session Storage)
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('username'); 

    if (!token) {
      navigate('/login');
    } else {
      setAdminName(user || "Admin");
      fetchProducts();
      fetchOrders();
      fetchUsers();
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Gagal mengambil data user", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Gagal mengambil data pesanan", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data produk", error);
      setLoading(false);
    }
  };

  // GANTI ROLE USER
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await axios.put(`/api/users/${userId}/role`, { role: newRole });
      fetchUsers();
      toast.success(`Hak akses berhasil diubah menjadi ${newRole}.`);
    } catch (error) {
      toast.error("Gagal memperbarui role pengguna.");
    }
  };

  // HAPUS USER
  const handleDeleteUser = async (userId: number, usernameTarget: string) => {
    const currentAdmin = sessionStorage.getItem('username');
    if (usernameTarget === currentAdmin) {
      toast.warning("Anda tidak dapat menghapus akun yang sedang aktif digunakan.");
      return;
    }

    if (window.confirm(`Konfirmasi penghapusan akun "${usernameTarget}"? Tindakan ini tidak dapat dibatalkan.`)) {
      try {
        await axios.delete(`/api/users/${userId}`);
        fetchUsers();
        toast.success(`Akun "${usernameTarget}" telah dihapus.`);
      } catch (error) {
        toast.error("Gagal menghapus akun pengguna.");
      }
    }
  };

  // LOGOUT
  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    toast.info("Sesi backoffice telah diakhiri.", "Logout Berhasil");
    navigate('/login');
  };

  // FILTER LOGIC: ORDERS
  const filteredOrders = orders.filter((order) => {
    // Filter pencarian kode pesanan / pelanggan / barang
    if (orderSearch.trim()) {
      const searchLower = orderSearch.toLowerCase();
      const codeMatch = (order.orderCode || '').toLowerCase().includes(searchLower);
      const nameMatch = (order.customerName || '').toLowerCase().includes(searchLower);
      let itemMatch = false;
      try {
        const items = JSON.parse(order.items || '[]');
        itemMatch = items.some((i: any) => i.name?.toLowerCase().includes(searchLower));
      } catch (e) {}
      if (!codeMatch && !nameMatch && !itemMatch) return false;
    }

    // Filter status
    if (orderStatusFilter !== 'Semua' && order.status !== orderStatusFilter) {
      return false;
    }
    // Filter tanggal
    if (!startDate && !endDate) return true;

    const orderDate = new Date(order.date);
    const start = startDate ? new Date(startDate) : new Date('1970-01-01');
    const end = endDate ? new Date(endDate) : new Date();

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return orderDate >= start && orderDate <= end;
  });

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setOrderStatusFilter('Semua');
    setOrderSearch('');
  };

  // CALCULATIONS FOR METRICS
  const validOrdersForRevenue = orders.filter(order => order.status !== 'Batal');
  const filteredRevenue = filteredOrders.reduce((sum, order) => {
    return order.status === 'Batal' ? sum : sum + (order.totalPrice || 0);
  }, 0);

  const totalCompletedOrders = orders.filter(order => order.status === 'Selesai').length;
  const totalPendingOrders = orders.filter(order => order.status === 'Menunggu Konfirmasi' || order.status === 'Di Proses').length;
  const lowStockProducts = products.filter(p => p.stock < 50);

  // STATUS CHANGE ORDER
  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      fetchOrders(); 
      toast.success(`Status pesanan berhasil diperbarui ke: ${newStatus}`);
    } catch (error) {
      toast.error("Gagal memperbarui status pesanan.");
    }
  };

  // HAPUS ORDER
  const handleDeleteOrder = async (orderId: number) => {
    if (window.confirm("Konfirmasi penghapusan riwayat pesanan ini?")) {
      try {
        await axios.delete(`/api/orders/${orderId}`);
        fetchOrders(); 
        toast.success("Riwayat pesanan berhasil dihapus.");
      } catch (error) {
        toast.error("Gagal menghapus riwayat pesanan.");
      }
    }
  };

  // MODAL HANDLERS
  const openAddModal = () => {
    setIsEditing(false);
    setFormData({ name: '', category: 'Bahan Baku', price: 0, stock: 0, image: '', description: '' });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setIsEditing(true);
    setFormData(product);
    setImageFile(null);
    setImagePreview(product.image || '');
    setIsModalOpen(true);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'price' || name === 'stock') {
      const numValue = Number(value);
      if (numValue < 0) return; 
      setFormData({ ...formData, [name]: numValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // SUBMIT FORM PRODUK
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    let imagePayload = formData.image;
    if (imageFile) {
      try {
        imagePayload = await fileToBase64(imageFile);
      } catch (err) {
        toast.error("Gagal memproses file foto produk.");
        setIsSaving(false);
        return;
      }
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      stock: Number(formData.stock),
      description: formData.description || "",
      image: imagePayload
    };

    try {
      if (isEditing && formData.id) {
        await axios.put(`/api/products/${formData.id}`, payload);
        toast.success("Perubahan data produk berhasil disimpan.");
      } else {
        await axios.post('/api/products', payload);
        toast.success("Produk komoditas baru berhasil ditambahkan.");
      }
      setIsModalOpen(false);
      fetchProducts(); 
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Gagal menyimpan data produk.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // HAPUS PRODUK
  const handleDelete = async (id: string | number) => {
    if (window.confirm("Konfirmasi penghapusan produk ini dari katalog publik?")) {
      try {
        await axios.delete(`/api/products/${id}`);
        toast.success("Produk berhasil dihapus dari sistem.");
        fetchProducts();
      } catch (error) {
        toast.error("Gagal menghapus produk.");
      }
    }
  };

  // FILTER PRODUCTS
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['Semua', 'Bahan Baku', 'Kopra', 'Kelapa Utuh', 'Minyak'];

  // STATUS BADGE COLOR HELPER
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Selesai':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Di Kirim':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Di Proses':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Menunggu Konfirmasi':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Batal':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans flex flex-col md:flex-row antialiased selection:bg-amber-600 selection:text-white">
      
      {/* ======================================================== */}
      {/* 1. SIDEBAR (macOS / iPadOS style rail & panel)          */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-slate-950 text-slate-300 border-r border-slate-800/80 z-30 select-none">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-1 shadow-inner">
            <img src="/logobulet.png" alt="PT Radhika Narya Daruna" className="w-8 h-8 object-contain" />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold uppercase tracking-widest text-white truncate font-display">RADHIKA NARYA</h2>
            <p className="text-[10px] text-slate-400 font-medium tracking-tight">Backoffice Operasional</p>
          </div>
        </div>

        {/* Navigation Group */}
        <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigasi Utama
          </div>

          {/* Nav Item: Ringkasan */}
          <button
            onClick={() => setActiveTab('recap')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'recap'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <ClipboardList size={18} className={activeTab === 'recap' ? 'text-white' : 'text-slate-400'} />
              <span>Ringkasan</span>
            </div>
          </button>

          {/* Nav Item: Produk */}
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'products'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package size={18} className={activeTab === 'products' ? 'text-white' : 'text-slate-400'} />
              <span>Manajemen Produk</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
              activeTab === 'products' ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {products.length}
            </span>
          </button>

          {/* Nav Item: Pesanan */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'orders'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingCart size={18} className={activeTab === 'orders' ? 'text-white' : 'text-slate-400'} />
              <span>Pesanan Masuk</span>
            </div>
            {totalPendingOrders > 0 && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
                activeTab === 'orders' ? 'bg-black/20 text-white' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {totalPendingOrders} baru
              </span>
            )}
          </button>

          {/* Nav Item: Pengguna */}
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
              activeTab === 'users'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-900/30'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={18} className={activeTab === 'users' ? 'text-white' : 'text-slate-400'} />
              <span>Kelola Pengguna</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums ${
              activeTab === 'users' ? 'bg-black/20 text-white' : 'bg-slate-800 text-slate-400'
            }`}>
              {users.length}
            </span>
          </button>

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Tautan Cepat
          </div>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <ExternalLink size={18} className="text-slate-400" />
              <span>Lihat Web Publik</span>
            </div>
            <ChevronRight size={14} className="text-slate-600" />
          </Link>
        </div>

        {/* User Card & Logout Bottom */}
        <div className="p-4 border-t border-white/5 bg-slate-950/70">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-white/5 mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-bold text-white truncate">{adminName}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] text-slate-400 tracking-wide uppercase font-medium">Administrator</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-300 hover:text-rose-100 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-900/40 transition-all duration-150"
          >
            <LogOut size={16} />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE TOPBAR (Visible only < md)                      */}
      {/* ======================================================== */}
      <div className="md:hidden sticky top-0 z-40 bg-slate-950 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logobulet.png" alt="Logo" className="w-7 h-7 object-contain" />
          <div>
            <h1 className="text-xs font-bold tracking-wide uppercase">Radhika Backoffice</h1>
            <p className="text-[10px] text-slate-400 capitalize">{activeTab}</p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Buka Navigasi"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col justify-between p-6 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img src="/logobulet.png" alt="Logo" className="w-8 h-8 object-contain" />
                <span className="font-bold text-sm text-white uppercase tracking-wider">Navigasi Admin</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-full bg-white/10 text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="py-6 space-y-2">
              {[
                { id: 'recap', label: 'Ringkasan', icon: ClipboardList },
                { id: 'products', label: 'Manajemen Produk', icon: Package },
                { id: 'orders', label: 'Pesanan Masuk', icon: ShoppingCart },
                { id: 'users', label: 'Kelola Pengguna', icon: Users }
              ].map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                      activeTab === item.id
                        ? 'bg-amber-600 text-white shadow-md'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <IconComponent size={20} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <Link
                to="/"
                target="_blank"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-300 hover:bg-white/5"
              >
                <ExternalLink size={20} />
                <span>Lihat Web Publik</span>
              </Link>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-white">{adminName}</p>
                <p className="text-xs text-slate-400">Masuk sebagai Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MAIN WORKSPACE CONTENT CANVAS                         */}
      {/* ======================================================== */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>Portal Admin</span>
              <ChevronRight size={14} />
              <span className="text-slate-800 capitalize font-bold">
                {activeTab === 'recap' ? 'Ringkasan Eksekutif' : 
                 activeTab === 'products' ? 'Manajemen Produk & Stok' : 
                 activeTab === 'orders' ? 'Antrean Pesanan Masuk' : 'Kelola Pengguna'}
              </span>
            </div>
            <h1 className="text-lg font-bold font-display text-slate-900 tracking-tight mt-0.5">
              PT Radhika Narya Daruna
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Sistem Aktif</span>
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="text-right">
              <p className="text-xs font-bold text-slate-800">{adminName}</p>
              <p className="text-[10px] text-slate-500">Sesi Terverifikasi</p>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-4 md:p-8 space-y-6 max-w-7xl w-full">
          
          {/* ==================================================== */}
          {/* TAB 1: RINGKASAN (Executive Recap & Stats)           */}
          {/* ==================================================== */}
          {activeTab === 'recap' && (
            <div className="space-y-6">
              
              {/* Low Stock Notification (if any) */}
              {lowStockProducts.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 text-amber-900 shadow-xs">
                  <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950">Peringatan Ketersediaan Stok</h4>
                    <p className="text-xs text-amber-900/90 mt-0.5">
                      Terdapat {lowStockProducts.length} produk dengan stok di bawah 50 kg/pcs ({lowStockProducts.map(p => p.name).join(', ')}). Segera tinjau pengadaan bahan baku.
                    </p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('products')}
                    className="text-xs font-bold text-amber-950 hover:underline shrink-0"
                  >
                    Buka Produk &rarr;
                  </button>
                </div>
              )}

              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Stat 1: Total Pendapatan */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pendapatan</span>
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                      <TrendingUp size={18} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                      Rp {filteredRevenue.toLocaleString('id-ID')}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                      {(startDate || endDate) ? (
                        <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          Data Terfilter
                        </span>
                      ) : (
                        <span>Akumulasi transaksi bukan batal</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Stat 2: Total Pesanan */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Transaksi</span>
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <ShoppingCart size={18} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                      {filteredOrders.filter(o => o.status !== 'Batal').length}
                      <span className="text-xs font-normal text-slate-500 ml-1.5">Pesanan</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {totalCompletedOrders} pesanan selesai dikirim
                    </p>
                  </div>
                </div>

                {/* Stat 3: Total Produk */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Katalog Produk</span>
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Package size={18} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                      {products.length}
                      <span className="text-xs font-normal text-slate-500 ml-1.5">Komoditas</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {lowStockProducts.length === 0 ? 'Semua stok dalam ambang aman' : `${lowStockProducts.length} stok menipis`}
                    </p>
                  </div>
                </div>

                {/* Stat 4: Pengguna */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pengguna Terdaftar</span>
                    <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                      <Users size={18} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display text-slate-900 tabular-nums">
                      {users.length}
                      <span className="text-xs font-normal text-slate-500 ml-1.5">Akun</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {users.filter(u => u.role === 'ADMIN').length} administrator aktif
                    </p>
                  </div>
                </div>

              </div>

              {/* Table Card: Transaksi Terbaru with Date Filter */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                
                {/* Header with integrated date filter */}
                <div className="p-5 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Riwayat Transaksi Terbaru</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Ringkasan aktivitas transaksi penjualan masuk ke database.</p>
                  </div>

                  {/* Filter range */}
                  <div className="flex items-center flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                      <Calendar size={14} className="text-slate-400" />
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-xs font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
                        title="Tanggal Mulai"
                      />
                      <span className="text-slate-300 font-bold">sampai</span>
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-xs font-semibold text-slate-700 bg-transparent border-none outline-none cursor-pointer"
                        title="Tanggal Akhir"
                      />
                    </div>

                    {(startDate || endDate) && (
                      <button 
                        onClick={handleResetFilter}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition text-xs font-semibold flex items-center gap-1.5"
                        title="Reset Filter Tanggal"
                      >
                        <RotateCcw size={14} />
                        <span className="hidden sm:inline">Reset</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3.5 px-5">Kode</th>
                        <th className="py-3.5 px-5">Waktu</th>
                        <th className="py-3.5 px-5">Pelanggan</th>
                        <th className="py-3.5 px-5">Barang</th>
                        <th className="py-3.5 px-5">Total</th>
                        <th className="py-3.5 px-5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                            Tidak ada data transaksi yang sesuai dengan periode filter.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.slice(0, 5).map((order) => {
                          let itemsList = [];
                          try { itemsList = JSON.parse(order.items); } catch(e) {}
                          const orderIndex = orders.findIndex(o => o.id === order.id);
                          const kodePesanan = order.orderCode || `RND-${String(orders.length - orderIndex).padStart(3, '0')}`;

                          return (
                            <tr key={order.id} className="hover:bg-slate-50/70 transition">
                              <td className="py-3.5 px-5 font-mono font-bold text-amber-700">
                                {kodePesanan}
                              </td>
                              <td className="py-3.5 px-5 text-slate-600 whitespace-nowrap">
                                <div>{new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                <div className="text-[10px] text-slate-400">{new Date(order.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</div>
                              </td>
                              <td className="py-3.5 px-5 font-semibold text-slate-900">
                                {order.customerName}
                              </td>
                              <td className="py-3.5 px-5 text-slate-600">
                                {itemsList.map((item: any, idx: number) => (
                                  <div key={idx} className="truncate max-w-[200px]">
                                    {item.name} <span className="text-slate-400 font-semibold">x{item.quantity}</span>
                                  </div>
                                ))}
                              </td>
                              <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">
                                Rp {(order.totalPrice || 0).toLocaleString('id-ID')}
                              </td>
                              <td className="py-3.5 px-5">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadge(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer preview action */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs text-slate-500">
                  <span>Menampilkan ringkasan transaksi terbaru</span>
                  <button 
                    onClick={() => setActiveTab('orders')}
                    className="font-bold text-amber-600 hover:text-amber-700 transition flex items-center gap-1"
                  >
                    <span>Lihat Semua Pesanan</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: MANAJEMEN PRODUK                              */}
          {/* ==================================================== */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              
              {/* Controls bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                
                {/* Search & Category Tabs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Cari nama produk atau kategori..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                          selectedCategory === cat
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Primary Add Button */}
                <button
                  onClick={openAddModal}
                  className="bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Plus size={16} />
                  <span>Tambah Produk Baru</span>
                </button>
              </div>

              {/* Products Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3.5 px-5">Produk</th>
                        <th className="py-3.5 px-5">Kategori</th>
                        <th className="py-3.5 px-5">Harga Satuan</th>
                        <th className="py-3.5 px-5">Stok Tersedia</th>
                        <th className="py-3.5 px-5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {loading ? (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-slate-400">
                            <Loader2 size={24} className="animate-spin mx-auto mb-2 text-amber-600" />
                            <span>Memuat katalog komoditas...</span>
                          </td>
                        </tr>
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-slate-400">
                            Tidak ada produk yang cocok dengan pencarian.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-3.5">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0" 
                                />
                                <div>
                                  <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                                  {item.description && (
                                    <p className="text-[11px] text-slate-400 line-clamp-1 max-w-sm mt-0.5">{item.description}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-5">
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 font-bold text-slate-900 tabular-nums">
                              Rp {item.price.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3.5 px-5">
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${
                                  item.stock <= 0 ? 'bg-rose-500' :
                                  item.stock < 50 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}></span>
                                <span className="font-bold text-slate-900 tabular-nums">{item.stock}</span>
                                <span className="text-slate-400 text-[10px]">kg/pcs</span>
                              </div>
                              {item.stock < 50 && (
                                <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">
                                  {item.stock === 0 ? 'Stok Habis' : 'Stok Menipis'}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditModal(item)}
                                  className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                                  title="Edit Produk"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id!)}
                                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Hapus Produk"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 3: PESANAN MASUK (Order Processing)              */}
          {/* ==================================================== */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              
              {/* Order Filtering Bar */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                
                {/* Search Bar & Status Segmented Buttons */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text"
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      placeholder="Cari kode (misal RND-001) / pelanggan..."
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 flex-1">
                    {['Semua', 'Menunggu Konfirmasi', 'Di Proses', 'Di Kirim', 'Selesai', 'Batal'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setOrderStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                          orderStatusFilter === status
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date range picker inline */}
                <div className="flex items-center flex-wrap justify-between gap-3 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Rentang Tanggal:</span>
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-xs font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer"
                        title="Dari"
                      />
                      <span className="text-slate-300 font-bold">-</span>
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-xs font-medium text-slate-700 bg-transparent border-none outline-none cursor-pointer"
                        title="Sampai"
                      />
                    </div>

                    {(startDate || endDate || orderStatusFilter !== 'Semua' || orderSearch) && (
                      <button 
                        onClick={handleResetFilter}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition text-xs font-semibold flex items-center gap-1"
                      >
                        <RotateCcw size={14} />
                        <span>Reset Filter</span>
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    Total: <b className="text-slate-900">{filteredOrders.length}</b> pesanan terdata
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3.5 px-5">Kode Pesanan</th>
                        <th className="py-3.5 px-5">Waktu Transaksi</th>
                        <th className="py-3.5 px-5">Pelanggan</th>
                        <th className="py-3.5 px-5">Rincian Komoditas</th>
                        <th className="py-3.5 px-5">Total Pembayaran</th>
                        <th className="py-3.5 px-5">Status Pesanan</th>
                        <th className="py-3.5 px-5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-16 text-center text-slate-400">
                            Tidak ada riwayat pesanan yang sesuai dengan filter yang dipilih.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => {
                          let itemsList = [];
                          try { itemsList = JSON.parse(order.items); } catch(e) {}
                          const orderIndex = orders.findIndex(o => o.id === order.id);
                          const kodePesanan = order.orderCode || `RND-${String(orders.length - orderIndex).padStart(3, '0')}`;

                          return (
                            <tr key={order.id} className={`hover:bg-slate-50/70 transition ${order.status === 'Batal' ? 'opacity-60 bg-slate-50/50' : ''}`}>
                              <td className="py-4 px-5">
                                <span className="font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                                  {kodePesanan}
                                </span>
                              </td>
                              <td className="py-4 px-5 text-slate-600 whitespace-nowrap">
                                <div className="font-semibold text-slate-800">
                                  {new Date(order.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(order.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                </div>
                              </td>
                              <td className="py-4 px-5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                                    {(order.customerName || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <span className="font-bold text-slate-900">{order.customerName}</span>
                                </div>
                              </td>
                              <td className="py-4 px-5 text-slate-700">
                                <div className="space-y-1 max-w-xs">
                                  {itemsList.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between gap-3 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                                      <span className="truncate">{item.name}</span>
                                      <span className="font-bold text-slate-500 tabular-nums shrink-0">x{item.quantity}</span>
                                    </div>
                                  ))}
                                </div>
                              </td>
                              <td className="py-4 px-5 font-bold text-slate-900 tabular-nums">
                                Rp {(order.totalPrice || 0).toLocaleString('id-ID')}
                              </td>
                              <td className="py-4 px-5">
                                <select 
                                  value={order.status}
                                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                  className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border cursor-pointer outline-none transition ${getStatusBadge(order.status)}`}
                                >
                                  <option value="Menunggu Konfirmasi">Menunggu Konfirmasi</option>
                                  <option value="Di Proses">Di Proses</option>
                                  <option value="Di Kirim">Di Kirim</option>
                                  <option value="Selesai">Selesai</option>
                                  <option value="Batal">Batal</option>
                                </select>
                              </td>
                              <td className="py-4 px-5 text-right">
                                <button
                                  onClick={() => handleDeleteOrder(order.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                  title="Hapus Riwayat Pesanan"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: KELOLA PENGGUNA                                */}
          {/* ==================================================== */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Daftar Pengguna Terdaftar</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Kelola hak akses akun staf administrator dan akun pembeli.</p>
                </div>
                <div className="text-xs text-slate-500">
                  Total Pengguna: <b className="text-slate-900">{users.length}</b>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3.5 px-5">Pengguna</th>
                        <th className="py-3.5 px-5">Tanggal Bergabung</th>
                        <th className="py-3.5 px-5">Tingkat Akses</th>
                        <th className="py-3.5 px-5 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-16 text-center text-slate-400">
                            Belum ada akun pengguna yang terdaftar di sistem.
                          </td>
                        </tr>
                      ) : (
                        users.map((user) => {
                          const isCurrentUser = user.username === sessionStorage.getItem('username');
                          return (
                            <tr key={user.id} className="hover:bg-slate-50/70 transition">
                              <td className="py-3.5 px-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">
                                    {(user.username || 'U').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900">{user.username}</span>
                                      {isCurrentUser && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                          Akun Anda
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-slate-400">ID: {user.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-5 text-slate-600">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                              </td>
                              <td className="py-3.5 px-5">
                                <select
                                  value={user.role}
                                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border cursor-pointer outline-none transition ${
                                    user.role === 'ADMIN'
                                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  <option value="USER">USER (Pembeli)</option>
                                  <option value="ADMIN">ADMIN (Pengelola)</option>
                                </select>
                              </td>
                              <td className="py-3.5 px-5 text-right">
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.username)}
                                  disabled={isCurrentUser}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                                  title={isCurrentUser ? "Tidak dapat menghapus akun sendiri" : "Hapus Akun"}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* ======================================================== */}
      {/* 4. APPLE-INSPIRED MODAL (Tambah & Edit Produk)           */}
      {/* ======================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  {isEditing ? <Edit3 size={16} /> : <Plus size={16} />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {isEditing ? "Edit Data Produk" : "Tambah Produk Baru"}
                  </h3>
                  <p className="text-[11px] text-slate-500">Perbarui rincian komoditas dan stok barang.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* Product Name */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Nama Produk Komoditas</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition" 
                  placeholder="Contoh: Kopra Super Asalan" 
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Kategori Komoditas</label>
                  <select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleInputChange} 
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 bg-white font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition"
                  >
                    <option value="Bahan Baku">Bahan Baku</option>
                    <option value="Kopra">Kopra</option>
                    <option value="Kelapa Utuh">Kelapa Utuh</option>
                    <option value="Minyak">Minyak</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Harga Satuan (Rp)</label>
                  <input 
                    type="number" 
                    name="price" 
                    min="0" 
                    value={formData.price === 0 ? '' : formData.price} 
                    onChange={handleInputChange} 
                    required 
                    placeholder="0" 
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition" 
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Stok Tersedia (kg / pcs)</label>
                <input 
                  type="number" 
                  min="0"
                  name="stock"
                  value={formData.stock === 0 ? 0 : (formData.stock || '')} 
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} 
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition" 
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Deskripsi Singkat</label>
                <textarea 
                  name="description" 
                  value={formData.description || ""} 
                  onChange={handleInputChange} 
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl p-3 font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 outline-none transition" 
                  placeholder="Kadar air maksimal, standar mutu, kemasan karung..." 
                />
              </div>

              {/* Image Upload & Preview */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Foto Produk Komoditas</label>
                
                {imagePreview && (
                  <div className="mb-3 relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Pratinjau" 
                      className="w-24 h-24 object-cover rounded-xl border border-slate-200 shadow-xs" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                        setFormData({ ...formData, image: '' });
                      }}
                      className="absolute -top-2 -right-2 bg-slate-900 text-white p-1 rounded-full shadow-md hover:bg-rose-600 transition"
                      title="Hapus Gambar"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 mt-1">Format: JPG, PNG, WEBP (Maks 2MB). Disimpan dalam format Base64 yang ramah Vercel.</p>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-[0.98] text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{isSaving ? "Menyimpan..." : "Simpan Produk"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. FLOATING ADMIN ASSISTANT WIDGET                      */}
      {/* ======================================================== */}
      <AdminChatbot onActionSuccess={() => { fetchProducts(); fetchOrders(); }} />

    </div>
  );
}