import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, Package, Bike, Home, Star, X } from 'lucide-react';
import { orderAPI, reviewAPI } from '../services/api';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: Package, desc: 'Your order has been received' },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle, desc: 'Restaurant confirmed your order' },
  { key: 'PREPARING', label: 'Preparing', icon: Clock, desc: 'Chef is preparing your food' },
  { key: 'READY_FOR_PICKUP', label: 'Ready', icon: Package, desc: 'Food is ready for pickup' },
  { key: 'OUT_FOR_DELIVERY', label: 'On the Way', icon: Bike, desc: 'Delivery partner is on their way' },
  { key: 'DELIVERED', label: 'Delivered', icon: Home, desc: 'Enjoy your meal!' },
];

const STATUS_COLORS = {
  PLACED: 'text-blue-600 bg-blue-50',
  CONFIRMED: 'text-indigo-600 bg-indigo-50',
  PREPARING: 'text-orange-600 bg-orange-50',
  READY_FOR_PICKUP: 'text-purple-600 bg-purple-50',
  OUT_FOR_DELIVERY: 'text-orange-600 bg-orange-50',
  DELIVERED: 'text-green-600 bg-green-50',
  CANCELLED: 'text-red-600 bg-red-50',
};

function ReviewModal({ orderId, restaurantId, onClose, onSuccess }) {
  const [ratings, setRatings] = useState({ foodRating: 5, deliveryRating: 5, restaurantRating: 5 });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const StarRating = ({ field, label }) => (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((val) => (
          <button key={val} type="button" onClick={() => setRatings((p) => ({ ...p, [field]: val }))}
            className={`text-2xl transition-transform hover:scale-110 ${val <= ratings[field] ? 'text-orange-400' : 'text-gray-300'}`}>★</button>
        ))}
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reviewAPI.create({ orderId, restaurantId, ...ratings, comment });
      toast.success('Review submitted! Thank you.');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-gray-900 text-lg">Rate your order</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <StarRating field="restaurantRating" label="Restaurant" />
          <StarRating field="foodRating" label="Food Quality" />
          <StarRating field="deliveryRating" label="Delivery" />
          <div>
            <label className="label">Comments (Optional)</label>
            <textarea className="input-field resize-none h-20 text-sm" placeholder="Share your experience..." value={comment} onChange={(e) => setComment(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const justPlaced = location.state?.justPlaced;

  const fetchOrder = async () => {
    try {
      const { data } = await orderAPI.getOne(id);
      setOrder(data.order);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrder();
    // Poll for status updates
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setCancelLoading(true);
    try {
      await orderAPI.cancel(id, { reason: 'Cancelled by customer' });
      toast.success('Order cancelled successfully');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel order');
    } finally { setCancelLoading(false); }
  };

  if (loading) return (
    <div className="page-container py-10 space-y-4">
      <div className="skeleton h-10 w-48 rounded-xl" />
      <div className="skeleton h-48 rounded-2xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  if (!order) return (
    <div className="page-container py-20 text-center">
      <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
      <h2 className="text-xl font-bold text-gray-900">Order not found</h2>
      <Link to="/orders" className="btn-primary mt-4 inline-block">My Orders</Link>
    </div>
  );

  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';
  const isDelivered = order.status === 'DELIVERED';
  const canCancel = ['PLACED', 'CONFIRMED'].includes(order.status);

  return (
    <div className="page-container py-6 pb-20 md:pb-6 animate-fade-in">
      {showReview && (
        <ReviewModal
          orderId={order._id}
          restaurantId={order.restaurant?._id}
          onClose={() => setShowReview(false)}
          onSuccess={fetchOrder}
        />
      )}

      {justPlaced && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3 animate-slide-up">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-bold text-green-800">Order placed successfully!</p>
            <p className="text-green-700 text-sm">Estimated delivery in ~45 minutes</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Order #{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm mt-1">{new Date(order.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${STATUS_COLORS[order.status] || 'text-gray-600 bg-gray-50'}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tracking Timeline */}
          {!isCancelled && (
            <div className="bg-white rounded-2xl shadow-card p-6">
              <h2 className="font-bold text-gray-900 mb-6">Order Tracking</h2>
              <div className="relative">
                {STATUS_STEPS.map((step, i) => {
                  const isCompleted = i <= currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex gap-4 relative">
                      {/* Line */}
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`absolute left-4 top-8 w-0.5 h-12 ${isCompleted && i < currentStepIndex ? 'bg-primary-500' : 'bg-gray-200'}`} />
                      )}
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all ${isCompleted ? 'bg-primary-500 text-white shadow-glow' : 'bg-gray-100 text-gray-400'} ${isCurrent ? 'ring-4 ring-primary-200 scale-110' : ''}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className={`pb-8 ${i === STATUS_STEPS.length - 1 ? 'pb-0' : ''}`}>
                        <p className={`font-semibold text-sm ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                        <p className={`text-xs ${isCompleted ? 'text-gray-500' : 'text-gray-300'}`}>{step.desc}</p>
                        {isCurrent && <p className="text-primary-500 text-xs font-medium mt-0.5 animate-pulse-slow">Current status</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancelled Status */}
          {isCancelled && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <X className="w-6 h-6 text-red-500" />
                <h3 className="font-bold text-red-800">Order Cancelled</h3>
              </div>
              <p className="text-red-700 text-sm">{order.cancelReason || 'This order was cancelled'}</p>
            </div>
          )}

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-gray-900 mb-4">Order Items from {order.restaurant?.name}</h2>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                    <span className="text-gray-800 text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-gray-900 font-semibold text-sm">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h2 className="font-bold text-gray-900 mb-3">Delivery Address</h2>
            <p className="font-semibold text-gray-900 text-sm">{order.deliveryAddress?.fullName}</p>
            <p className="text-gray-600 text-sm mt-1">
              {[
                order.deliveryAddress?.houseFlat,
                order.deliveryAddress?.street,
                order.deliveryAddress?.area,
                order.deliveryAddress?.landmark ? `Near ${order.deliveryAddress.landmark}` : null,
                order.deliveryAddress?.city,
                order.deliveryAddress?.division,
                order.deliveryAddress?.state,
              ].filter(Boolean).join(', ')} — {order.deliveryAddress?.pincode}
            </p>
            <p className="text-gray-500 text-sm mt-0.5">📞 {order.deliveryAddress?.phone}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Price */}
          <div className="bg-white rounded-2xl shadow-card p-5">
            <h3 className="font-bold text-gray-900 mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Items</span><span>₹{order.subtotal}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span>₹{order.deliveryFee}</span></div>
              <div className="flex justify-between text-gray-600"><span>Taxes</span><span>₹{order.taxes}</span></div>
              <div className="flex justify-between text-gray-600"><span>Platform Fee</span><span>₹{order.platformFee}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{order.discount}</span></div>}
              <div className="flex justify-between font-bold text-gray-900 border-t pt-2 mt-2">
                <span>Total</span><span>₹{order.totalAmount}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-600 font-semibold">
                {order.paymentMethod === 'COD' ? '💵 Cash on Delivery (COD)' : '💳 Online Payment'}
              </span>
              <span className={`font-bold px-2 py-0.5 rounded-md text-[11px] ${order.paymentStatus === 'PAID' ? 'text-green-700 bg-green-50' : 'text-amber-700 bg-amber-50'}`}>
                {order.paymentStatus}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {isDelivered && !order.isReviewed && (
              <button onClick={() => setShowReview(true)} className="btn-primary w-full flex items-center justify-center gap-2">
                <Star className="w-4 h-4" /> Rate This Order
              </button>
            )}
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelLoading} className="btn-danger w-full text-sm py-2.5">
                {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <Link to="/orders" className="btn-secondary w-full text-center block text-sm">View All Orders</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
