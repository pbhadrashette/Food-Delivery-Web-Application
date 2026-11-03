import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Search, Users, Phone, Mail, Briefcase } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ROLES = ['Kitchen Manager', 'Area Manager', 'Operations Manager', 'City Manager'];
const STATUSES = ['active', 'inactive', 'on_leave'];

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
  on_leave: 'bg-orange-100 text-orange-700',
};

const ROLE_COLORS = {
  'Kitchen Manager': 'bg-blue-100 text-blue-700',
  'Area Manager': 'bg-purple-100 text-purple-700',
  'Operations Manager': 'bg-indigo-100 text-indigo-700',
  'City Manager': 'bg-orange-100 text-orange-700',
};

const EMPTY = {
  name: '', email: '', phone: '', role: 'Kitchen Manager',
  assignedCity: '', status: 'active', salary: '', address: '', notes: '',
};

export default function AdminManagers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [managers, setManagers] = useState([]);
  const [kitchens, setKitchens] = useState([]);
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

  const fetchManagers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (filterStatus) params.status = filterStatus;
      const { data } = await adminAPI.getManagers(params);
      setManagers(data.managers);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, filterStatus]);

  const fetchKitchens = useCallback(async () => {
    try {
      const { data } = await adminAPI.getKitchens({ limit: 100 });
      setKitchens(data.kitchens || []);
    } catch (e) { setKitchens([]); }
  }, []);

  useEffect(() => { fetchManagers(); }, [fetchManagers]);
  useEffect(() => { fetchKitchens(); }, [fetchKitchens]);

  const openEdit = (m) => {
    setForm({ ...m, assignedKitchen: m.assignedKitchen?._id || '', salary: m.salary || '' });
    setEditId(m._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...form };
      if (!payload.assignedKitchen) delete payload.assignedKitchen;
      if (!payload.salary) delete payload.salary;
      if (editId) {
        await adminAPI.updateManager(editId, payload);
        toast.success('Manager updated!');
      } else {
        await adminAPI.createManager(payload);
        toast.success('Manager added!');
      }
      setShowForm(false);
      setEditId(null);
      fetchManagers();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving manager'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this manager?')) return;
    try {
      await adminAPI.deleteManager(id);
      toast.success('Manager deleted');
      fetchManagers();
    } catch (e) { toast.error('Failed to delete'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary-500" /> Managers
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">{total} total managers across all regions</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Manager
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: total, color: 'text-gray-900' },
          { label: 'Active', value: managers.filter(m => m.status === 'active').length, color: 'text-green-600' },
          { label: 'On Leave', value: managers.filter(m => m.status === 'on_leave').length, color: 'text-orange-600' },
          { label: 'Inactive', value: managers.filter(m => m.status === 'inactive').length, color: 'text-gray-500' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl shadow-card p-4 text-center">
            <p className="text-gray-400 text-xs mb-1">{s.label}</p>
            <p className={`text-2xl font-display font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input className="input-field pl-10 text-sm py-2" placeholder="Search managers..." value={search}
            onChange={(e) => setSearch(e.target.value)} />
        </div>
        {['', ...STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${filterStatus === s ? 'bg-primary-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-primary-400'}`}>
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
                {['Manager', 'Contact', 'Role', 'City', 'Kitchen', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>)
              ) : managers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400 text-sm">No managers found. Add your first manager!</td></tr>
              ) : managers.map(m => (
                <tr key={m._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(m)}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {m.name?.[0]?.toUpperCase()}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{m.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600">{m.email}</p>
                    <p className="text-xs text-gray-400">{m.phone}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${ROLE_COLORS[m.role] || 'bg-gray-100 text-gray-600'}`}>{m.role}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{m.assignedCity || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{m.assignedKitchen?.kitchenId || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize ${STATUS_COLORS[m.status]}`}>{m.status?.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(m._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
              <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                {selected.name?.[0]?.toUpperCase()}
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{selected.name}</h3>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ROLE_COLORS[selected.role]}`}>{selected.role}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm mb-4">
              {[
                { label: 'Email', value: selected.email },
                { label: 'Phone', value: selected.phone },
                { label: 'City', value: selected.assignedCity || '—' },
                { label: 'Kitchen', value: selected.assignedKitchen?.kitchenId || '—' },
                { label: 'Status', value: selected.status?.replace('_', ' ') },
                { label: 'Salary', value: selected.salary ? `₹${Number(selected.salary).toLocaleString()}` : '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-gray-400 text-xs mb-0.5">{label}</p>
                  <p className="font-semibold capitalize text-gray-900">{value}</p>
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
              <h3 className="font-display font-bold text-gray-900 text-lg">{editId ? 'Edit Manager' : 'Add Manager'}</h3>
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
                <label className="label text-xs">Role</label>
                <select className="input-field text-sm py-2.5" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs">Status</label>
                <select className="input-field text-sm py-2.5" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs">Assigned City</label>
                <input className="input-field text-sm py-2.5" placeholder="e.g., Pune" value={form.assignedCity} onChange={e => setForm(p => ({ ...p, assignedCity: e.target.value }))} />
              </div>
              <div>
                <label className="label text-xs">Salary (₹/month)</label>
                <input type="number" className="input-field text-sm py-2.5" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="label text-xs">Assign Kitchen</label>
                <select className="input-field text-sm py-2.5" value={form.assignedKitchen || ''} onChange={e => setForm(p => ({ ...p, assignedKitchen: e.target.value }))}>
                  <option value="">No Kitchen Assigned</option>
                  {kitchens.map(k => <option key={k._id} value={k._id}>{k.kitchenId} — {k.city}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label text-xs">Address</label>
                <textarea className="input-field text-sm h-14 resize-none" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="col-span-2">
                <label className="label text-xs">Notes</label>
                <textarea className="input-field text-sm h-14 resize-none" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div className="col-span-2 flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1 text-sm">{formLoading ? 'Saving...' : editId ? 'Update' : 'Add Manager'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
