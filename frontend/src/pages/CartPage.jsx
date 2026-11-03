import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Trash2, Plus, Minus, Tag, X, ArrowRight, Store } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { couponAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { resolveFoodImageUrl, getFoodImageFallback } from '../utils/foodImage';

const PLATFORM_FEE = 5;
const TAX_RATE = 0.05;

export default function CartPage() {
  const { cart, loading, updateItem, removeItem, clearCart, itemCount, subtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const deliveryFee = cart.restaurant?.deliveryFee || 30;
  const taxes = Math.round(subtotal * TAX_RATE);
  const discount = appliedCoupon?.discount || 0;
  const total = subtotal + deliveryFee + taxes + PLATFORM_FEE - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponAPI.validate({ code: couponCode.trim(), orderTotal: subtotal });
      setAppliedCoupon({ code: couponCode.trim(), discount: data.discount, description: data.coupon.description });
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container py-20 text-center animate-fade-in">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Please login to view cart</h2>
        <p className="text-gray-500 mb-6">Sign in to access your cart</p>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
          <div className="skeleton h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="page-container py-20 text-center animate-fade-in">
        <ShoppingCart className="w-20 h-20 text-gray-200 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet</p>
        <Link to="/" className="btn-primary">Browse Restaurants</Link>
      </div>
    );
  }

  return (
    <div className="page-container py-6 pb-28 md:pb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Your Cart</h1>
        <button onClick={clearCart} className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all">
          <Trash2 className="w-4 h-4" />Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {/* Restaurant Info */}
          {cart.restaurant && (
            <div className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-card">
              <Store className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-xs text-gray-500">Ordering from</p>
                <p className="font-semibold text-gray-900">{cart.restaurant.name || 'Restaurant'}</p>
              </div>
              <Link to={`/restaurant/${cart.restaurant._id}`} className="ml-auto text-primary-500 text-sm font-medium hover:text-primary-600">View Menu</Link>
            </div>
          )}

          {/* Cart Items */}
          <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-50">
            {cart.items.map((item) => {
              const imgSrc = resolveFoodImageUrl(item.food || item);

              return (
                <div key={item._id} className="flex items-center gap-4 p-4">
                  <img
                    src={imgSrc}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFoodImageFallback(item.food || item, e.currentTarget.src);
                    }}
                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0 bg-orange-50 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                    <p className="text-primary-600 font-bold text-sm mt-0.5">₹{item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-xl overflow-hidden">
                      <button onClick={() => updateItem(item._id, item.quantity - 1)} className="p-2 hover:bg-primary-100 text-primary-600 transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-primary-700 font-bold text-sm w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateItem(item._id, item.quantity + 1)} className="p-2 hover:bg-primary-100 text-primary-600 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-gray-900 text-sm w-16 text-right">₹{item.price * item.quantity}</span>
                    <button onClick={() => removeItem(item._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Coupon */}
          <div className="bg-white rounded-2xl shadow-card p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Tag className="w-4 h-4 text-primary-500" />Apply Coupon</h3>
            {appliedCoupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                <div>
                  <p className="font-bold text-green-700 text-sm">{appliedCoupon.code}</p>
                  <p className="text-green-600 text-xs">You save ₹{appliedCoupon.discount}!</p>
                </div>
                <button onClick={removeCoupon} className="text-red-500 hover:text-red-600"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code (e.g. WELCOME50)"
                  className="input-field flex-1 text-sm py-2.5 uppercase"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                />
                <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode} className="btn-primary py-2.5 px-4 text-sm disabled:opacity-50">
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">Try: WELCOME50, SAVE20, BIRYANI30</p>
          </div>
        </div>

        {/* Price Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-card p-6 sticky top-20">
            <h3 className="font-display font-bold text-gray-900 text-lg mb-4">Bill Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Item Total ({itemCount} items)</span>
                <span className="font-medium">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes & GST (5%)</span>
                <span className="font-medium">₹{taxes}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee</span>
                <span className="font-medium">₹{PLATFORM_FEE}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Coupon Discount</span>
                  <span className="font-medium">-₹{discount}</span>
                </div>
              )}
              <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Grand Total</span>
                <span className="font-bold text-primary-600 text-lg">₹{total}</span>
              </div>
            </div>
            {discount > 0 && (
              <div className="mt-3 bg-green-50 text-green-700 rounded-xl px-3 py-2 text-xs font-medium flex items-center gap-2">
                🎉 You're saving ₹{discount} on this order!
              </div>
            )}
            <button
              onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon } })}
              className="btn-primary w-full mt-5 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>
            <Link to="/" className="block text-center text-primary-500 hover:text-primary-600 font-medium text-sm mt-3">
              + Add More Items
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
