import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { homestayService } from '../../services/homestayService';
import type { Homestay, Room } from '../../services/homestayService';
import { bookingService } from '../../services/bookingService';
import type { HomestayBooking } from '../../services/bookingService';
import { analyticsService } from '../../services/analyticsService';
import type { PlatformAnalytics } from '../../services/analyticsService';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import OccupancyChart from '../../components/charts/OccupancyChart';
import RevenueChart from '../../components/charts/RevenueChart';
import { CalendarRange, DollarSign, Home, Plus, Check, X, ShieldAlert, Users } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export const HomestayDashboard: React.FC = () => {
  const { toasts, addToast, removeToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.includes('/rooms')) {
      document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' });
    } else if (location.pathname.includes('/bookings')) {
      document.getElementById('bookings-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.pathname]);

  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [bookings, setBookings] = useState<HomestayBooking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // New Room fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pricePerNight, setPricePerNight] = useState(0);
  const [occupancy, setOccupancy] = useState(2);

  // Registration fields
  const [regName, setRegName] = useState('');
  const [regDescription, setRegDescription] = useState('');
  const [regLocation, setRegLocation] = useState('');
  const [regLatitude, setRegLatitude] = useState(32.2215);
  const [regLongitude, setRegLongitude] = useState(76.3201);
  const [registering, setRegistering] = useState(false);

  const loadHomestayData = async () => {
    try {
      const profile = await homestayService.getMyProfile();
      setHomestay(profile);
      
      const allBookings = await bookingService.list();
      setBookings(allBookings.homestay_bookings);
      
      const rmList = await homestayService.listRooms(profile.id);
      setRooms(rmList);

      const stats = await analyticsService.getAnalytics();
      setAnalytics(stats);
    } catch (err) {
      console.error("Error fetching homestay dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomestayData();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!homestay) return;
    if (!name || !description || pricePerNight <= 0 || occupancy <= 0) {
      addToast('Please input valid room specifications', 'error');
      return;
    }
    try {
      await homestayService.addRoom(homestay.id, {
        name,
        description,
        price_per_night: pricePerNight,
        occupancy,
        is_available: true
      });
      addToast('Room added successfully!', 'success');
      setModalOpen(false);
      setName('');
      setDescription('');
      setPricePerNight(0);
      setOccupancy(2);
      loadHomestayData();
    } catch (err) {
      addToast('Failed to list room', 'error');
    }
  };

  const handleRegisterHomestay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regDescription || !regLocation) {
      addToast('Please fill in all listing details', 'error');
      return;
    }
    setRegistering(true);
    try {
      await homestayService.create({
        name: regName,
        description: regDescription,
        location: regLocation,
        latitude: regLatitude,
        longitude: regLongitude
      });
      addToast('Homestay registration submitted successfully! Waiting for admin approval.', 'success');
      loadHomestayData();
    } catch (err) {
      addToast('Failed to register homestay listing', 'error');
    } finally {
      setRegistering(false);
    }
  };

  const handleBookingAction = async (id: number, status: string) => {
    try {
      await bookingService.updateHomestayBookingStatus(id, status);
      addToast(`Reservation marked as ${status}!`, 'success');
      loadHomestayData();
    } catch (err) {
      addToast('Failed to update reservation status', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!homestay) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <Card className="p-6 md:p-8 space-y-6">
          <div className="text-center space-y-2">
            <Home className="w-12 h-12 text-primary-600 mx-auto animate-bounce" />
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Register Your Homestay Listing</h2>
            <p className="text-sm text-slate-500">To start hosting guests and listing rooms, please register your homestay details for administration approval.</p>
          </div>
          <form onSubmit={handleRegisterHomestay} className="space-y-4">
            <Input
              label="Homestay / Resort Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="e.g. Sunita's Himalayan Foothill Resort"
              required
            />
            <Input
              label="Description"
              value={regDescription}
              onChange={(e) => setRegDescription(e.target.value)}
              placeholder="Tell guests about your property, views, food, amenities..."
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
              Register Homestay Listing
            </Button>
          </form>
        </Card>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
      </div>
    );
  }

  const estimatedRevenue = bookings
    .filter(b => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.total_price, 0);

  // Compute Occupancy rates PieChart
  const totalRooms = rooms.length;
  const occupiedRooms = bookings.filter(b => b.status === 'confirmed').length;
  const availableRooms = Math.max(0, totalRooms - occupiedRooms);
  
  const occupancyData = [
    { name: 'Available Rooms', value: availableRooms || 3 },
    { name: 'Occupied Rooms', value: occupiedRooms || 1 }
  ];

  return (
    <div className="space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Welcome & Approval Status */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Home className="w-8 h-8 text-primary-600" /> Homestay Partner Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Resort: <span className="font-bold text-slate-700 dark:text-slate-300">{homestay?.name || 'Unregistered'}</span>
          </p>
        </div>
        {homestay?.status !== 'approved' && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-bold border border-yellow-500/20">
            <ShieldAlert className="w-4 h-4" /> Approval Status: {homestay?.status || 'Pending'}
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
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">${estimatedRevenue.toFixed(2)}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-4 bg-blue-500/10 text-blue-600 rounded-2xl">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Reservations</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{bookings.length}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 text-purple-600 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase">Rooms Inventory</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{rooms.length}</p>
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
            <h3 className="text-sm font-extrabold text-slate-400 uppercase">Homestay Occupancy Ratios</h3>
            <OccupancyChart data={occupancyData} />
          </Card>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings List */}
        <Card id="bookings-section" className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">Guest Reservations</h3>
          {bookings.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {bookings.map(b => (
                <div key={b.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 first:pt-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Lodger: {b.tourist?.full_name || 'Jane Doe'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Room: {b.room?.name} • Check-in: {b.check_in} • Check-out: {b.check_out} • Price: ${b.total_price}
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
            <p className="text-xs text-slate-400 py-6 text-center">No lodgers reservations received yet.</p>
          )}
        </Card>

        {/* Room List Inventory */}
        <Card id="rooms-section" className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="text-base font-extrabold">Rooms List</h3>
            {homestay?.status === 'approved' && (
              <button
                onClick={() => setModalOpen(true)}
                className="p-1.5 bg-primary-600 hover:bg-primary-500 text-white rounded-xl active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
          {homestay?.status !== 'approved' ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
              Listing pending approval. You can add room configurations once your resort listing is approved by the admin.
            </p>
          ) : rooms.length > 0 ? (
            <div className="space-y-3">
              {rooms.map(r => (
                <div key={r.id} className="flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{r.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Capacity: {r.occupancy} Guests • Available: {r.is_available ? 'Yes' : 'No'}</p>
                  </div>
                  <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400 shrink-0">${r.price_per_night}/night</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No rooms registered yet.</p>
          )}
        </Card>
      </div>

      {/* Add Room Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Register Room Listing">
        <form onSubmit={handleCreateRoom} className="space-y-4">
          <Input
            label="Room Suite Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Cedar Valley View Suite"
            required
          />
          <Input
            label="Room Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Amenities, bedding types, window views..."
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price per Night ($)"
              type="number"
              value={pricePerNight}
              onChange={(e) => setPricePerNight(parseFloat(e.target.value))}
              required
            />
            <Input
              label="Max Occupancy"
              type="number"
              value={occupancy}
              onChange={(e) => setOccupancy(parseInt(e.target.value))}
              required
            />
          </div>
          <Button type="submit" className="w-full mt-2">
            Add Room Suite
          </Button>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default HomestayDashboard;
