import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import { bookingService } from '../../services/bookingService';
import type { FarmBooking, HomestayBooking } from '../../services/bookingService';
import { marketplaceService } from '../../services/marketplaceService';
import type { Order } from '../../services/marketplaceService';
import type { Farm } from '../../services/farmService';
import type { Homestay } from '../../services/homestayService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CalendarRange, ShoppingBag, MapPin, Star, Sparkles, Compass } from 'lucide-react';

export const TouristDashboard: React.FC = () => {
  const { user } = useAuth();
  
  const [recommendedFarms, setRecommendedFarms] = useState<Farm[]>([]);
  const [recommendedHomestays, setRecommendedHomestays] = useState<Homestay[]>([]);
  const [farmBookings, setFarmBookings] = useState<FarmBooking[]>([]);
  const [homestayBookings, setHomestayBookings] = useState<HomestayBooking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch recommendations
        const farmsRec = await aiService.getRecommendedFarms();
        const homestaysRec = await aiService.getRecommendedHomestays();
        setRecommendedFarms(farmsRec);
        setRecommendedHomestays(homestaysRec);

        // Fetch bookings
        const bookingsRes = await bookingService.list();
        setFarmBookings(bookingsRes.farm_bookings);
        setHomestayBookings(bookingsRes.homestay_bookings);

        // Fetch orders
        const ordersRes = await marketplaceService.listOrders();
        setOrders(ordersRes);
      } catch (err) {
        console.error("Error loading tourist dashboard", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400',
      confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400',
      completed: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header section */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Hello, {user?.full_name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Discover sustainable destinations and direct farm-fresh products.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/farms">
            <Button variant="primary" className="gap-2">
              <Compass className="w-4 h-4" /> Discover Farms
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="secondary" className="gap-2">
              <ShoppingBag className="w-4 h-4" /> Shop Products
            </Button>
          </Link>
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
          <Sparkles className="w-6 h-6 animate-pulse" />
          <h2 className="text-xl font-extrabold">AI Recommended Experiences</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Farm Recommendations */}
          <Card className="space-y-4" glassEffect>
            <h3 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">Recommended Farms</h3>
            {recommendedFarms.length > 0 ? (
              <div className="space-y-3">
                {recommendedFarms.slice(0, 3).map(farm => (
                  <div key={farm.id} className="flex gap-4 items-center">
                    <img
                      src={farm.images[0]?.url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=150'}
                      alt={farm.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/farms/${farm.id}`} className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 block truncate">
                        {farm.name}
                      </Link>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-500" /> {farm.location}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-500 mt-1">
                        <Star className="w-3 h-3 fill-current" /> {farm.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No farm recommendations matching your interests yet.</p>
            )}
          </Card>

          {/* Homestay Recommendations */}
          <Card className="space-y-4" glassEffect>
            <h3 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">Recommended Homestays</h3>
            {recommendedHomestays.length > 0 ? (
              <div className="space-y-3">
                {recommendedHomestays.slice(0, 3).map(hs => (
                  <div key={hs.id} className="flex gap-4 items-center">
                    <img
                      src={hs.images[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150'}
                      alt={hs.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <Link to={`/homestays/${hs.id}`} className="text-sm font-bold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 block truncate">
                        {hs.name}
                      </Link>
                      <span className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-red-500" /> {hs.location}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-amber-500 mt-1">
                        <Star className="w-3 h-3 fill-current" /> {hs.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No homestay recommendations matching your interests yet.</p>
            )}
          </Card>
        </div>
      </section>

      {/* Bookings & Reservations */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <CalendarRange className="w-6 h-6" />
          <h2 className="text-xl font-extrabold">Active Bookings</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Farm visits */}
          <Card className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-slate-400">Farm Visits</h3>
            {farmBookings.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {farmBookings.map(fb => (
                  <div key={fb.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{fb.farm?.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Date: {fb.visit_date} • {fb.number_of_guests} Guests</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">${fb.total_price.toFixed(2)}</span>
                      {getStatusBadge(fb.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">No farm visit bookings yet.</p>
            )}
          </Card>

          {/* Homestay lodgings */}
          <Card className="space-y-4">
            <h3 className="text-sm font-extrabold uppercase text-slate-400">Homestay Lodgings</h3>
            {homestayBookings.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {homestayBookings.map(hb => (
                  <div key={hb.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{hb.room?.name}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Check-in: {hb.check_in} • Check-out: {hb.check_out}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">${hb.total_price.toFixed(2)}</span>
                      {getStatusBadge(hb.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">No lodging reservations yet.</p>
            )}
          </Card>
        </div>
      </section>

      {/* Marketplace Orders */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <ShoppingBag className="w-6 h-6" />
          <h2 className="text-xl font-extrabold">Recent Orders</h2>
        </div>
        <Card className="overflow-x-auto">
          {orders.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Items Count</th>
                  <th className="pb-3">Total Price</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-4 font-bold text-slate-900 dark:text-white">#RC-{order.id}</td>
                    <td className="py-4">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-4 font-bold">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
                    <td className="py-4 font-extrabold">${order.total_price.toFixed(2)}</td>
                    <td className="py-4 capitalize font-bold text-primary-600 dark:text-primary-400">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No orders history found.</p>
          )}
        </Card>
      </section>
    </div>
  );
};
export default TouristDashboard;
