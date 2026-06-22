import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { CreditCard, ShoppingBag, MapPin, CheckCircle } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, totalPrice, checkout } = useCart();
  const { toasts, addToast, removeToast } = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !city || !zipCode) {
      addToast('Please complete shipping fields', 'error');
      return;
    }
    setLoading(true);
    try {
      await checkout();
      setOrderCompleted(true);
      addToast('Order completed successfully!', 'success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to complete checkout';
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (orderCompleted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-center">
        <Card className="max-w-md p-8 glass space-y-6" glassEffect>
          <CheckCircle className="w-16 h-16 mx-auto text-emerald-500 animate-bounce" />
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Order Confirmed!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Thank you for supporting rural farmers! Your order has been registered and is being prepared for shipment.
          </p>
          <p className="text-xs text-slate-400">Redirecting to your dashboard...</p>
        </Card>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-primary-600" /> Secure Checkout
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Provide shipping coordinates and finalize your order checkout.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Form */}
        <div className="lg:col-span-2">
          <Card className="space-y-6">
            <h2 className="text-lg font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" /> Shipping Address
            </h2>
            <form onSubmit={handleCheckout} className="space-y-4">
              <Input
                label="Street Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Eco Road, Valley Lane"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Dharamshala"
                  required
                />
                <Input
                  label="ZIP / Postal Code"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="176215"
                  required
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={loading}
                >
                  Pay & Place Order (${totalPrice.toFixed(2)})
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Item Summary List */}
        <div>
          <Card className="space-y-4" glassEffect>
            <h2 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary-600" /> Order Summary
            </h2>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="py-2.5 flex justify-between items-center text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{item.product.name}</p>
                    <p className="text-slate-400 mt-0.5">Qty: {item.quantity} x ${item.product.price.toFixed(2)}</p>
                  </div>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 text-xs font-bold text-slate-500 space-y-1.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="text-slate-800 dark:text-slate-200">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="text-emerald-500 font-bold">FREE</span>
              </div>
              <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-black text-sm">
                <span>Grand Total:</span>
                <span className="text-primary-600">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default CheckoutPage;
