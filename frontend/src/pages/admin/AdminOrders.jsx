import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Eye, Search } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const STATUSES = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
const STATUS_COLORS = {
  PLACED: 'bg-blue-100 text-blue-700', CONFIRMED: 'bg-indigo-100 text-indigo-700',
  PREPARING: 'bg-orange-100 text-orange-700', READY_FOR_PICKUP: 'bg-purple-100 text-purple-700',
  OUT_FOR_DELIVERY: 'bg-orange-100 text-orange-700', DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(searchParams.get('status') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (searchParams.get('status')) setFilter(searchParams.get('status'));
    if (searchParams.get('search')) setSearch(searchParams.get('search'));
  }, [searchParams]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filter) params.status = filter;
      if (search) params.search = search;
      const { data } = await adminAPI.getOrders(params);
      setOrders(data.orders);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [filter, page]);

  const updateStatus = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, { status });
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
      if (selected?._id === orderId) setSelected((s) => ({ ...s, status }));
    } catch (e) { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-500 text-sm">{total} total orders</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="input-field pl-10 text-sm py-2"
            placeholder="Search by order number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchOrders(); } }}
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['', ...STATUSES].map((s) => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${filter === s ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'}`}>
              {s ? s.replace(/_/g, ' ') : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order #', 'Customer', 'Restaurant', 'Items', 'Amount', 'Payment', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="skeleton h-5 rounded" /></td></tr>
                ))
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No orders found.</td></tr>
              ) : orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">{order.orderNumber?.slice(-8)}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{order.restaurant?.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{order.items?.length} items</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{order.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {order.paymentMethod} · {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_COLORS[order.status]}`}>{order.status.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelected(order)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Eye className="w-4 h-4" /></button>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-400"
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 15 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing {(page - 1) * 15 + 1}–{Math.min(page * 15, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50">Prev</button>
              <button disabled={page * 15 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Order #{selected.orderNumber?.slice(-8)}</h3>
              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${STATUS_COLORS[selected.status]}`}>{selected.status.replace(/_/g, ' ')}</span>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Customer</p><p className="font-semibold">{selected.user?.name}</p><p className="text-xs text-gray-400">{selected.user?.phone}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Restaurant</p><p className="font-semibold">{selected.restaurant?.name}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Payment</p><p className="font-semibold">{selected.paymentMethod}</p><p className="text-xs text-gray-400">{selected.paymentStatus}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Total</p><p className="font-bold text-primary-600 text-base">₹{selected.totalAmount}</p></div>
              </div>
              <div className="border-t pt-3">
                <p className="font-semibold mb-2">Items:</p>
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-xs py-1.5 border-b border-gray-50">
                    <span>{item.isVeg ? '🌱' : '🍗'} {item.name} ×{item.quantity}</span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3">
                <p className="font-semibold mb-1">Delivery Address:</p>
                <p className="text-gray-600 text-xs bg-gray-50 rounded-xl p-3">
                  {selected.deliveryAddress?.fullName}, {selected.deliveryAddress?.houseFlat}, {selected.deliveryAddress?.street}, {selected.deliveryAddress?.area}, {selected.deliveryAddress?.city} - {selected.deliveryAddress?.pincode}
                </p>
              </div>
              {selected.specialInstructions && (
                <div className="bg-orange-50 rounded-xl p-3 text-xs">
                  <p className="font-semibold text-orange-800 mb-1">Special Instructions:</p>
                  <p className="text-orange-700">{selected.specialInstructions}</p>
                </div>
              )}
              <div>
                <label className="text-gray-500 text-xs font-medium">Update Status:</label>
                <select
                  value={selected.status}
                  onChange={(e) => updateStatus(selected._id, e.target.value)}
                  className="w-full mt-1 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-400 text-sm"
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="btn-secondary w-full mt-4 text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
