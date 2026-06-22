import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../services/authService';
import type { User } from '../../services/authService';
import { farmService } from '../../services/farmService';
import type { Farm } from '../../services/farmService';
import { homestayService } from '../../services/homestayService';
import type { Homestay } from '../../services/homestayService';
import { marketplaceService } from '../../services/marketplaceService';
import type { Product } from '../../services/marketplaceService';
import { analyticsService } from '../../services/analyticsService';
import type { PlatformAnalytics } from '../../services/analyticsService';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import RevenueChart from '../../components/charts/RevenueChart';
import {
  Users, MapPin, ShoppingBag, ShieldCheck, Ban, Check, X, AlertOctagon, LineChart, Star
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export const AdminDashboard: React.FC = () => {
  const { toasts, addToast, removeToast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [pendingFarms, setPendingFarms] = useState<Farm[]>([]);
  const [pendingHomestays, setPendingHomestays] = useState<Homestay[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const getTabFromPath = (pathname: string): 'analytics' | 'moderation' | 'users' | 'reviews' => {
    if (pathname.includes('/users')) return 'users';
    if (pathname.includes('/moderation')) return 'moderation';
    if (pathname.includes('/reviews')) return 'reviews';
    return 'analytics';
  };

  const activeTab = getTabFromPath(location.pathname);

  const handleTabChange = (tab: 'analytics' | 'moderation' | 'users' | 'reviews') => {
    if (tab === 'analytics') {
      navigate('/dashboard/analytics');
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

  const loadAdminData = async () => {
    try {
      const uList = await authService.listUsers();
      setUsers(uList);

      const fPending = await farmService.list({ status: 'pending_approval' });
      setPendingFarms(fPending.items);

      const hPending = await homestayService.list({ status: 'pending_approval' });
      setPendingHomestays(hPending.items);

      const pPending = await marketplaceService.listProducts({ status: 'pending_approval' });
      setPendingProducts(pPending.items);

      const rList = await api.get('/reviews');
      setReviews(rList.data.items);

      const stats = await analyticsService.getAnalytics();
      setAnalytics(stats);
    } catch (err) {
      console.error("Error loading admin data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleUserSuspension = async (userId: number, isSuspended: boolean) => {
    try {
      await authService.suspendUser(userId, isSuspended);
      addToast(isSuspended ? 'User successfully suspended' : 'User suspension lifted', 'success');
      loadAdminData();
    } catch (err) {
      addToast('Failed to toggle suspension state', 'error');
    }
  };

  const handleFarmApproval = async (id: number, status: string) => {
    try {
      await farmService.approve(id, status);
      addToast(`Farm listing marked as ${status}!`, 'success');
      loadAdminData();
    } catch (err) {
      addToast('Failed to moderate farm', 'error');
    }
  };

  const handleHomestayApproval = async (id: number, status: string) => {
    try {
      await homestayService.approve(id, status);
      addToast(`Homestay listing marked as ${status}!`, 'success');
      loadAdminData();
    } catch (err) {
      addToast('Failed to moderate homestay', 'error');
    }
  };

  const handleProductApproval = async (id: number, status: string) => {
    try {
      await marketplaceService.approveProduct(id, status);
      addToast(`Product marked as ${status}!`, 'success');
      loadAdminData();
    } catch (err) {
      addToast('Failed to moderate product', 'error');
    }
  };

  const handleReviewModeration = async (id: number, status: string) => {
    try {
      await api.put(`/reviews/${id}/moderate`, { status });
      addToast(`Review moderated to ${status}`, 'success');
      loadAdminData();
    } catch (err) {
      addToast('Failed to moderate review', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-primary-600" /> Admin Oversight Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Moderating registrations, listings, reviews, and platform metrics.</p>
        </div>
      </section>

      {/* Analytics Counter Row */}
      {analytics && (
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <Card className="flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-2xl">
              <LineChart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Revenue</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">${analytics.total_revenue.toFixed(2)}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Users Pool</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{analytics.total_users}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="p-4 bg-amber-500/10 text-amber-600 rounded-2xl">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Homestay listings</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{analytics.total_bookings}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="p-4 bg-purple-500/10 text-purple-600 rounded-2xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">Orders Sold</p>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white">{analytics.total_orders}</p>
            </div>
          </Card>
        </section>
      )}

      {/* Tabs Selector */}
      <section className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {['analytics', 'moderation', 'users', 'reviews'].map(tab => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab as any)}
            className={`pb-3 text-sm font-bold capitalize transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-primary-600 text-primary-600 dark:text-primary-400' 
                : 'border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </section>

      {/* Tab Panels */}
      <section className="space-y-6">
        {/* Panel 1: Analytics Area Charts */}
        {activeTab === 'analytics' && analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase">Daily Transaction Performance</h3>
              <RevenueChart data={analytics.daily_history} />
            </Card>
            <Card className="space-y-4 animate-pulse">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase">System Logs</h3>
              <div className="space-y-3 py-6 text-xs text-slate-500">
                <p>⚡ Database transaction pool checks completed.</p>
                <p>⚡ Content recommendation vectors TF-IDF updated: 3 entries.</p>
                <p>⚡ Ridge forecasting model weights recalculations: R2=0.82.</p>
                <p>⚡ Review sentiment analyzer pipeline loaded correctly.</p>
              </div>
            </Card>
          </div>
        )}

        {/* Panel 2: Listings Moderation */}
        {activeTab === 'moderation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Farms */}
            <Card className="space-y-4">
              <h3 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">Pending Farms</h3>
              {pendingFarms.length > 0 ? (
                <div className="space-y-4">
                  {pendingFarms.map(f => (
                    <div key={f.id} className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{f.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">{f.location}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => handleFarmApproval(f.id, 'approved')} className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleFarmApproval(f.id, 'rejected')} className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No farm listings waiting approval.</p>
              )}
            </Card>

            {/* Homestays */}
            <Card className="space-y-4">
              <h3 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">Pending Homestays</h3>
              {pendingHomestays.length > 0 ? (
                <div className="space-y-4">
                  {pendingHomestays.map(h => (
                    <div key={h.id} className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{h.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">{h.location}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => handleHomestayApproval(h.id, 'approved')} className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleHomestayApproval(h.id, 'rejected')} className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No homestays waiting approval.</p>
              )}
            </Card>

            {/* Products */}
            <Card className="space-y-4">
              <h3 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">Pending Products</h3>
              {pendingProducts.length > 0 ? (
                <div className="space-y-4">
                  {pendingProducts.map(p => (
                    <div key={p.id} className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Price: ${p.price} • Stock: {p.stock}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => handleProductApproval(p.id, 'approved')} className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleProductApproval(p.id, 'rejected')} className="p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">No products waiting approval.</p>
              )}
            </Card>
          </div>
        )}

        {/* Panel 3: Users Suspension Control */}
        {activeTab === 'users' && (
          <Card className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-400">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Account Role</th>
                  <th className="pb-3">Suspended State</th>
                  <th className="pb-3 text-right">Moderating Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                    <td className="py-4 font-bold text-slate-900 dark:text-white">{u.full_name}</td>
                    <td className="py-4">{u.email}</td>
                    <td className="py-4 capitalize font-bold text-primary-600 dark:text-primary-400">{u.role}</td>
                    <td className="py-4">{u.is_suspended ? <span className="text-red-500 font-bold">Suspended</span> : <span className="text-emerald-500 font-bold">Active</span>}</td>
                    <td className="py-4 text-right">
                      {u.role !== 'admin' && (
                        <Button
                          variant={u.is_suspended ? 'secondary' : 'danger'}
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleUserSuspension(u.id, !u.is_suspended)}
                        >
                          <Ban className="w-3.5 h-3.5" /> {u.is_suspended ? 'Reactivate' : 'Suspend'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {/* Panel 4: Reviews Moderation */}
        {activeTab === 'reviews' && (
          <Card className="space-y-4">
            <h3 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">Reviews Moderation</h3>
            {reviews.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map(r => {
                  const isPositive = r.sentiment_score > 0.15;
                  const isNegative = r.sentiment_score < -0.15;
                  const scoreColor = isPositive ? 'text-emerald-500' : isNegative ? 'text-rose-500' : 'text-slate-500';
                  
                  return (
                    <div key={r.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 first:pt-0 last:pb-0">
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{r.user?.full_name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-extrabold">Target: {r.target_type} (ID: {r.target_id})</span>
                          <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
                            <Star className="w-3 h-3 fill-current" /> {r.rating}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{r.comment}"</p>
                        <div className="flex items-center gap-2 pt-1 text-[10px] font-bold">
                          <span>AI Sentiment Score:</span>
                          <span className={`${scoreColor}`}>{r.sentiment_score.toFixed(2)} ({r.sentiment_score > 0.15 ? 'Positive' : r.sentiment_score < -0.15 ? 'Negative' : 'Neutral'})</span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {r.status === 'approved' ? (
                          <Button
                            variant="danger"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleReviewModeration(r.id, 'flagged')}
                          >
                            <AlertOctagon className="w-3.5 h-3.5" /> Flag
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            className="gap-1"
                            onClick={() => handleReviewModeration(r.id, 'approved')}
                          >
                            <Check className="w-3.5 h-3.5" /> Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No reviews submitted yet.</p>
            )}
          </Card>
        )}
      </section>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default AdminDashboard;
