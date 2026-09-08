import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface Product {
  id: string | number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  stock?: number;
  satuan?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const { toast } = useToast();
  const [inputQty, setInputQty] = useState<number>(1);

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) {
      toast.warning("Maaf, stok produk ini sedang kosong.");
      return;
    }
    if (inputQty > 0) {
      onAddToCart(product, inputQty);
      setInputQty(1);
      toast.success(`Berhasil menambahkan ${inputQty} ${product.satuan || 'kg'} ke keranjang!`, product.name);
    } else {
      toast.warning("Jumlah pesanan minimal 1");
    }
  };

  const handleQtyChange = (delta: number) => {
    const next = inputQty + delta;
    if (next >= 1) {
      setInputQty(next);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200/80 hover:border-orange-500/30 hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-300 flex flex-col h-full overflow-hidden group">
      {/* Product Image Frame */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <img 
          src={product.image || '/bannerbg.png'} 
          alt={product.name} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Status Pill Badge */}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${
              isOutOfStock 
                ? "bg-rose-500/10 text-rose-700 border-rose-500/20" 
                : "bg-emerald-500/10 text-emerald-800 border-emerald-500/20"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? "bg-rose-500" : "bg-emerald-600"}`} />
            {isOutOfStock ? "Stok Habis" : "Stok Ready"}
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-md border border-orange-200/60">
            {product.category}
          </span>
          {product.stock !== undefined && (
            <span className="text-xs text-stone-600 font-medium">
              Sisa: <b className="text-stone-800">{product.stock} {product.satuan || 'kg'}</b>
            </span>
          )}
        </div>

        <h3 className="text-lg font-bold text-stone-900 tracking-tight leading-snug group-hover:text-orange-600 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mt-1.5">
            {product.description}
          </p>
        )}

        {/* Price and Cart Controls */}
        <div className="mt-auto pt-4 border-t border-stone-100 flex flex-col gap-3">
          <div>
            <span className="text-[11px] font-medium text-stone-600 block">Harga per {product.satuan || 'kg'}</span>
            <div className="text-xl font-bold text-orange-600 tracking-tight">
              Rp {product.price.toLocaleString('id-ID')}
            </div>
          </div>

          {/* Stepper and Action Button */}
          <div className="flex items-center gap-2">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-stone-200 rounded-xl bg-stone-50 overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => handleQtyChange(-1)}
                disabled={isOutOfStock || inputQty <= 1}
                className="w-8 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 active:scale-90 transition disabled:opacity-40"
                aria-label="Kurangi jumlah"
              >
                <Minus size={14} />
              </button>
              <input
                type="number"
                min="1"
                disabled={isOutOfStock}
                value={inputQty}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setInputQty(isNaN(val) || val < 1 ? 1 : val);
                }}
                className="w-10 h-9 text-center text-xs font-bold bg-transparent text-stone-800 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => handleQtyChange(1)}
                disabled={isOutOfStock}
                className="w-8 h-9 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 active:scale-90 transition disabled:opacity-40"
                aria-label="Tambah jumlah"
              >
                <Plus size={14} />
              </button>
            </div>

            {/* Add to Cart CTA */}
            <button
              type="button"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`flex-1 h-9 px-3 rounded-xl font-semibold text-xs tracking-wide transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.97] ${
                isOutOfStock
                  ? "bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed"
                  : "bg-slate-900 hover:bg-orange-600 text-white shadow-slate-900/10"
              }`}
            >
              <ShoppingCart size={15} />
              <span>{isOutOfStock ? "Habis" : "Tambah"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;