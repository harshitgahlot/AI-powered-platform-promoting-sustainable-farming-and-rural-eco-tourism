import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, totalPrice, updateCartItem, removeFromCart, loading } = useCart();
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();

  const handleQuantityChange = async (productId: number, currentQty: number, change: number) => {
    const newQty = currentQty + change;
    if (newQty <= 0) return;
    try {
      await updateCartItem(productId, newQty);
    } catch (err) {
      addToast('Cannot exceed available stock limit', 'error');
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await removeFromCart(productId);
      addToast('Item removed from cart', 'info');
    } catch (err) {
      addToast('Failed to remove item', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-primary-600" /> Shopping Cart
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Review your selected organic products before checking out.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.length > 0 ? (
            <Card className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex gap-4 items-center">
                    <img
                      src={item.product?.images[0]?.url || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150'}
                      alt={item.product?.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{item.product?.name}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 capitalize">Category: {item.product?.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-none pt-3 sm:pt-0">
                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.product_id, item.quantity, -1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-sm font-extrabold w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.product_id, item.quantity, 1)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price and Action */}
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white w-20 text-right">${(item.product?.price * item.quantity).toFixed(2)}</span>
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      className="p-1.5 hover:bg-red-500/10 text-red-500 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          ) : (
            <Card className="py-16 text-center text-slate-400 space-y-4">
              <ShoppingCart className="w-12 h-12 mx-auto text-slate-300 animate-bounce" />
              <p className="text-sm font-semibold">Your shopping cart is currently empty.</p>
              <Link to="/marketplace" className="inline-block">
                <Button variant="primary">Browse Marketplace</Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div>
          {items.length > 0 && (
            <Card className="space-y-4" glassEffect>
              <h2 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">Order Summary</h2>
              
              <div className="text-xs font-bold text-slate-500 space-y-2 py-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-slate-800 dark:text-slate-200">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping:</span>
                  <span className="text-emerald-500">FREE</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-sm font-black">
                  <span>Total price:</span>
                  <span className="text-primary-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/checkout')}
                className="w-full gap-2"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>
            </Card>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default CartPage;
