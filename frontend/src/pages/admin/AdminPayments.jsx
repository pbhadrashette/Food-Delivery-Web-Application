import { useState, useEffect, useCallback } from 'react';
import { Eye, CreditCard, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';

const PAYMENT_STATUS_COLORS = {
  PAID: 'bg-green-100 text-green-700',
  PENDING: 'bg-orange-100 text-orange-700',
  FAILED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-blue-100 text-blue-700',
};

const METHOD_COLORS = {
  COD: 'bg-gray-100 text-gray-700',
  ONLINE: 'bg-indigo-100 text-indigo-700',
};

export default function AdminPayments() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (filterStatus) params.paymentStatus = filterStatus;
      if (filterMethod) params.paymentMethod = filterMethod;
      const { data } = await adminAPI.getPayments(params);
      setOrders(data.orders);
      setTotal(data.total);
      setStats(data.stats || {});
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, filterStatus, filterMethod]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const totalRevenue = stats.totalRevenue || 0;
  const totalPaid = stats.totalPaid || 0;
  const totalPending = stats.totalPending || 0;
  const totalFailed = stats.totalFailed || 0;

  const statCards = [
    { label: 'Total Revenue', value: `₹${Number(totalRevenue).toLocaleString()}`, icon: TrendingUp, color: 'from-orange-500 to-orange-500', glow: 'rgba(249,115,22,0.15)', textColor: 'text-primary-600' },
    { label: 'Paid Orders', value: totalPaid, icon: CheckCircle, color: 'from-green-500 to-emerald-500', glow: 'rgba(16,185,129,0.15)', textColor: 'text-green-600' },
    { label: 'Pending', value: totalPending, icon: Clock, color: 'from-orange-500 to-orange-500', glow: 'rgba(249,115,22,0.15)', textColor: 'text-orange-600' },
    { label: 'Failed / Refunded', value: totalFailed, icon: XCircle, color: 'from-red-500 to-rose-500', glow: 'rgba(239,68,68,0.15)', textColor: 'text-red-600' },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary-500" /> Payments
        </h1>
        <p className="text-gray-400 text-xs mt-0.5">Monitor all payment transactions across the platform</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, glow, textColor }) => (
          <div key={label} className="bg-white rounded-2xl shadow-card p-5 relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200">
            <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-40" style={{ background: glow }} />
            <div className={`w-9 h-9 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-gray-400 text-xs font-medium mb-1">{label}</p>
            <p className={`text-xl font-display font-black ${textColor}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: filterStatus, setter: setFilterStatus, options: ['', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'], all: 'All Status' },
          { key: filterMethod, setter: setFilterMethod, options: ['', 'COD', 'ONLINE'], all: 'All Methods' },
        ].map(({ key, setter, options, all }, fi) => (
          <div key={fi} className="flex gap-1 flex-wrap">
            {options.map(opt => (
              <button key={opt || 'all'} onClick={() => { setter(opt); setPage(1); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${key === opt ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'}`}>
                {opt || all}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order #', 'Customer', 'Restaurant', 'Amount', 'Method', 'Payment Status', 'Order Status', 'Date', 'Details'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(8).fill(0).map((_, i) => <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="skeleton h-5 rounded" /></td></tr>)
              ) : orders.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No payment records found.</td></tr>
              ) : orders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-gray-600">{order.orderNumber?.slice(-8)}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{order.user?.name}</p>
                    <p className="text-xs text-gray-400">{order.user?.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{order.restaurant?.name}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">₹{order.totalAmount}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${METHOD_COLORS[order.paymentMethod]}`}>{order.paymentMethod}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>{order.paymentStatus}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-500 capitalize">{order.status?.toLowerCase().replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelected(order)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}</p>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50">Prev</button>
              <button disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)} className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Payment Details</h3>
              <div className="flex gap-2">
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${PAYMENT_STATUS_COLORS[selected.paymentStatus]}`}>{selected.paymentStatus}</span>
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${METHOD_COLORS[selected.paymentMethod]}`}>{selected.paymentMethod}</span>
              </div>
            </div>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Order #</p><p className="font-mono font-bold">{selected.orderNumber}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Total Amount</p><p className="font-bold text-primary-600 text-base">₹{selected.totalAmount}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Customer</p><p className="font-semibold">{selected.user?.name}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Restaurant</p><p className="font-semibold">{selected.restaurant?.name}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Subtotal</p><p className="font-semibold">₹{selected.subtotal}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Delivery Fee</p><p className="font-semibold">₹{selected.deliveryFee}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Taxes</p><p className="font-semibold">₹{selected.taxes}</p></div>
                <div className="bg-gray-50 rounded-xl p-3"><p className="text-gray-400 text-xs">Discount</p><p className="font-semibold text-green-600">-₹{selected.discount || 0}</p></div>
              </div>
              {selected.paymentId && (
                <div className="bg-indigo-50 rounded-xl p-3">
                  <p className="text-xs text-indigo-400 mb-0.5">Payment ID</p>
                  <p className="font-mono text-xs text-indigo-700">{selected.paymentId}</p>
                </div>
              )}
              <div className="border-t pt-3">
                <p className="font-semibold mb-2">Order Items</p>
                {selected.items?.map((item, i) => (
                  <div key={i} className="flex justify-between py-1 text-xs">
                    <span>{item.name} ×{item.quantity}</span>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={() => setSelected(null)} className="btn-secondary w-full mt-4 text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
