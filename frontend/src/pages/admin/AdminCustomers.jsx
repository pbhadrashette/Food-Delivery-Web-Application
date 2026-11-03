import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ToggleLeft, ToggleRight, Eye, ShoppingBag } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    setStatus(searchParams.get('status') || '');
  }, [searchParams]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = { search, page, limit: 20 };
      if (status) params.status = status;
      const { data } = await adminAPI.getCustomers(params);
      setCustomers(data.customers);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [search, page, status]);

  const toggleStatus = async (id) => {
    try {
      await adminAPI.toggleCustomerStatus(id);
      toast.success('Status updated');
      fetchCustomers();
    } catch (e) { toast.error('Failed'); }
  };

  const viewCustomer = async (customer) => {
    setSelected(customer);
    setCustomerOrders([]);
    setOrdersLoading(true);
    try {
      const { data } = await adminAPI.getCustomerOrders(customer._id);
      setCustomerOrders(data.orders || []);
    } catch (e) { setCustomerOrders([]); }
    finally { setOrdersLoading(false); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-gray-900">Customers ({total})</h1>
          <p className="text-gray-400 text-xs mt-0.5">Manage your registered customer accounts</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: total, color: 'text-gray-900' },
          { label: 'Active', value: customers.filter(c => c.isActive).length, color: 'text-green-600' },
          { label: 'Inactive', value: customers.filter(c => !c.isActive).length, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-display font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input className="input-field pl-10 text-sm py-2.5" placeholder="Search by name or email..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>{['Customer', 'Email', 'Phone', 'Joined', 'Addresses', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>) :
                customers.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No customers found</td></tr>
                ) : customers.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-brand rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {c.name?.[0]?.toUpperCase()}
                        </div>
                        <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{c.phone || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 text-center">{c.addresses?.length || 0}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(c._id)} className="flex items-center gap-1">
                        {c.isActive ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                        <span className={`text-xs font-medium ${c.isActive ? 'text-green-600' : 'text-gray-400'}`}>{c.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => viewCustomer(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>

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

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-gradient-brand rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                {selected.name?.[0]?.toUpperCase()}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{selected.name}</h3>
              <p className="text-gray-500 text-sm">{selected.email}</p>
              {selected.phone && <p className="text-gray-400 text-xs mt-0.5">{selected.phone}</p>}
              <span className={`text-xs font-semibold px-3 py-1 rounded-full mt-2 inline-block ${selected.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {selected.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm mb-5">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs">Joined</p>
                <p className="font-semibold text-xs mt-0.5">{new Date(selected.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs">Addresses</p>
                <p className="font-bold text-base">{selected.addresses?.length || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-xs">Favorites</p>
                <p className="font-bold text-base">{(selected.favoriteRestaurants?.length || 0) + (selected.favoriteFoods?.length || 0)}</p>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="mb-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-primary-500" /> Recent Orders
              </h4>
              {ordersLoading ? (
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
                </div>
              ) : customerOrders.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No orders placed yet</p>
              ) : (
                <div className="space-y-2">
                  {customerOrders.map(o => (
                    <div key={o._id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 text-sm">
                      <div>
                        <p className="font-mono text-xs text-gray-600">{o.orderNumber?.slice(-8)}</p>
                        <p className="font-medium text-gray-900">{o.restaurant?.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{o.totalAmount}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${{
                          DELIVERED: 'bg-green-100 text-green-700',
                          CANCELLED: 'bg-red-100 text-red-700',
                          PLACED: 'bg-blue-100 text-blue-700',
                        }[o.status] || 'bg-gray-100 text-gray-500'}`}>{o.status?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button onClick={() => setSelected(null)} className="btn-secondary w-full text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
