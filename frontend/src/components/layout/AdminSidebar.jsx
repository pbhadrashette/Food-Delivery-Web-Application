import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Store,
  Building2,
  UserCog,
  UtensilsCrossed,
  Utensils,
  BookOpen,
  ShoppingBag,
  Users,
  Bike,
  CreditCard,
  Ticket,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  ExternalLink,
  Zap,
  Search,
  CheckCircle2,
  Clock,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// All 14 Core Admin Dashboard Sections in requested order
const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    to: '/admin/dashboard',
    icon: LayoutDashboard,
    expandable: false,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    to: '/admin/analytics',
    icon: BarChart3,
    expandable: false,
  },
  {
    id: 'restaurants',
    label: 'Restaurants',
    to: '/admin/restaurants',
    icon: Store,
    expandable: true,
    submenus: [
      { to: '/admin/restaurants', label: 'All Restaurants' },
      { to: '/admin/restaurants?action=add', label: 'Add Restaurant' },
    ],
  },
  {
    id: 'kitchens',
    label: 'Cloud Kitchens',
    to: '/admin/kitchens',
    icon: Building2,
    expandable: false,
    aliases: ['/admin/cloud-kitchens'],
  },
  {
    id: 'managers',
    label: 'Managers',
    to: '/admin/managers',
    icon: UserCog,
    expandable: true,
    submenus: [
      { to: '/admin/managers', label: 'All Managers' },
      { to: '/admin/managers?action=add', label: 'Add Manager' },
    ],
  },
  {
    id: 'cuisines',
    label: 'Cuisines',
    to: '/admin/cuisines',
    icon: UtensilsCrossed,
    expandable: true,
    aliases: ['/admin/categories'],
    submenus: [
      { to: '/admin/cuisines', label: 'All Cuisines' },
      { to: '/admin/cuisines?action=add', label: 'Add Cuisine' },
    ],
  },
  {
    id: 'meals',
    label: 'Meals',
    to: '/admin/meals',
    icon: Utensils,
    expandable: true,
    submenus: [
      { to: '/admin/meals', label: 'All Meals' },
      { to: '/admin/meals?action=add', label: 'Add Meal' },
    ],
  },
  {
    id: 'foods',
    label: 'Food Items',
    to: '/admin/foods',
    icon: BookOpen,
    expandable: false,
  },
  {
    id: 'orders',
    label: 'Orders',
    to: '/admin/orders',
    icon: ShoppingBag,
    expandable: false,
  },
  {
    id: 'customers',
    label: 'Customers',
    to: '/admin/customers',
    icon: Users,
    expandable: true,
    submenus: [
      { to: '/admin/customers', label: 'All Customers' },
      { to: '/admin/customers?status=active', label: 'Active Customers' },
    ],
  },
  {
    id: 'delivery-partners',
    label: 'Delivery Partners',
    to: '/admin/delivery-partners',
    icon: Bike,
    expandable: false,
  },
  {
    id: 'payments',
    label: 'Payments',
    to: '/admin/payments',
    icon: CreditCard,
    expandable: false,
  },
  {
    id: 'coupons',
    label: 'Coupons',
    to: '/admin/coupons',
    icon: Ticket,
    expandable: true,
    submenus: [
      { to: '/admin/coupons', label: 'All Coupons' },
      { to: '/admin/coupons?action=add', label: 'Add Coupon' },
    ],
  },
  {
    id: 'reviews',
    label: 'Reviews',
    to: '/admin/reviews',
    icon: MessageSquare,
    expandable: true,
    submenus: [
      { to: '/admin/reviews', label: 'All Reviews' },
      { to: '/admin/reviews?rating=5', label: '5-Star Reviews' },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    to: '/admin/settings',
    icon: Settings,
    expandable: false,
  },
];

export default function AdminSidebar({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [headerSearch, setHeaderSearch] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeFlyout, setActiveFlyout] = useState(null);
  const [flyoutTop, setFlyoutTop] = useState(0);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close header dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ensure active section is automatically expanded on page load, browser refresh, back & forward
  useEffect(() => {
    const currentPath = location.pathname;
    NAV_ITEMS.forEach((item) => {
      if (item.expandable) {
        const isMatch =
          currentPath === item.to ||
          item.aliases?.includes(currentPath) ||
          item.submenus?.some((s) => s.to.split('?')[0] === currentPath) ||
          (item.to !== '/admin/dashboard' && currentPath.startsWith(item.to));
        if (isMatch) {
          setExpandedSections((prev) => ({ ...prev, [item.id]: true }));
        }
      }
    });
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/admin/login';
  };

  const isSubmenuActive = (subTo) => {
    const [subPath, subQuery] = subTo.split('?');
    if (subQuery) {
      return location.pathname === subPath && location.search === `?${subQuery}`;
    }
    return location.pathname === subPath && (!location.search || location.search === '');
  };

  const isItemActive = (item) => {
    if (item.to === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin';
    }
    if (location.pathname === item.to) {
      return true;
    }
    if (item.aliases?.includes(location.pathname)) {
      return true;
    }
    if (item.submenus?.some((s) => s.to.split('?')[0] === location.pathname)) {
      return true;
    }
    return false;
  };

  const toggleExpand = (id, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setExpandedSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleParentNavigation = (item) => {
    if (item.expandable) {
      setExpandedSections((prev) => ({ ...prev, [item.id]: true }));
    }
    navigate(item.to);
    setMobileOpen(false);
  };

  const handleHeaderSearchSubmit = (e) => {
    e.preventDefault();
    if (!headerSearch.trim()) return;
    navigate(`/admin/restaurants?search=${encodeURIComponent(headerSearch.trim())}`);
  };

  // Derive current breadcrumb label
  const getCurrentLabel = () => {
    for (const item of NAV_ITEMS) {
      if (item.submenus) {
        for (const sub of item.submenus) {
          if (isSubmenuActive(sub.to)) return `${item.label} / ${sub.label}`;
        }
      }
      if (isItemActive(item)) return item.label;
    }
    return 'Admin Panel';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-sm overflow-hidden select-none">
      {/* Brand Header */}
      <div
        className={`flex items-center gap-3 px-4 py-4 border-b border-gray-100 flex-shrink-0 bg-white ${
          collapsed ? 'justify-center px-2' : ''
        }`}
      >
        <Link to="/admin/dashboard" className="flex items-center gap-3 group">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-orange-600 rounded-xl flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,0.3)] group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          {!collapsed && (
            <div>
              <p className="font-display font-black text-slate-900 text-base leading-none tracking-tight">
                FoodieRush
              </p>
              <p className="text-[9px] font-bold text-primary-600 tracking-[0.2em] uppercase mt-1">
                Admin Portal
              </p>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
            title="Collapse sidebar"
            id="admin-sidebar-collapse-btn"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center justify-center py-2.5 border-b border-gray-100 text-slate-400 hover:text-primary-600 hover:bg-orange-50 transition-all flex-shrink-0"
          title="Expand sidebar"
          id="admin-sidebar-expand-btn"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {/* Navigation section - Independently Scrollable */}
      <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 px-2.5 space-y-1 admin-sidebar-scroll">
        {!collapsed && (
          <p className="text-[10px] font-bold text-slate-400 tracking-[0.16em] uppercase px-3 mb-2 mt-1">
            Navigation
          </p>
        )}

        {NAV_ITEMS.map((item) => {
          const active = isItemActive(item);
          const isExpanded = expandedSections[item.id];
          const Icon = item.icon;

          return (
            <div
              key={item.id}
              className="relative group"
              onMouseEnter={(event) => {
                if (collapsed && item.expandable) {
                  setActiveFlyout(item.id);
                  setFlyoutTop(Math.max(8, Math.min(
                    event.currentTarget.getBoundingClientRect().top,
                    window.innerHeight - 100
                  )));
                }
              }}
              onMouseLeave={() => collapsed && setActiveFlyout(null)}
            >
              {/* Parent Navigation Item */}
              <div
                className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-gradient-to-r from-orange-50 to-orange-100/40 text-primary-700 font-semibold shadow-sm border border-orange-200/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${collapsed ? 'justify-center p-2.5' : 'px-3 py-2.5'}`}
              >
                {/* Active Indicator Strip */}
                {active && !collapsed && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary-500 rounded-r-full" />
                )}

                {/* Main Link/Clickable Area */}
                <button
                  type="button"
                  onClick={() => handleParentNavigation(item)}
                  className={`flex items-center gap-3 flex-1 text-left min-w-0 ${
                    collapsed ? 'justify-center' : ''
                  }`}
                  title={collapsed ? item.label : ''}
                >
                  <Icon
                    className={`flex-shrink-0 transition-colors ${
                      active
                        ? 'text-primary-500'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                    style={{ width: '18px', height: '18px' }}
                  />
                  {!collapsed && (
                    <span className="truncate leading-tight">{item.label}</span>
                  )}
                </button>

                {/* Chevron Toggle Button for Expandable Items */}
                {!collapsed && item.expandable && (
                  <button
                    type="button"
                    onClick={(e) => toggleExpand(item.id, e)}
                    className="p-1 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-white/80 transition-all flex-shrink-0 ml-1"
                    title={isExpanded ? 'Collapse submenus' : 'Expand submenus'}
                    aria-label={`Toggle ${item.label} submenu`}
                  >
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90 text-primary-500 font-bold' : ''
                      }`}
                    />
                  </button>
                )}

                {/* Active Pulse Dot for non-expandable active items */}
                {!collapsed && !item.expandable && active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse ml-auto flex-shrink-0" />
                )}
              </div>

              {/* Flyout Popover for Collapsed Sidebar */}
              {collapsed && activeFlyout === item.id && item.expandable && (
                <div
                  className="fixed z-50 w-48 bg-white rounded-xl shadow-xl border border-gray-200 p-2 animate-fade-in"
                  style={{ top: flyoutTop, left: mobileOpen ? 240 : 70 }}
                  onMouseEnter={() => setActiveFlyout(item.id)}
                  onMouseLeave={() => setActiveFlyout(null)}
                >
                  <p className="text-xs font-bold text-slate-800 px-2 py-1 border-b border-gray-100 mb-1">
                    {item.label}
                  </p>
                  <div className="space-y-0.5">
                    {item.submenus.map((sub) => {
                      const subActive = isSubmenuActive(sub.to);
                      return (
                        <Link
                          key={sub.to}
                          to={sub.to}
                          onClick={() => {
                            setActiveFlyout(null);
                            setMobileOpen(false);
                          }}
                          className={`block px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                            subActive
                              ? 'bg-orange-50 text-primary-600 font-bold'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Expandable Submenu Items */}
              {!collapsed && item.expandable && isExpanded && (
                <div className="mt-1 ml-5 pl-3 border-l-2 border-orange-100 space-y-1 py-0.5 animate-fadeIn">
                  {item.submenus.map((sub) => {
                    const subActive = isSubmenuActive(sub.to);
                    return (
                      <Link
                        key={sub.to}
                        to={sub.to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                          subActive
                            ? 'text-primary-700 bg-orange-100/70 font-semibold shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                        }`}
                      >
                        <span className="truncate">{sub.label}</span>
                        {subActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Footer with Quick Actions */}
      <div className="flex-shrink-0 border-t border-gray-100 p-3 bg-white">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 mb-2 bg-slate-50 hover:bg-orange-50/50 rounded-xl border border-gray-100 transition-colors">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-[0_2px_8px_rgba(249,115,22,0.25)]">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-900 text-xs font-semibold truncate leading-tight">
                {user?.name || 'Administrator'}
              </p>
              <p className="text-slate-400 text-[10px] truncate mt-0.5">
                {user?.email || 'admin@foodierush.com'}
              </p>
            </div>
            <div className="text-[8px] font-bold bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded-full border border-primary-200 flex-shrink-0">
              SUPER
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : ''}
          id="admin-logout-sidebar-btn"
          className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50/80 transition-all text-xs font-semibold group ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0 group-hover:scale-110 transition-transform" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100">
      {/* Desktop Sidebar */}
      <div
        className={`hidden lg:flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 ${
          collapsed ? 'w-[70px]' : 'w-[235px]'
        }`}
      >
        <SidebarContent />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative z-10 w-[240px] flex flex-col h-full animate-slide-in-left shadow-2xl">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f7fb]">
        {/* Top Header */}
        <header className="flex-shrink-0 h-14 flex items-center justify-between px-4 sm:px-6 border-b border-gray-200 bg-white/95 backdrop-blur-md shadow-xs z-20">
          {/* Left: Mobile Toggle + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              id="admin-sidebar-mobile-toggle"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <Link
                to="/admin/dashboard"
                className="text-slate-400 hover:text-slate-700 font-medium transition-colors"
              >
                Admin
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
              <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-none">
                {getCurrentLabel()}
              </span>
            </div>
          </div>

          {/* Center: Global Search Bar */}
          <form
            onSubmit={handleHeaderSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-md mx-6"
          >
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders, restaurants, users..."
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-xl border border-gray-200 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
              />
            </div>
          </form>

          {/* Right: Actions, Notifications & Avatar Dropdown */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-orange-200 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Site</span>
            </Link>

            {/* Notification Bell with Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                title="Notifications"
                id="admin-notifications-btn"
                aria-label="Toggle notifications"
              >
                <Bell className="w-4.5 h-4.5" style={{ width: '18px', height: '18px' }} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-white animate-pulse" />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 z-50 animate-slide-up">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                    <p className="font-bold text-xs text-slate-800">Recent Alerts</p>
                    <span className="text-[10px] font-semibold text-primary-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 bg-orange-50/60 rounded-xl flex items-start gap-2.5">
                      <Zap className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">Admin Session Active</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Logged in with Super Administrator privileges.
                        </p>
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">REST APIs Connected</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Catalog, kitchen, and analytics endpoints ready.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Avatar Profile with Dropdown */}
            <div className="relative pl-2 border-l border-gray-200" ref={userMenuRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 hover:opacity-85 transition-opacity"
                id="admin-profile-menu-btn"
                aria-label="Toggle admin profile menu"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-primary-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-[0_2px_8px_rgba(249,115,22,0.3)]">
                  {user?.name?.[0]?.toUpperCase() || 'F'}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-slate-800 text-xs font-semibold leading-none">
                    {user?.name || 'FoodieRush'}
                  </p>
                  <p className="text-[9px] text-primary-600 font-bold uppercase tracking-wide mt-0.5">
                    Master Admin
                  </p>
                </div>
              </button>

              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50 animate-slide-up">
                  <div className="px-3 py-2 border-b border-gray-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">{user?.name || 'Admin User'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.email || 'admin@foodierush.com'}</p>
                  </div>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-primary-600 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-slate-400" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/admin/settings"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-primary-600 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>System Settings</span>
                  </Link>
                  <Link
                    to="/"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setShowUserDropdown(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-primary-600 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-slate-400" />
                    <span>View Customer Store</span>
                  </Link>
                  <div className="border-t border-gray-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4 sm:p-6 bg-[#f5f7fb]">
          {children}
        </main>
      </div>
    </div>
  );
}
