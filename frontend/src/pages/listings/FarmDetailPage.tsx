import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { farmService } from '../../services/farmService';
import type { Farm } from '../../services/farmService';
import { bookingService } from '../../services/bookingService';
import { marketplaceService } from '../../services/marketplaceService';
import type { Product } from '../../services/marketplaceService';
import { aiService } from '../../services/aiService';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { MapPin, Star, Calendar, ShoppingCart, MessageSquare, Send } from 'lucide-react';

export const FarmDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toasts, addToast, removeToast } = useToast();

  const [farm, setFarm] = useState<Farm | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [similarFarms, setSimilarFarms] = useState<Farm[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking fields
  const [visitDate, setVisitDate] = useState('');
  const [guests, setGuests] = useState(2);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Review fields
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const loadFarmDetails = async () => {
    if (!id) return;
    try {
      const farmId = parseInt(id);
      const data = await farmService.get(farmId);
      setFarm(data);

      const prods = await marketplaceService.listProducts({ page: 1, limit: 100 });
      setProducts(prods.items.filter(p => p.farm_id === farmId));

      const revList = await api.get(`/reviews/target/farm/${farmId}`);
      setReviews(revList.data.items);

      // Fetch similar destinations via recommendations endpoint
      const recommendations = await aiService.getRecommendedFarms();
      setSimilarFarms(recommendations.filter(f => f.id !== farmId));
    } catch (err) {
      console.error(err);
      addToast('Error loading farm details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFarmDetails();
  }, [id]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!visitDate || guests <= 0) {
      addToast('Please select a valid date and guests count', 'error');
      return;
    }
    setBookingLoading(true);
    try {
      await bookingService.createFarmBooking({
        farm_id: farm!.id,
        visit_date: visitDate,
        number_of_guests: guests
      });
      addToast('Farm experience booked successfully!', 'success');
      setVisitDate('');
      setGuests(2);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to book visit';
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
        target_type: 'farm',
        target_id: farm!.id,
        rating,
        comment
      });
      addToast('Review submitted successfully!', 'success');
      setComment('');
      setRating(5);
      loadFarmDetails();
    } catch (err) {
      addToast('Failed to post review', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddToCart = async (prodId: number) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(prodId, 1);
      addToast('Item added to cart!', 'success');
    } catch (err) {
      addToast('Failed to add product to cart', 'error');
    }
  };

  if (loading || !farm) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Banner */}
      <section className="relative h-96 rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
        <img
          src={farm.images[0]?.url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200'}
          alt={farm.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex items-end p-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{farm.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-red-500" /> {farm.location}
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Star className="w-4 h-4 fill-current" /> {farm.rating.toFixed(1)} / 5.0
              </span>
              <span className="bg-primary-600 text-white px-2 py-0.5 rounded-full capitalize">
                {farm.status}
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
            <h2 className="text-xl font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">About the Farm</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{farm.description}</p>
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs font-bold text-slate-500">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Latitude</p>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5">{farm.latitude.toString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Longitude</p>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5">{farm.longitude.toString()}</p>
              </div>
            </div>
          </Card>

          {/* Products shelf */}
          <Card className="space-y-6">
            <h2 className="text-xl font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2">Fresh Produce & Handmades</h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="flex gap-4 items-center p-3 border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <img
                      src={p.images[0]?.url || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=150'}
                      alt={p.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{p.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">${p.price.toFixed(2)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-1.5"
                          onClick={() => handleAddToCart(p.id)}
                          disabled={p.stock === 0}
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">No products listed from this farm yet.</p>
            )}
          </Card>

          {/* Reviews list */}
          <Card className="space-y-6">
            <h2 className="text-xl font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" /> Reviews & Ratings
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
              <p className="text-xs text-slate-400 py-4">Be the first to review this farm!</p>
            )}

            {/* Write a review */}
            <form onSubmit={handleAddReview} className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
              <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Write a Review</h3>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Describe your tour or interaction..."
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

        {/* Right column: Bookings */}
        <div className="space-y-6">
          <Card className="space-y-4" glassEffect>
            <h3 className="text-base font-extrabold border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" /> Book Farm Tour
            </h3>
            <form onSubmit={handleBooking} className="space-y-4">
              <Input
                label="Visit Date"
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                required
              />
              <Input
                label="Number of Guests"
                type="number"
                min="1"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value))}
                required
              />

              <div className="text-xs font-bold text-slate-500 py-2 border-y border-slate-100 dark:border-slate-800 flex justify-between">
                <span>Estimated Cost ($15/guest):</span>
                <span className="text-slate-800 dark:text-slate-200">${(guests * 15).toFixed(2)}</span>
              </div>

              <Button type="submit" className="w-full gap-2" isLoading={bookingLoading}>
                Confirm Tour Visit
              </Button>
            </form>
          </Card>

          {/* Similar Destinations */}
          {similarFarms.length > 0 && (
            <Card className="space-y-4">
              <h3 className="text-sm font-extrabold text-slate-400 uppercase">Similar Destinations</h3>
              <div className="space-y-3">
                {similarFarms.slice(0, 2).map(sf => (
                  <div key={sf.id} className="flex gap-3 items-center">
                    <img
                      src={sf.images[0]?.url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=150'}
                      alt={sf.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <Link to={`/farms/${sf.id}`} className="text-xs font-bold text-slate-800 dark:text-white hover:text-primary-600 truncate block">
                        {sf.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 block truncate">{sf.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};
export default FarmDetailPage;
