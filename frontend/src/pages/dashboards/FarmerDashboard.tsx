import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { farmService } from '../../services/farmService';
import type { Farm } from '../../services/farmService';
import { bookingService } from '../../services/bookingService';
import type { FarmBooking } from '../../services/bookingService';
import { marketplaceService } from '../../services/marketplaceService';
import type { Product } from '../../services/marketplaceService';
import { analyticsService } from '../../services/analyticsService';
import type { PlatformAnalytics } from '../../services/analyticsService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import ProductSalesChart from '../../components/charts/ProductSalesChart';
import RevenueChart from '../../components/charts/RevenueChart';
import { ShoppingBag, CalendarRange, DollarSign, Sprout, Plus, Check, X, ShieldAlert } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export const FarmerDashboard: React.FC = () => {
  const { toasts, addToast, removeToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/products')) {
      document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (location.pathname.includes('/bookings')) {
      document.getElementById('bookings-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.pathname]);

  const [farm, setFarm] = useState<Farm | null>(null);
  const [bookings, setBookings] = useState<FarmBooking[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // New Product fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [category, setCategory] = useState('fruits');

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regDescription, setRegDescription] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regLatitude, setRegLatitude] = useState(32.2190);
  const [regLongitude, setRegLongitude] = useState(76.3234);
  const [registering, setRegistering] = useState(false);

  const loadFarmerData = async () => {
    try {
      const farmProfile = await farmService.getMyProfile();
      setFarm(farmProfile);
      
      const allBookings = await bookingService.list();
      setBookings(allBookings.farm_bookings);
      
      const prods = await marketplaceService.listProducts({ page: 1, limit: 100, status: 'approved' });
      // Filter by farm_id
      setProducts(prods.items.filter(p => p.farm_id === farmProfile.id));

      const stats = await analyticsService.getAnalytics();
      setAnalytics(stats);
    } catch (err) {
      console.error("Error fetching farmer dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmerData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || price <= 0 || stock < 0) {
      addToast('Please input valid product details', 'error');
      return;
    }
    try {
      await marketplaceService.createProduct({
        name,
        description,
        price,
        stock,
        category
      });
      addToast('Product submitted for admin review!', 'success');
      setModalOpen(false);
      setName('');
      setDescription('');
      setPrice(0);
      setStock(0);
      loadFarmerData();
    } catch (err) {
      addToast('Failed to create product listing', 'error');
    }
  };

  const handleRegisterFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regDescription || !regLocation) {
      addToast('Please fill in all farm details', 'error');
      return;
    }
    setRegistering(true);
    try {
      await farmService.create({
        name: regName,
        description: regDescription,
        location: regLocation,
        latitude: regLatitude,
        longitude: regLongitude
      });
      addToast('Farm registration submitted successfully! Waiting for admin approval.', 'success');
      loadFarmerData();
    } catch (err) {
      addToast('Failed to register farm listing', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleBookingAction = async (id: number, status: string) => {
    try {
      await bookingService.updateFarmBookingStatus(id, status);
      addToast(`Booking successfully marked as ${status}!`, 'success');
      loadFarmerData();
    } catch (err) {
      addToast('Failed to update booking status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!farm) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <Card className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <Sprout className="w-12 h-12 text-primary-600 mx-auto animate-bounce" />
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Register Your Farm Listing</h2>
            <p className="text-sm text-slate-500">To start offering tours, visits, and selling local produce, please register your farm details for administration approval.</p>
          </div>
          <form onSubmit={handleRegisterFarm} className="space-y-4">
            <Input
              label="Farm Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="e.g. Green Meadows Organic Farm"
              required
            />
            <Input
              label="Description"
              value={regDescription}
              onChange={(e) => setRegDescription(e.target.value)}
              placeholder="Describe your cultivation practices, produce, tour experiences, history..."
              required
            />
            <Input
              label="Location Address"
              value={regLocation}
              onChange={(e) => setRegLocation(e.target.value)}
              placeholder="e.g. Himachal Hills, India"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Latitude"
                type="number"
                step="0.0001"
                value={regLatitude}
                onChange={(e) => setRegLatitude(parseFloat(e.target.value))}
                required
              />
              <Input
                label="Longitude"
                type="number"
                step="0.0001"
                value={regLongitude}
                onChange={(e) => setRegLongitude(parseFloat(e.target.value))}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-2" isLoading={registering}>
              Register Farm Listing
            </Button>
          </form>
        </Card>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  // Calculate totals
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);

  const productCategoriesData = [
    { category: 'Fruits', sales: products.filter(p => p.category === 'fruits').reduce((sum, p) => sum + p.price * 5, 0) || 12 },
    { category: 'Vegetables', sales: products.filter(p => p.category === 'vegetables').reduce((sum, p) => sum + p.price * 5, 0) || 25 },
    { category: 'Honey', sales: products.filter(p => p.category === 'honey').reduce((sum, p) => sum + p.price * 5, 0) || 45 },
    { category: 'Handicrafts', sales: products.filter(p => p.category === 'handicrafts').reduce((sum, p) => sum + p.price * 5, 0) || 30 }
  ];

  return (
    <div className="space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Welcome & Approval Status */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Sprout className="w-8 h-8 text-primary-600" /> Farm Management Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Farm: <span className="font-bold text-slate-700 dark:text-slate-300">{farm?.name || 'Unregistered'}</span>
          </p>
        </div>
        {farm?.status !== 'approved' && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-bold border border-yellow-500/20">
            <ShieldAlert className="w-4 h-4" /> Approval Status: {farm?.status || 'Pending'}
          </div>
        )}
      </section>

      {/* Counters Stats Row */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Estimated Revenue</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">${totalRevenue.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Total Bookings</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{bookings.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 text-purple-600 rounded-2xl">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Products Shelf</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{products.length}</p>
          </div>
        </Card>
      </section>

      {/* Recharts Analytics Charts */}
      {analytics && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-400 uppercase">Daily Platform Performance</h3>
            <RevenueChart data={analytics.daily_history} />
          </Card>
          <Card className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-400 uppercase">Product Category Revenue</h3>
            <ProductSalesChart data={productCategoriesData} />
          </Card>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings List */}
        <Card id="bookings-section" className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">Incoming Visit Bookings</h3>
          {bookings.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {bookings.map(b => (
                <div key={b.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 first:pt-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Guest: {b.tourist?.full_name || 'John Doe'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Date: {b.visit_date} • Guests count: {b.number_of_guests} • Total: ${b.total_price}
                    </p>
                    <span className="inline-block mt-2 px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                      {b.status}
                    </span>
                  </div>
                  {b.status === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="primary"
                        size="sm"
                        className="p-2"
                        onClick={() => handleBookingAction(b.id, 'confirmed')}
                      >
                        <Check className="w-4 h-4" /> Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        className="p-2"
                        onClick={() => handleBookingAction(b.id, 'cancelled')}
                      >
                        <X className="w-4 h-4" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No tour bookings received yet.</p>
          )}
        </Card>

        {/* Product Inventory Management */}
        <Card id="products-section" className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-base font-extrabold">Products Inventory</h3>
            {farm?.status === 'approved' && (
              <button
                onClick={() => setModalOpen(true)}
                className="p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          {farm?.status !== 'approved' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
              Listing pending approval. You can catalog products once your organic farm listing is approved by the admin.
            </p>
          ) : products.length > 0 ? (
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{p.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Stock: {p.stock} • Category: {p.category}</p>
                  </div>
                  <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400 shrink-0">${p.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No products catalogued yet.</p>
          )}
        </Card>
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Product to Marketplace">
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <Input
            label="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Himalayan Forest Honey"
            required
          />
          <Input
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Details about product sourcing or production..."
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
              required
            />
            <Input
              label="Stock Qty"
              type="number"
              value={stock}
              onChange={(e) => setStock(parseInt(e.target.value))}
              required
            />
          </div>
          <Select
            label="Category"
            options={[
              { value: 'fruits', label: 'Fruits' },
              { value: 'vegetables', label: 'Vegetables' },
              { value: 'dairy', label: 'Dairy' },
              { value: 'grains', label: 'Grains' },
              { value: 'handicrafts', label: 'Handicrafts' },
              { value: 'honey', label: 'Honey' }
            ]}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
          <Button type="submit" className="w-full mt-2">
            Submit Product
          </Button>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default FarmerDashboard;
