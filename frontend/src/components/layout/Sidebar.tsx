import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, CalendarRange, MapPin, Users, CheckSquare, MessageSquare, LineChart
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const baseStyle = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200";
  const activeStyle = "bg-primary-600 text-white shadow-lg shadow-primary-600/10";
  const inactiveStyle = "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white";

  const getLinkStyle = ({ isActive }: { isActive: boolean }) => 
    `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`;

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 min-h-[calc(100vh-64px)] hidden md:block py-6 px-4">
      <div className="space-y-6">
        <div>
          <h4 className="px-4 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Control Panel
          </h4>
          <nav className="mt-3 space-y-1">
            <NavLink to="/dashboard" end className={getLinkStyle}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard Home
            </NavLink>
          </nav>
        </div>

        {/* Farmer Dashboard Links */}
        {user.role === 'farmer' && (
          <div>
            <h4 className="px-4 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Farmer Hub
            </h4>
            <nav className="mt-3 space-y-1">
              <NavLink to="/dashboard/farm-profile" className={getLinkStyle}>
                <MapPin className="w-5 h-5" />
                Farm Profile
              </NavLink>
              <NavLink to="/dashboard/products" className={getLinkStyle}>
                <ShoppingBag className="w-5 h-5" />
                Products Inventory
              </NavLink>
              <NavLink to="/dashboard/bookings" className={getLinkStyle}>
                <CalendarRange className="w-5 h-5" />
                Visit Reservations
              </NavLink>
            </nav>
          </div>
        )}

        {/* Homestay Owner Dashboard Links */}
        {user.role === 'homestay_owner' && (
          <div>
            <h4 className="px-4 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Homestay Hub
            </h4>
            <nav className="mt-3 space-y-1">
              <NavLink to="/dashboard/homestay-profile" className={getLinkStyle}>
                <MapPin className="w-5 h-5" />
                Homestay Listing
              </NavLink>
              <NavLink to="/dashboard/rooms" className={getLinkStyle}>
                <ShoppingBag className="w-5 h-5" />
                Rooms Inventory
              </NavLink>
              <NavLink to="/dashboard/bookings" className={getLinkStyle}>
                <CalendarRange className="w-5 h-5" />
                Guest Reservations
              </NavLink>
            </nav>
          </div>
        )}

        {/* Admin Dashboard Links */}
        {user.role === 'admin' && (
          <div>
            <h4 className="px-4 text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Administration
            </h4>
            <nav className="mt-3 space-y-1">
              <NavLink to="/dashboard/users" className={getLinkStyle}>
                <Users className="w-5 h-5" />
                Users Suspension
              </NavLink>
              <NavLink to="/dashboard/moderation" className={getLinkStyle}>
                <CheckSquare className="w-5 h-5" />
                Listing Moderation
              </NavLink>
              <NavLink to="/dashboard/reviews" className={getLinkStyle}>
                <MessageSquare className="w-5 h-5" />
                Reviews Moderation
              </NavLink>
              <NavLink to="/dashboard/analytics" className={getLinkStyle}>
                <LineChart className="w-5 h-5" />
                Revenue Analytics
              </NavLink>
            </nav>
          </div>
        )}
      </div>
    </aside>
  );
};
export default Sidebar;
