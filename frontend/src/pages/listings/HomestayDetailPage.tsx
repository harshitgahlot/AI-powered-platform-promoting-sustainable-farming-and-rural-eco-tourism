import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { homestayService } from '../../services/homestayService';
import type { Homestay, Room } from '../../services/homestayService';
import { bookingService } from '../../services/bookingService';
import { aiService } from '../../services/aiService';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { MapPin, Star, MessageSquare, Send, BedDouble } from 'lucide-react';

export const HomestayDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toasts, addToast, removeToast } = useToast();

  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [similarHomestays, setSimilarHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadHomestayDetails = async () => {
    if (!id) return;
    try {
      const hsId = parseInt(id);
      const data = await homestayService.get(hsId);
      setHomestay(data);

      const rmList = await homestayService.listRooms(hsId);
      setRooms(rmList);

      const revList = await api.get(`/reviews/target/homestay/${hsId}`);
      setReviews(revList.data.items);

      const recommendations = await aiService.getRecommendedHomestays();
      setSimilarHomestays(recommendations.filter(h => h.id !== hsId));
    } catch (err) {
      console.error(err);
      addToast('Error loading homestay details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomestayDetails();
  }, [id]);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!selectedRoom || !checkIn || !checkOut) {
      addToast('Please select valid check-in and check-out dates', 'error');
      return;
    }
    setBookingLoading(true);
    try {
      await bookingService.createHomestayBooking({
        room_id: selectedRoom.id,
        check_in: checkIn,
        check_out: checkOut
      });
      addToast('Homestay reservation successfully confirmed!', 'success');
      setBookingModalOpen(false);
      setCheckIn('');
      setCheckOut('');
      setSelectedRoom(null);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to complete reservation';
      addToast(msg, 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!comment.trim()) return;
    setReviewLoading(true);
    try {
      await api.post('/reviews', {
        target_type: 'homestay',
        target_id: homestay!.id,
        rating,
        comment
      });
      addToast('Review submitted successfully!', 'success');
      setComment('');
      setRating(5);
      loadHomestayDetails();
    } catch (err) {
      addToast('Failed to post review', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading || !homestay) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  // Calculate estimated total price inside modal
  let daysDifference = 0;
  if (checkIn && checkOut) {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const timeDiff = d2.getTime() - d1.getTime();
    daysDifference = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Banner */}
      <section className="relative h-96 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
        <img
          src={homestay.images[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200'}
          alt={homestay.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{homestay.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-red-500" /> {homestay.location}
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-current" /> {homestay.rating.toFixed(1)} / 5.0
              </span>
              <span className="bg-primary-600 text-white px-2 py-0.5 rounded-full capitalize">
                {homestay.status}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About */}
          <Card className="space-y-4">
            <h2 className="text-xl font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">About the Homestay</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{homestay.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-bold text-slate-500">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Latitude</p>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5">{homestay.latitude.toString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Longitude</p>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5">{homestay.longitude.toString()}</p>
              </div>
            </div>
          </Card>

          {/* Rooms inventory list */}
          <Card className="space-y-4">
            <h2 className="text-xl font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <BedDouble className="w-5 h-5 text-primary-600" /> Rooms Availability
            </h2>
            {rooms.length > 0 ? (
              <div className="space-y-4">
                {rooms.map(room => (
                  <div key={room.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{room.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{room.description}</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-2">Max Occupancy: {room.occupancy} Guests</p>
                    </div>
                    <div className="flex sm:flex-col items-end gap-3 sm:gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-none pt-3 sm:pt-0">
                      <span className="text-lg font-black text-primary-600 dark:text-primary-400">${room.price_per_night} <span className="text-xs text-slate-400 font-semibold">/ night</span></span>
                      <Button
                        size="sm"
                        disabled={!room.is_available}
                        onClick={() => {
                          setSelectedRoom(room);
                          setBookingModalOpen(true);
                        }}
                      >
                        Book Suite
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">No room suites registered yet.</p>
            )}
          </Card>

          {/* Reviews list */}
          <Card className="space-y-6">
            <h2 className="text-xl font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Reviews & Guest Comments
            </h2>
            {reviews.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {reviews.map(r => {
                  const score = r.sentiment_score;
                  const label = score > 0.15 ? 'Positive' : score < -0.15 ? 'Negative' : 'Neutral';
                  const scoreColor = score > 0.15 ? 'bg-emerald-500/10 text-emerald-600' : score < -0.15 ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-500/10 text-slate-600';
                  
                  return (
                    <div key={r.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">{r.user?.full_name}</span>
                        <span className="flex items-center text-amber-500 text-[10px]">
                          <Star className="w-3 h-3 fill-current" /> {r.rating}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${scoreColor}`}>
                          {label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 italic leading-relaxed">"{r.comment}"</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">No reviews yet. Share your experience!</p>
            )}

            {/* Write review */}
            <form onSubmit={handleAddReview} className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Submit Review</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Describe your hospitality experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>
                <div className="w-24">
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                    label="Rating"
                    required
                  />
                </div>
              </div>
              <Button type="submit" size="sm" className="gap-1.5" isLoading={reviewLoading}>
                <Send className="w-3.5 h-3.5" /> Submit Review
              </Button>
            </form>
          </Card>
        </div>

        {/* Similar Destinations */}
        <div className="space-y-6">
          {similarHomestays.length > 0 && (
            <Card className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase">Similar Lodgings</h3>
              <div className="space-y-3">
                {similarHomestays.slice(0, 3).map(sh => (
                  <div key={sh.id} className="flex gap-3 items-center">
                    <img
                      src={sh.images[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=150'}
                      alt={sh.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <Link to={`/homestays/${sh.id}`} className="text-xs font-bold text-slate-800 dark:text-white hover:text-primary-600 truncate block">
                        {sh.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 block truncate">{sh.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Booking Calendar Modal */}
      <Modal isOpen={bookingModalOpen} onClose={() => setBookingModalOpen(false)} title={`Book Room: ${selectedRoom?.name}`}>
        <form onSubmit={handleBookingSubmit} className="space-y-4">
          <Input
            label="Check-in Date"
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
          <Input
            label="Check-out Date"
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />

          <div className="text-xs font-bold text-slate-500 py-3 border-y border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex justify-between">
              <span>Price per Night:</span>
              <span className="text-slate-800 dark:text-slate-200">${selectedRoom?.price_per_night}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Nights:</span>
              <span className="text-slate-800 dark:text-slate-200">{daysDifference} nights</span>
            </div>
            <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-black text-sm">
              <span>Estimated Cost:</span>
              <span className="text-primary-600">${(daysDifference * (selectedRoom?.price_per_night || 0)).toFixed(2)}</span>
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={bookingLoading}>
            Confirm Lodging Reservation
          </Button>
        </form>
      </Modal>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default HomestayDetailPage;
