import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, ShoppingCart, User as UserIcon, LogOut, Menu, X, Sprout } from 'lucide-react';
import Button from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const getNavLinkClass = (path: string) =>
    `text-sm transition-colors ${
      isActive(path)
        ? 'font-extrabold text-primary-600 dark:text-primary-400'
        : 'font-bold text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400'
    }`;

  const getMobileNavLinkClass = (path: string) =>
    `block px-3 py-2 rounded-xl text-base transition-colors hover:bg-slate-50 dark:hover:bg-slate-900 ${
      isActive(path)
        ? 'font-extrabold text-primary-600 dark:text-primary-400'
        : 'font-bold text-slate-700 dark:text-slate-300'
    }`;

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 glass transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-primary-600 dark:text-primary-400">
              <Sprout className="w-6 h-6 animate-pulse" />
              <span>RuralConnect <span className="text-slate-700 dark:text-slate-300">AI</span></span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={getNavLinkClass('/')}>
              Home
            </Link>
            <Link to="/farms" className={getNavLinkClass('/farms')}>
              Farms
            </Link>
            <Link to="/homestays" className={getNavLinkClass('/homestays')}>
              Homestays
            </Link>
            <Link to="/marketplace" className={getNavLinkClass('/marketplace')}>
              Marketplace
            </Link>
            {isAuthenticated && (
              <Link to="/ai-assistant" className={getNavLinkClass('/ai-assistant')}>
                <span>AI Assistant</span>
              </Link>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 hover:text-primary-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Shopping Cart Link */}
            {isAuthenticated && (
              <Link
                to="/cart"
                className="relative p-2 text-slate-500 hover:text-primary-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                    {totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Auth Dropdown / Buttons */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm">
                    {user.full_name[0].toUpperCase()}
                  </div>
                  <span className="text-sm font-bold max-w-[120px] truncate">{user.full_name}</span>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 animate-in fade-in duration-100 z-50">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 capitalize">{user.role}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <UserIcon className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Icon */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavLinkClass('/')}
          >
            Home
          </Link>
          <Link
            to="/farms"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavLinkClass('/farms')}
          >
            Farms
          </Link>
          <Link
            to="/homestays"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavLinkClass('/homestays')}
          >
            Homestays
          </Link>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className={getMobileNavLinkClass('/marketplace')}
          >
            Marketplace
          </Link>
          {isAuthenticated && (
            <Link
              to="/ai-assistant"
              onClick={() => setMobileMenuOpen(false)}
              className={getMobileNavLinkClass('/ai-assistant')}
            >
              AI Assistant
            </Link>
          )}
          {isAuthenticated && (
            <Link
              to="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-base font-bold hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <span>Cart</span>
              {totalItems > 0 && (
                <span className="bg-primary-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-bold hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-base font-bold hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-base font-bold text-red-600 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 px-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full">Log In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full">Register</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
export default Navbar;
