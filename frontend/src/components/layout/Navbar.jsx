import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Heart, LogOut, Package, ChevronDown, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const resolveUserAvatar = (img) => {
  if (!img) return null;
  if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) return img;
  const path = img.startsWith('/') ? img : `/${img}`;
  return `${API_ORIGIN}${path}`;
};

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
    setUserMenuOpen(false);
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`site-navbar sticky top-0 z-50 transition-all duration-500 ${
      scrolled
        ? 'bg-white/95 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.08)] border-b border-gray-100/80'
        : isHome
        ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100/50'
        : 'bg-white shadow-sm border-b border-gray-100'
    }`}>
      <div className="site-navbar__inner w-full page-container px-4 sm:px-6 lg:px-8">
        <div className="grid h-16 grid-cols-[auto_minmax(0,1fr)_auto] items-center">
          {/* Logo */}
          <Link to="/" aria-label="FoodieRush home" className="brand group">
            <img
              src="/project-logo.png"
              alt="FoodieRush Logo"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/favicon.svg';
              }}
              className="h-9 w-9 shrink-0 object-contain transition-transform duration-300 group-hover:scale-105 sm:h-11 sm:w-11"
            />
            <img
              src="/project-name.png"
              alt="FoodieRush"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
              className="h-8 w-auto max-w-[120px] shrink-0 object-contain transition-opacity duration-300 group-hover:opacity-80 sm:h-10 sm:max-w-[180px]"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="site-navbar__search hidden md:flex w-full max-w-md items-center justify-self-center gap-2">
            <div className={`relative flex-1 transition-all duration-300 ${searchFocused ? 'scale-[1.02]' : ''}`}>
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${searchFocused ? 'text-primary-500' : 'text-gray-400'}`} />
              <input
                id="navbar-search-input"
                type="text"
                placeholder="Search restaurants, dishes or cuisines..."
                className="w-full pl-10 pr-8 py-2 rounded-xl border border-gray-200 bg-gray-50/80 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 focus:bg-white placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </form>

          {/* Right Side */}
          <div className="site-navbar__actions flex flex-shrink-0 items-center justify-self-end gap-2">
            {/* Cart */}
            {isAuthenticated && (
              <Link
                to="/cart"
                id="navbar-cart-btn"
                className="btn-touch relative p-2.5 text-gray-700 hover:text-primary-600 hover:bg-orange-50 rounded-xl transition-all duration-200 group"
                aria-label="View shopping cart"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-br from-primary-500 to-orange-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-glow animate-bounce-subtle border-2 border-white">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="navbar-mobile-menu-btn"
              className="btn-touch md:hidden p-2 text-gray-700 hover:text-primary-600 rounded-xl hover:bg-orange-50 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  id="navbar-user-menu-btn"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-orange-200/60 flex-shrink-0 overflow-hidden">
                    {user?.profileImage ? (
                      <img
                        src={resolveUserAvatar(user.profileImage)}
                        alt={user.name || 'User'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      user?.name?.[0]?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-semibold text-gray-900 leading-none">{user?.name?.split(' ')[0]}</p>
                    {isAdmin && <p className="text-[9px] text-primary-500 font-bold uppercase tracking-wide mt-0.5">Admin</p>}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-card-hover border border-gray-100 py-1 animate-fade-in z-50 overflow-hidden">
                    {/* User Header */}
                    <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-orange-50 border-b border-gray-100">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm ring-2 ring-orange-200/60 overflow-hidden flex-shrink-0">
                          {user?.profileImage ? (
                            <img
                              src={resolveUserAvatar(user.profileImage)}
                              alt={user.name || 'User'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            user?.name?.[0]?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm leading-tight truncate">{user?.name}</p>
                          <p className="text-gray-500 text-xs truncate max-w-[140px]">{user?.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          id="navbar-admin-link"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 text-sm font-semibold text-primary-600 transition-colors"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <div className="w-7 h-7 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-primary-600" />
                          </div>
                          Admin Dashboard
                          <span className="ml-auto text-[9px] bg-primary-100 text-primary-600 font-bold px-1.5 py-0.5 rounded-full">ADMIN</span>
                        </Link>
                      )}
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                          <User className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        My Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        My Orders
                      </Link>
                      <Link to="/favorites" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 transition-colors" onClick={() => setUserMenuOpen(false)}>
                        <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Heart className="w-3.5 h-3.5 text-gray-600" />
                        </div>
                        Favorites
                      </Link>
                    </div>

                    <div className="border-t border-gray-100 pt-1 pb-1">
                      <button
                        onClick={handleLogout}
                        id="navbar-logout-btn"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-600 w-full transition-colors"
                      >
                        <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center">
                          <LogOut className="w-3.5 h-3.5 text-red-500" />
                        </div>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  id="navbar-login-btn"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF5200] hover:from-[#f45b3f] hover:to-[#e04800] text-white font-bold px-5 py-2 text-xs sm:text-sm shadow-sm hover:shadow-md hover:shadow-orange-500/25 focus:outline-none focus:ring-2 focus:ring-[#FF6B35] focus:ring-offset-2 active:scale-95 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  id="navbar-register-btn"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 hover:text-gray-900 font-bold px-4 py-2 text-xs sm:text-sm shadow-2xs hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 active:scale-95 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 pt-2 animate-slide-up border-t border-gray-100 mt-2 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search restaurants or dishes..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:bg-white text-sm transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <div className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-primary-600 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/search"
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-primary-600 transition-colors"
              >
                Explore Restaurants &amp; Dishes
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    to="/orders"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-primary-600 transition-colors"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/favorites"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-primary-600 transition-colors"
                  >
                    Favorites
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2 rounded-lg hover:bg-orange-50 hover:text-primary-600 transition-colors"
                  >
                    My Profile
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 rounded-lg bg-orange-50 text-primary-600 font-bold transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      handleLogout();
                    }}
                    className="text-left px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex gap-2.5 pt-2 border-t border-gray-100">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#FF5200] hover:from-[#f45b3f] hover:to-[#e04800] text-white font-bold text-sm shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#FF6B35] active:scale-95 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 text-center py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm shadow-2xs active:scale-95 transition-all duration-200"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
