import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, User, Heart, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: ShoppingBag, label: 'Browse' },
  { to: '/orders', icon: Package, label: 'Orders' },
  { to: '/favorites', icon: Heart, label: 'Saved' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  const location = useLocation();
  const { itemCount } = useCart();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <Link key={to} to={to} className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 ${isActive ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'}`}>
              <div className={`relative ${isActive ? 'scale-110' : ''} transition-transform`}>
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                {label === 'Browse' && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px]">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-primary-500' : 'text-gray-400'}`}>{label}</span>
              {isActive && <div className="w-1 h-1 bg-primary-500 rounded-full mt-0.5" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
