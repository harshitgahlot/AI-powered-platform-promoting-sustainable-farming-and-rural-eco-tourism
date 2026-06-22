import React, { useEffect, useState } from 'react';
import { bookingService } from '../../services/bookingService';
import type { FarmBooking, HomestayBooking } from '../../services/bookingService';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { CalendarRange, Sprout, Home, XCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BookingManagementPage: React.FC = () => {
  const { toasts, addToast, removeToast } = useToast();
  
  const [farmBookings, setFarmBookings] = useState<FarmBooking[]>([]);
  const [homestayBookings, setHomestayBookings] = useState<HomestayBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const data = await bookingService.list();
      setFarmBookings(data.farm_bookings);
      setHomestayBookings(data.homestay_bookings);
    } catch (err) {
      console.error(err);
      addToast('Error loading reservations list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelFarmBooking = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this farm tour?")) return;
    try {
      await bookingService.updateFarmBookingStatus(id, 'cancelled');
      addToast('Farm tour visit cancelled successfully', 'info');
      loadBookings();
    } catch (err) {
      addToast('Failed to cancel tour booking', 'error');
    }
  };

  const handleCancelHomestayBooking = async (id: number) => {
    if (!window.confirm("Are you sure you want to cancel this lodging reservation?")) return;
    try {
      await bookingService.updateHomestayBookingStatus(id, 'cancelled');
      addToast('Lodging reservation cancelled successfully', 'info');
      loadBookings();
    } catch (err) {
      addToast('Failed to cancel lodging reservation', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400',
      confirmed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400',
      completed: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-400'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="flex items-center gap-4">
        <Link to="/dashboard" className="p-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-xl transition-all">
          <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </Link>
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarRange className="w-8 h-8 text-primary-600" /> Booking Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and update your reservation histories.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Farm Bookings */}
        <Card className="space-y-4">
          <h2 className="text-lg font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2 text-primary-600">
            <Sprout className="w-5 h-5" /> Farm Visits
          </h2>
          {farmBookings.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {farmBookings.map(b => (
                <div key={b.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{b.farm?.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Visit Date: {b.visit_date} • Guests: {b.number_of_guests}</p>
                    <p className="text-[10px] text-slate-400 mt-2">Booked on: {new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex sm:flex-col items-end gap-3 sm:gap-2 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-none pt-3 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black">${b.total_price.toFixed(2)}</span>
                      {getStatusBadge(b.status)}
                    </div>
                    {b.status === 'pending' || b.status === 'confirmed' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        className="gap-1 px-3.5 py-1.5"
                        onClick={() => handleCancelFarmBooking(b.id)}
                      >
                        <XCircle className="w-4 h-4" /> Cancel Tour
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No farm tours recorded.</p>
          )}
        </Card>

        {/* Homestay Bookings */}
        <Card className="space-y-4">
          <h2 className="text-lg font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2 text-primary-600">
            <Home className="w-5 h-5" /> Lodging Bookings
          </h2>
          {homestayBookings.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {homestayBookings.map(b => (
                <div key={b.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{b.room?.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Check-in: {b.check_in} • Check-out: {b.check_out}</p>
                    <p className="text-[10px] text-slate-400 mt-2">Booked on: {new Date(b.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex sm:flex-col items-end gap-3 sm:gap-2 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-none pt-3 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black">${b.total_price.toFixed(2)}</span>
                      {getStatusBadge(b.status)}
                    </div>
                    {b.status === 'pending' || b.status === 'confirmed' ? (
                      <Button
                        variant="danger"
                        size="sm"
                        className="gap-1 px-3.5 py-1.5"
                        onClick={() => handleCancelHomestayBooking(b.id)}
                      >
                        <XCircle className="w-4 h-4" /> Cancel Lodging
                      </Button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No lodging reservations recorded.</p>
          )}
        </Card>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default BookingManagementPage;
