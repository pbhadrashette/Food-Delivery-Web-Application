import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, CheckCircle, X } from 'lucide-react';
import { orderAPI } from '../services/api';
import { resolveRestaurantLogoUrl, getRestaurantLogoFallback } from '../utils/restaurantImage';

const STATUS_COLORS = {
  PLACED: 'badge-blue', CONFIRMED: 'badge-blue', PREPARING: 'badge-orange',
  READY_FOR_PICKUP: 'badge-orange', OUT_FOR_DELIVERY: 'badge-orange',
  DELIVERED: 'badge-green', CANCELLED: 'badge-red',
};

const FILTERS = ['All', 'Active', 'DELIVERED', 'CANCELLED'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const params = {};
        if (filter === 'DELIVERED') params.status = 'DELIVERED';
        else if (filter === 'CANCELLED') params.status = 'CANCELLED';
        const { data } = await orderAPI.getAll(params);
        let result = data.orders;
        if (filter === 'Active') result = result.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status));
        setOrders(result);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchOrders();
  }, [filter]);

  return (
    <div className="page-container py-6 pb-20 md:pb-6 animate-fade-in">
      <h1 className="section-title mb-6">My Orders</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${filter === f ? 'bg-primary-500 text-white shadow-glow' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-400'}`}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">Looks like you haven't ordered anything yet</p>
          <Link to="/" className="btn-primary">Browse Restaurants</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const restImgSrc = resolveRestaurantLogoUrl(order.restaurant);
            return (
              <Link key={order._id} to={`/orders/${order._id}`} className="card block p-5 hover:shadow-card-hover transition-all">
                <div className="flex items-start gap-4">
                  <img
                    src={restImgSrc}
                    alt={order.restaurant?.name || 'Restaurant'}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getRestaurantLogoFallback(order.restaurant, e.currentTarget.src);
                    }}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-orange-50 border border-gray-100"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900">{order.restaurant?.name}</h3>
                      <span className={`badge ${STATUS_COLORS[order.status]} flex-shrink-0 text-xs`}>{order.status.replace(/_/g, ' ')}</span>
                    </div>
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                      {order.items.map((i) => `${i.name}${i.quantity > 1 ? ` x${i.quantity}` : ''}`).join(', ')}
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">₹{order.totalAmount}</span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <span className="text-gray-400 text-xs">•</span>
                      <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                        {order.paymentMethod === 'COD' ? '💵 Cash on Delivery' : '💳 Online'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
