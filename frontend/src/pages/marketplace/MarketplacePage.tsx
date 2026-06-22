import React, { useEffect, useState } from 'react';
import { marketplaceService } from '../../services/marketplaceService';
import type { Product } from '../../services/marketplaceService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { ShoppingBag, ShoppingCart, Tag } from 'lucide-react';

export const MarketplacePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'fruits', label: 'Fruits' },
    { value: 'vegetables', label: 'Vegetables' },
    { value: 'dairy', label: 'Dairy & Poultry' },
    { value: 'grains', label: 'Grains & Pulses' },
    { value: 'handicrafts', label: 'Handicrafts' },
    { value: 'honey', label: 'Pure Honey' }
  ];

  const fetchProducts = async () => {
    try {
      const res = await marketplaceService.listProducts({
        search,
        category,
        sort,
        status: 'approved'
      });
      setProducts(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, category, sort]);

  const handleAddToCart = async (prodId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(prodId, 1);
      addToast('Item successfully added to cart!', 'success');
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to add item to cart';
      addToast(msg, 'error');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-primary-600" /> Farm-to-Table Marketplace
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Buy fresh organic produce and handcrafted goods directly from rural families.</p>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div className="sm:col-span-2">
          <Input
            label="Search Products"
            placeholder="Search by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          label="Category"
          options={categories}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <Select
          label="Price Order"
          options={[
            { value: '', label: 'Default' },
            { value: 'price_asc', label: 'Price: Low to High' },
            { value: 'price_desc', label: 'Price: High to Low' }
          ]}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-t-transparent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card hoverEffect key={product.id} className="flex flex-col h-full">
              <img
                src={product.images[0]?.url || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300'}
                alt={product.name}
                className="w-full h-40 rounded-xl object-cover"
              />
              <div className="flex-1 pt-4 space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase">
                  <Tag className="w-3.5 h-3.5" /> {product.category}
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-1">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {product.description}
                </p>
                <div className="pt-2 flex justify-between items-center">
                  <span className="text-base font-black text-slate-900 dark:text-white">${product.price.toFixed(2)}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0}
                  >
                    <ShoppingCart className="w-4.5 h-4.5" />
                  </Button>
                </div>
                <p className="text-[10px] font-bold text-slate-400 pt-1">
                  {product.stock > 0 ? `Stock: ${product.stock} units` : 'Out of Stock'}
                </p>
              </div>
            </Card>
          ))}
          {products.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 text-sm">
              No products found matching your criteria.
            </div>
          )}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default MarketplacePage;
