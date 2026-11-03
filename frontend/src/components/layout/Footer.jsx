import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

// Simple inline SVG social icons
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);
const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="site-footer bg-gray-900 text-gray-300 pt-16 pb-8 mt-20">
      <div className="site-footer__inner page-container">
        <div className="site-footer__grid gap-10 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <img
                src="/project-logo.png"
                alt="FoodieRush Logo"
                className="w-10 h-10 object-contain transition-transform group-hover:scale-105"
              />
              <img
                src="/project-name.png"
                alt="FoodieRush"
                className="h-8 w-auto brightness-0 invert object-contain opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Delivering happiness, one meal at a time. Order from your favorite restaurants and get fresh food at your doorstep.
            </p>
            <div className="flex items-center gap-3 mt-5">
              {[
                { Icon: FacebookIcon, label: 'Facebook', href: 'https://facebook.com' },
                { Icon: InstagramIcon, label: 'Instagram', href: 'https://instagram.com' },
                { Icon: TwitterIcon, label: 'Twitter / X', href: 'https://twitter.com' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 bg-gray-800 hover:bg-[#ff5200] rounded-lg flex items-center justify-center text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', to: '/' },
                { label: 'Restaurants', to: '/restaurants' },
                { label: 'Search', to: '/search' },
                { label: 'My Orders', to: '/orders' },
                { label: 'My Profile', to: '/profile' },
              ].map(({ label, to }) => (
                <li key={label}><Link to={to} className="text-sm text-gray-400 hover:text-primary-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Top Categories</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
              {[
                'Pizza', 'Burger', 'Biryani', 'Chinese',
                'South Indian', 'North Indian', 'Desserts',
                'Beverages', 'Fast Food'
              ].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/search?category=${encodeURIComponent(cat)}`}
                    className="text-xs text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-bold text-white text-lg tracking-tight mb-4">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3.5 text-[15px] text-[#94a3b8] hover:text-white transition-colors">
                <MapPin className="w-5 h-5 text-[#ff6b4a] flex-shrink-0 stroke-[1.8]" />
                <span>123, MG Road, Bangalore, India</span>
              </li>
              <li className="flex items-center gap-3.5 text-[15px] text-[#94a3b8] hover:text-white transition-colors">
                <Phone className="w-5 h-5 text-[#ff6b4a] flex-shrink-0 stroke-[1.8]" />
                <a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-3.5 text-[15px] text-[#94a3b8] hover:text-white transition-colors">
                <Mail className="w-5 h-5 text-[#ff6b4a] flex-shrink-0 stroke-[1.8]" />
                <a href="mailto:support@foodierush.com" className="hover:text-white transition-colors">support@foodierush.com</a>
              </li>
              <li>
                <Link to="/admin/login" className="text-[15px] text-[#ff6b4a] hover:underline font-semibold transition-colors">
                  FoodieRush Admin Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="site-footer__bottom border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2025 FoodieRush Delivery Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-400">
            <button
              type="button"
              className="hover:text-white cursor-pointer transition-colors"
              onClick={() => toast('🔒 Privacy Policy: We value your privacy and safeguard all customer information with encryption.', { icon: '🛡️' })}
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              type="button"
              className="hover:text-white cursor-pointer transition-colors"
              onClick={() => toast('📜 Terms of Service: Guaranteed delivery times, verified hygienic restaurants, and genuine Cash on Delivery support.', { icon: '🤝' })}
            >
              Terms of Service
            </button>
            <span>•</span>
            <button
              type="button"
              className="hover:text-white cursor-pointer transition-colors"
              onClick={() => toast('💸 Refund Policy: 100% refund guarantee for damaged or missing food items.', { icon: '✨' })}
            >
              Refund Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
