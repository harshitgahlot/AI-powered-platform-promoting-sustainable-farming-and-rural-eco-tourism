import React, { useEffect, useState } from 'react';
import { farmService } from '../../services/farmService';
import type { Farm } from '../../services/farmService';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { MapPin, Star, Sprout } from 'lucide-react';

export const FarmListingsPage: React.FC = () => {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchFarms = async () => {
    try {
      const res = await farmService.list({ search, sort, status: 'approved' });
      setFarms(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, [search, sort]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <Sprout className="w-8 h-8 text-primary-600" /> Agri-Experiences & Organic Farms
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Discover community-led organic farms, harvesting events, and eco-workshops.</p>
      </div>

      {/* Filter panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="sm:col-span-2">
          <Input
            label="Search Farms"
            placeholder="Search by name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          label="Sort By"
          options={[
            { value: '', label: 'Default' },
            { value: 'rating_desc', label: 'Highest Rated' },
            { value: 'name_asc', label: 'Name (A-Z)' }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <Card hoverEffect key={farm.id} className="flex flex-col h-full">
              <img
                src={farm.images[0]?.url || 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400'}
                alt={farm.name}
                className="w-full h-48 rounded-xl object-cover"
              />
              <div className="flex-1 pt-4 space-y-2">
                <Link to={`/farms/${farm.id}`} className="text-base font-extrabold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                  {farm.name}
                </Link>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                  {farm.description}
                </p>
              </div>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-slate-600 dark:text-slate-400 text-xs">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-500" /> {farm.location}
                </span>
                <span className="flex items-center gap-0.5 font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" /> {farm.rating.toFixed(1)}
                </span>
              </div>
            </Card>
          ))}
          {farms.length === 0 && (
            <div className="col-span-full py-16 text-center text-slate-400 text-sm">
              No farms found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default FarmListingsPage;
