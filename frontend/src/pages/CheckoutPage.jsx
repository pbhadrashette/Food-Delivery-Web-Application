import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  MapPin, CheckCircle, CreditCard, Truck, Plus, Minus, Trash2,
  ShieldCheck, ArrowRight, Home, Clock, Sparkles, AlertCircle,
  Banknote, ShoppingBag, Check
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { resolveFoodImageUrl, getFoodImageFallback } from '../utils/foodImage';
import toast from 'react-hot-toast';

const PLATFORM_FEE = 5;
const TAX_RATE = 0.05;

/** Helper to format addresses cleanly whether legacy state/division exist or not */
function formatAddressLine(addr) {
  if (!addr) return '';
  const parts = [
    addr.houseFlat,
    addr.street,
    addr.area,
    addr.landmark ? `Near ${addr.landmark}` : null,
    addr.city,
    addr.division,
    addr.state,
  ].filter(Boolean);
  return `${parts.join(', ')} — ${addr.pincode || ''}`;
}

export default function CheckoutPage() {
  const { cart, subtotal, fetchCart, updateItem, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const appliedCoupon = location.state?.coupon;

  const [selectedAddress, setSelectedAddress] = useState(user?.addresses?.[0] || null);
  const [newAddress, setNewAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(!user?.addresses || user.addresses.length === 0);
  
  // COD is the primary, default payment method
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderPlacedData, setOrderPlacedData] = useState(null);

  // Simplified address form: State & Division removed
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    houseFlat: '',
    area: '',
    city: '',
    pincode: '',
    landmark: '',
    addressType: 'Home',
  });

  const deliveryFee = cart.restaurant?.deliveryFee || 30;
  const taxes = Math.round(subtotal * TAX_RATE);
  const discount = appliedCoupon?.discount || 0;
  const total = Math.max(0, subtotal + deliveryFee + taxes + PLATFORM_FEE - discount);

  const activeAddress = newAddress || selectedAddress;

  // Address validation: required fields + Indian phone & pincode formats
  const handleAddressFormSubmit = (e) => {
    e.preventDefault();
    if (!addressForm.fullName.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    const cleanPhone = addressForm.phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error('Please enter a valid 10-digit Indian phone number (starting with 6-9)');
      return;
    }
    if (!addressForm.houseFlat.trim()) {
      toast.error('Please enter house/flat/building details');
      return;
    }
    if (!addressForm.area.trim()) {
      toast.error('Please enter area/locality');
      return;
    }
    if (!addressForm.city.trim()) {
      toast.error('Please enter city');
      return;
    }
    const cleanPincode = addressForm.pincode.replace(/\D/g, '');
    if (!/^\d{6}$/.test(cleanPincode)) {
      toast.error('Please enter a valid 6-digit Indian PIN code');
      return;
    }

    const payload = {
      ...addressForm,
      phone: cleanPhone,
      pincode: cleanPincode,
    };

    setNewAddress(payload);
    setSelectedAddress(null);
    setShowNewAddressForm(false);
    toast.success('Address saved for this order!');
  };

  // Place order handler with validation and duplicate submission guard
  const handlePlaceOrder = async () => {
    // 1. Validate cart
    if (!cart?.items || cart.items.length === 0) {
      toast.error('Your cart is empty. Add food items to proceed.');
      navigate('/restaurants');
      return;
    }

    // 2. Validate delivery address
    const addressToUse = newAddress || selectedAddress;
    if (!addressToUse) {
      toast.error('Please select or add a delivery address below');
      setShowNewAddressForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate phone and pincode format
    const cleanPhone = String(addressToUse.phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      toast.error('Selected address has an invalid phone number. Please update it.');
      return;
    }

    // 3. Duplicate submission guard
    if (loading) return;
    setLoading(true);

    try {
      // 4. Submit order to backend API with COD or ONLINE payment method
      const { data } = await orderAPI.create({
        deliveryAddress: addressToUse,
        paymentMethod, // 'COD' or 'ONLINE'
        couponCode: appliedCoupon?.code,
        specialInstructions: specialInstructions.trim(),
      });

      // 5. Clear cart only after confirmed successful order creation
      await fetchCart();

      // 6. Display animated order-success screen with order details
      setOrderPlacedData(data.order);
      toast.success('🎉 Your order has been placed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const PriceRow = ({ label, value, isDiscount, isBold }) => (
    <div className={`flex justify-between text-sm ${isBold ? 'font-bold text-gray-900 text-base border-t border-dashed border-gray-200 pt-3 mt-3' : 'text-gray-600'} ${isDiscount ? 'text-green-600 font-semibold' : ''}`}>
      <span>{label}</span>
      <span>{isDiscount ? '-' : ''}₹{value}</span>
    </div>
  );

  if (!orderPlacedData && (!cart?.items || cart.items.length === 0)) {
    return (
      <div className="page-container py-16 text-center animate-fade-in">
        <div className="max-w-md mx-auto bg-white rounded-3xl p-8 border border-gray-100 shadow-card">
          <div className="w-16 h-16 mx-auto rounded-full bg-orange-50 text-[#ff5200] flex items-center justify-center text-3xl mb-4">
            🛒
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 text-sm mb-6">Add delicious food items from your favorite restaurants to proceed to checkout.</p>
          <Link to="/search" className="btn-primary inline-flex items-center gap-2 px-6 py-3 font-bold">
            <span>Explore Dishes &amp; Restaurants</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container py-6 pb-24 md:pb-12 animate-fade-in relative min-h-[75vh]">
      {/* ──────────────── SUCCESS MODAL / ANIMATION OVERLAY ──────────────── */}
      {orderPlacedData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-orange-100 text-center animate-slide-up relative overflow-hidden my-auto">
            {/* Top decorative ambient glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b from-orange-400/20 to-emerald-400/20 rounded-full blur-3xl pointer-events-none" />

            {/* Smooth animated checkmark with celebration rings */}
            <div className="relative mx-auto mb-5 w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-60" />
              <div className="absolute inset-1 rounded-full bg-emerald-100/70" />
              <div className="relative w-18 h-18 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transform transition-transform animate-[bounce_0.6s_ease-out]">
                <CheckCircle className="w-10 h-10 stroke-[2.4]" />
              </div>
            </div>

            {/* Celebration Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#ff5200] text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Order Confirmed
            </div>

            {/* Confirmation Message */}
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-gray-900 leading-tight">
              Your order has been placed successfully!
            </h2>
            <p className="text-gray-500 text-sm mt-1.5">
              Thank you for ordering with FoodieRush. Your food is being prepared and will arrive fresh &amp; hot.
            </p>

            {/* Order Summary Details Card */}
            <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-4 text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 text-xs sm:text-sm">
                <span className="text-gray-500 font-medium">Order ID</span>
                <span className="font-mono font-bold text-gray-900">
                  #{orderPlacedData.orderNumber || orderPlacedData._id?.slice(-8).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 text-xs sm:text-sm">
                <span className="text-gray-500 font-medium">Payment Method</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {orderPlacedData.paymentMethod === 'COD' ? (
                    <>
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span>Cash on Delivery (Pay after delivery)</span>
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 text-blue-600" />
                      <span>Online Payment</span>
                    </>
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-gray-200/60 text-xs sm:text-sm">
                <span className="text-gray-500 font-medium">Total Amount</span>
                <span className="text-lg font-extrabold text-[#ff5200]">
                  ₹{orderPlacedData.totalAmount}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-gray-500 font-medium">Estimated Delivery</span>
                <span className="inline-flex items-center gap-1 font-semibold text-gray-800 bg-white px-2.5 py-0.5 rounded-md border border-gray-200">
                  <Clock className="w-3.5 h-3.5 text-[#ff5200]" /> 30–45 mins
                </span>
              </div>

              {orderPlacedData.paymentMethod === 'COD' && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-2 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[12.5px] text-amber-900 leading-snug">
                    <strong>Cash on Delivery:</strong> Please keep <strong>₹{orderPlacedData.totalAmount} in cash</strong> ready for our delivery partner upon arrival.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate(`/orders/${orderPlacedData._id}`)}
                className="btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-glow cursor-pointer"
              >
                <span>Track Order</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary py-3 px-5 text-sm font-semibold flex items-center justify-center gap-2 border-gray-200 hover:border-gray-300 text-gray-700 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Continue Shopping</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────── PAGE HEADER ──────────────── */}
      <div className="mb-6">
        <h1 className="section-title text-2xl sm:text-3xl font-display font-extrabold text-gray-900">Checkout</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
          Select delivery address, choose your payment method, and confirm your order.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT TWO COLUMNS: CHECKOUT CONTENT */}
        <div className="lg:col-span-2 space-y-6">

          {/* ════════════════════ 1. DELIVERY ADDRESS ════════════════════ */}
          <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-gray-900 text-lg flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#ff5200] flex items-center justify-center text-xs font-bold">1</div>
                <MapPin className="w-5 h-5 text-primary-500" />
                Delivery Address
              </h2>
              {!showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-700 font-semibold text-xs sm:text-sm bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Address
                </button>
              )}
            </div>

            {/* Saved addresses */}
            {user?.addresses?.length > 0 && !showNewAddressForm && (
              <div className="space-y-3">
                {user.addresses.map((addr) => {
                  const isChecked = selectedAddress?._id === addr._id && !newAddress;
                  return (
                    <label
                      key={addr._id}
                      className={`flex gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isChecked
                          ? 'border-primary-500 bg-orange-50/50 shadow-sm ring-1 ring-primary-300'
                          : 'border-gray-200 hover:border-primary-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_address"
                        className="mt-1 accent-primary-500 cursor-pointer"
                        checked={isChecked}
                        onChange={() => {
                          setSelectedAddress(addr);
                          setNewAddress(null);
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-bold text-gray-900 text-sm">{addr.fullName}</span>
                          <span className="badge-blue text-[11px] py-0.5">{addr.addressType || 'Home'}</span>
                          {addr.isDefault && <span className="badge-green text-[11px] py-0.5">Default</span>}
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{formatAddressLine(addr)}</p>
                        <p className="text-gray-500 text-xs mt-1 font-medium">📞 +91 {addr.phone}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}

            {/* Custom address entered for this order */}
            {newAddress && !showNewAddressForm && (
              <div className="p-4 rounded-xl border-2 border-primary-500 bg-orange-50/50 flex items-start gap-3 mt-3">
                <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">{newAddress.fullName}</span>
                    <span className="badge-orange text-[10px] py-0.5">Custom Address</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-0.5">{formatAddressLine(newAddress)}</p>
                  <p className="text-gray-500 text-xs mt-0.5 font-medium">📞 +91 {newAddress.phone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="text-xs text-primary-600 hover:underline font-bold"
                >
                  Edit
                </button>
              </div>
            )}

            {/* Clean, Simplified Add Address Form (State & Division removed) */}
            {showNewAddressForm && (
              <form onSubmit={handleAddressFormSubmit} className="pt-2 animate-slide-up">
                <div className="flex items-center justify-between mb-3.5">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-primary-500" /> Enter Delivery Address
                  </h3>
                  {user?.addresses?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-xs text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Use Saved Address
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="label text-xs">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Recipient full name"
                      className="input-field text-sm py-2.5"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm((p) => ({ ...p, fullName: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Phone Number * (10 digits)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs font-semibold">+91</span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="9876543210"
                        className="input-field text-sm py-2.5 pl-11"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label text-xs">House / Flat / Building No. *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 302, Sunshine Heights, Wing B"
                      className="input-field text-sm py-2.5"
                      value={addressForm.houseFlat}
                      onChange={(e) => setAddressForm((p) => ({ ...p, houseFlat: e.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label text-xs">Area / Locality / Street *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Koramangala 5th Block, Near Sony Signal"
                      className="input-field text-sm py-2.5"
                      value={addressForm.area}
                      onChange={(e) => setAddressForm((p) => ({ ...p, area: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label text-xs">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bangalore"
                      className="input-field text-sm py-2.5"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="label text-xs">Pincode * (6 digits)</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="e.g. 560034"
                      className="input-field text-sm py-2.5"
                      value={addressForm.pincode}
                      onChange={(e) => setAddressForm((p) => ({ ...p, pincode: e.target.value.replace(/\D/g, '') }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label text-xs">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Opposite City Hospital"
                      className="input-field text-sm py-2.5"
                      value={addressForm.landmark}
                      onChange={(e) => setAddressForm((p) => ({ ...p, landmark: e.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="label text-xs">Address Type</label>
                    <div className="flex gap-2.5">
                      {['Home', 'Work', 'Other'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setAddressForm((p) => ({ ...p, addressType: type }))}
                          className={`px-4 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer ${
                            addressForm.addressType === type
                              ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-primary-400'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-4">
                  {user?.addresses?.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="btn-secondary py-2 text-sm"
                    >
                      Cancel
                    </button>
                  )}
                  <button type="submit" className="btn-primary py-2 text-sm flex-1 shadow-glow cursor-pointer">
                    Save and Use This Address
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ════════════════════ 2. PAYMENT METHODS (ALWAYS VISIBLE & CLEARLY SELECTABLE) ════════════════════ */}
          <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display font-bold text-gray-900 text-lg flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#ff5200] flex items-center justify-center text-xs font-bold">2</div>
                <CreditCard className="w-5 h-5 text-primary-500" />
                Payment Method
              </h2>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                100% Safe &amp; Secure
              </span>
            </div>
            <p className="text-gray-500 text-xs mb-4">
              Select your payment method. You can pay with Cash on Delivery or Online.
            </p>

            <div className="space-y-3.5">
              {/* ──────────────── CASH ON DELIVERY (PAY AFTER DELIVERY) ──────────────── */}
              <label
                className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-[#ff5200] bg-orange-50/60 shadow-md ring-1 ring-[#ff5200]/30'
                    : 'border-gray-200 hover:border-orange-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="COD"
                  id="payment-method-cod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 accent-[#ff5200] cursor-pointer w-4 h-4"
                />
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Truck className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-extrabold text-gray-900 text-base sm:text-lg">
                        Cash on Delivery (Pay after delivery)
                      </p>
                      <span className="badge-green text-[10px] py-0.5">Popular • Recommended</span>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed">
                      Pay with cash directly to the delivery partner when your order reaches your doorstep. No advance online payment needed.
                    </p>
                    {paymentMethod === 'COD' && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-200 rounded-lg px-3 py-1">
                        <Check className="w-3.5 h-3.5" />
                        Exact cash payable on delivery: ₹{total}
                      </div>
                    )}
                  </div>
                </div>
              </label>

              {/* ──────────────── ONLINE PAYMENT ──────────────── */}
              <label
                className={`flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-[#ff5200] bg-orange-50/60 shadow-md ring-1 ring-[#ff5200]/30'
                    : 'border-gray-200 hover:border-orange-300 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="ONLINE"
                  id="payment-method-online"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="mt-1 accent-[#ff5200] cursor-pointer w-4 h-4"
                />
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-sky-100 text-sky-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <CreditCard className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-display font-extrabold text-gray-900 text-base sm:text-lg">
                        Online Payment
                      </p>
                      <span className="badge-blue text-[10px] py-0.5">Cards • UPI • Net Banking</span>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm mt-1 leading-relaxed">
                      Pay securely with Google Pay, PhonePe, Paytm, UPI, Credit Card, Debit Card, or Net Banking.
                    </p>
                  </div>
                </div>
              </label>
            </div>

            <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center gap-2 text-gray-500 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Your payment and food order are backed by the FoodieRush On-Time Guarantee.</span>
            </div>
          </div>

          {/* ════════════════════ 3. REVIEW CART ITEMS ════════════════════ */}
          <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold text-gray-900 text-lg flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#ff5200] flex items-center justify-center text-xs font-bold">3</div>
                <ShoppingBag className="w-5 h-5 text-primary-500" />
                Review Your Items
              </h2>
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                {cart.restaurant?.name || 'Restaurant'}
              </span>
            </div>

            <div className="space-y-3 divide-y divide-gray-100">
              {cart.items?.map((item) => {
                const foodImg = resolveFoodImageUrl(item.food || item);
                return (
                  <div
                    key={item._id}
                    className="flex items-center justify-between pt-3 first:pt-0 gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-orange-50 border border-gray-100 flex-shrink-0 relative">
                        <img
                          src={foodImg}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getFoodImageFallback(item.food || item, e.currentTarget.src);
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-gray-800 text-sm font-semibold truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">₹{item.price} each</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity > 1) {
                              updateItem(item._id, item.quantity - 1);
                            } else {
                              removeItem(item._id);
                            }
                          }}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-orange-100 hover:text-[#ff5200] transition-colors"
                          title={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'}
                        >
                          {item.quantity === 1 ? <Trash2 className="w-3.5 h-3.5 text-red-500" /> : <Minus className="w-3.5 h-3.5" />}
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateItem(item._id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-600 hover:bg-orange-100 hover:text-[#ff5200] transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-bold text-gray-900 text-sm w-16 text-right">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Special Instructions */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="label text-xs">Special Instructions (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Ring the bell, avoid plastic cutlery, extra spicy..."
                className="input-field text-sm py-2"
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
              />
            </div>
          </div>

        </div>

        {/* ════════════════════ RIGHT COLUMN: STICKY ORDER SUMMARY ════════════════════ */}
        <div>
          <div className="bg-white rounded-2xl shadow-card p-5 sm:p-6 sticky top-24 border border-gray-100 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900 text-base">Order Summary</h3>
              <span className="text-xs font-semibold text-gray-400">{cart.items?.length || 0} items</span>
            </div>

            <div className="space-y-2.5">
              <PriceRow label="Items Total" value={subtotal} />
              <PriceRow label="Delivery Charges" value={deliveryFee} />
              <PriceRow label="Taxes &amp; GST (5%)" value={taxes} />
              <PriceRow label="Platform Fee" value={PLATFORM_FEE} />
              {discount > 0 && (
                <PriceRow label={`Coupon Discount (${appliedCoupon?.code})`} value={discount} isDiscount />
              )}
              <PriceRow label="Total Payable" value={total} isBold />
            </div>

            {discount > 0 && (
              <div className="text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-2">
                <span>🎉</span>
                <span>Saving ₹{discount} with coupon {appliedCoupon?.code}!</span>
              </div>
            )}

            {/* Selected payment indicator */}
            <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-gray-700">
              <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wider">Payment Selected</p>
              <p className="font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
                {paymentMethod === 'COD' ? (
                  <>
                    <Truck className="w-4 h-4 text-emerald-600" />
                    <span>Cash on Delivery (Pay after delivery)</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Online Payment</span>
                  </>
                )}
              </p>
            </div>

            {/* Place Order CTA Button */}
            <button
              type="button"
              id="checkout-place-order-btn"
              onClick={handlePlaceOrder}
              disabled={loading || orderPlacedData !== null}
              className="btn-primary w-full py-4 text-base font-extrabold flex items-center justify-center gap-2 shadow-glow cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Placing Your Order...</span>
                </div>
              ) : (
                <span>
                  {paymentMethod === 'COD'
                    ? `Place Order (Cash on Delivery) · ₹${total}`
                    : `Proceed to Pay · ₹${total}`}
                </span>
              )}
            </button>

            <div className="space-y-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-primary-500" />
                <span>Contactless delivery available</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-primary-500" />
                <span>Verified hygienic kitchens</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
