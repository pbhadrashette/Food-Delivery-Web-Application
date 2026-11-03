import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Search, Bike, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const VEHICLE_TYPES = ['Bike', 'Bicycle', 'Scooter', 'Car'];
const STATUSES = ['active', 'inactive', 'on_delivery', 'on_leave'];

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  on_delivery: 'bg-blue-100 text-blue-700',
  on_leave: 'bg-orange-100 text-orange-700',
};

const VEHICLE_ICONS = { Bike: '🏍️', Bicycle: '🚲', Scooter: '🛵', Car: '🚗' };

const EMPTY = {
  name: '', email: '', phone: '', vehicleType: 'Bike', vehicleNumber: '',
  licenseNumber: '', city: '', status: 'active', notes: '',
};

export default function AdminDeliveryPartners() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setForm(EMPTY);
      setEditId(null);
      setShowForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchPartners = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const { data } = await adminAPI.getDeliveryPartners(params);
      setPartners(data.partners);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, filterStatus]);

  useEffect(() => { fetchPartners(); }, [fetchPartners]);

  const openEdit = (p) => { setForm({ ...p }); setEditId(p._id); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editId) {
        await adminAPI.updateDeliveryPartner(editId, form);
        toast.success('Partner updated!');
      } else {
        await adminAPI.createDeliveryPartner(form);
        toast.success('Partner added!');
      }
      setShowForm(false);
      setEditId(null);
      fetchPartners();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving partner'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this delivery partner?')) return;
    try {
      await adminAPI.deleteDeliveryPartner(id);
      toast.success('Partner removed');
      fetchPartners();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const toggleVerify = async (id) => {
    try {
      await adminAPI.togglePartnerVerification(id);
      toast.success('Verification status updated');
      fetchPartners();
    } catch (e) { toast.error('Failed'); }
  };

  const statCounts = {
    total,
    active: partners.filter(p => p.status === 'active').length,
    on_delivery: partners.filter(p => p.status === 'on_delivery').length,
    verified: partners.filter(p => p.isVerified).length,
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
            <Bike className="w-5 h-5 text-primary-500" /> Delivery Partners
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">{total} registered delivery partners</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Partner
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Partners', value: statCounts.total, color: 'text-gray-900', bg: 'bg-gray-50' },
          { label: 'Active', value: statCounts.active, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'On Delivery', value: statCounts.on_delivery, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Verified', value: statCounts.verified, color: 'text-primary-600', bg: 'bg-orange-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center border border-white shadow-sm`}>
            <p className="text-gray-500 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-display font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="input-field pl-10 text-sm py-2" placeholder="Search partners..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${filterStatus === s ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'}`}>
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Partner', 'Contact', 'Vehicle', 'City', 'Deliveries', 'Rating', 'Status', 'Verified', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>)
              ) : partners.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400 text-sm">No delivery partners found. Add your first partner!</td></tr>
              ) : partners.map(p => (
                <tr key={p._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(p)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {p.name?.[0]?.toUpperCase()}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{p.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">{p.phone}</p>
                    <p className="text-xs text-gray-400">{p.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <span>{VEHICLE_ICONS[p.vehicleType]} {p.vehicleType}</span>
                    {p.vehicleNumber && <p className="text-xs text-gray-400">{p.vehicleNumber}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{p.city}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{p.totalDeliveries}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-sm font-bold text-orange-600">
                      <Star className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />{p.rating?.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize ${STATUS_COLORS[p.status]}`}>{p.status?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <button onClick={() => toggleVerify(p._id)} title={p.isVerified ? 'Verified — click to unverify' : 'Unverified — click to verify'}>
                      {p.isVerified
                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                        : <AlertCircle className="w-5 h-5 text-gray-300 hover:text-orange-400 transition-colors" />}
                    </button>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && !showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-5">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                {selected.name?.[0]?.toUpperCase()}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{selected.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${STATUS_COLORS[selected.status]}`}>{selected.status?.replace('_', ' ')}</span>
                {selected.isVerified && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-lg flex items-center gap-1"><CheckCircle className="w-3 h-3" />Verified</span>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              {[
                { label: 'Phone', value: selected.phone },
                { label: 'City', value: selected.city },
                { label: 'Vehicle', value: `${VEHICLE_ICONS[selected.vehicleType]} ${selected.vehicleType}` },
                { label: 'Vehicle No.', value: selected.vehicleNumber || '—' },
                { label: 'Deliveries', value: selected.totalDeliveries },
                { label: 'Rating', value: `⭐ ${selected.rating?.toFixed(1)}` },
                { label: 'Earnings', value: `₹${Number(selected.totalEarnings || 0).toLocaleString()}` },
                { label: 'Joined', value: new Date(selected.joiningDate || selected.createdAt).toLocaleDateString('en-IN') },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                  <p className="font-semibold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1 text-sm">Close</button>
              <button onClick={() => { openEdit(selected); setSelected(null); }} className="btn-primary flex-1 text-sm">Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl my-4 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-display font-bold text-gray-900 text-lg">{editId ? 'Edit Partner' : 'Add Delivery Partner'}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label text-xs">Full Name *</label>
                <input className="input-field text-sm" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div>
                <label className="label text-xs">Email *</label>
                <input type="email" className="input-field text-sm py-2.5" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
              </div>
              <div>
                <label className="label text-xs">Phone *</label>
                <input className="input-field text-sm py-2.5" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required />
              </div>
              <div>
                <label className="label text-xs">Vehicle Type</label>
                <select className="input-field text-sm py-2.5" value={form.vehicleType} onChange={e => setForm(p => ({ ...p, vehicleType: e.target.value }))}>
                  {VEHICLE_TYPES.map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs">Vehicle Number</label>
                <input className="input-field text-sm py-2.5" placeholder="MH12AB1234" value={form.vehicleNumber}
                  onChange={e => setForm(p => ({ ...p, vehicleNumber: e.target.value.toUpperCase() }))} />
              </div>
              <div>
                <label className="label text-xs">License Number</label>
                <input className="input-field text-sm py-2.5" value={form.licenseNumber} onChange={e => setForm(p => ({ ...p, licenseNumber: e.target.value }))} />
              </div>
              <div>
                <label className="label text-xs">City *</label>
                <input className="input-field text-sm py-2.5" placeholder="e.g., Pune" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} required />
              </div>
              <div>
                <label className="label text-xs">Status</label>
                <select className="input-field text-sm py-2.5" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label text-xs">Notes</label>
                <textarea className="input-field text-sm h-14 resize-none" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1 text-sm">{formLoading ? 'Saving...' : editId ? 'Update' : 'Add Partner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
