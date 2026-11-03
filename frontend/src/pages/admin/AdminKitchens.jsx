import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, Search, RefreshCw, Building2, MapPin, Phone, Mail } from 'lucide-react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

const CITIES_BY_STATE = {
  'Assam': ['Guwahati', 'Jorhat', 'Dibrugarh', 'Silchar', 'Tezpur'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Thane', 'Kalyan-Dombivli'],
  'Delhi': ['New Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  'Telangana': ['Hyderabad', 'Warangal', 'Khammam', 'Nizamabad', 'Karimnagar'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Kota'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Prayagraj'],
};

const DIVISIONS_BY_CITY = {
  'Jorhat': ['Jorhat', 'Safo', 'Titabor', 'Mariani', 'Majuli'],
  'Mumbai': ['Andheri', 'Bandra', 'Dadar', 'Kurla', 'Worli'],
  'Pune': ['Kharadi', 'Wakad', 'Baner', 'Hadapsar', 'Aundh'],
  'Kalyan-Dombivli': ['Kalyan East', 'Kalyan West', 'Dombivli East', 'Dombivli West'],
  'Bengaluru': ['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Jayanagar'],
  'Hyderabad': ['Hitech City', 'Gachibowli', 'Banjara Hills', 'Jubilee Hills', 'Secunderabad'],
  'Chennai': ['Anna Nagar', 'T.Nagar', 'Adyar', 'Velachery', 'Porur'],
  'Jaipur': ['Vaishali Nagar', 'Malviya Nagar', 'C-Scheme', 'Mansarovar', 'Raja Park'],
};

const EMPTY_FORM = {
  state: '', city: '', division: '', address: '', pinCode: '',
  phoneNumber: '', email: '', capacity: 50, operatingHours: '09:00 - 22:00', status: 'active', notes: '',
};

function generateKitchenId(state, city, division) {
  if (!state || !city || !division) return '';
  const st = state.slice(0, 2).toUpperCase();
  const ct = city.slice(0, 2).toUpperCase();
  const dv = division.replace(/\s+/g, '').slice(0, 4).toUpperCase();
  return `${st}-${ct}-${dv}`;
}

export default function AdminKitchens() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [kitchens, setKitchens] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [filterManager, setFilterManager] = useState('All Managers');
  const [filterStatus, setFilterStatus] = useState('All');
  const [formLoading, setFormLoading] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const kitchenId = generateKitchenId(form.state, form.city, form.division);

  const fetchKitchens = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      if (filterStatus !== 'All') params.status = filterStatus.toLowerCase();
      const { data } = await adminAPI.getKitchens(params);
      setKitchens(data.kitchens);
      setTotal(data.total);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, filterStatus]);

  const fetchManagers = useCallback(async () => {
    try {
      const { data } = await adminAPI.getManagers({ limit: 100, status: 'active' });
      setManagers(data.managers || []);
    } catch (e) { setManagers([]); }
  }, []);

  useEffect(() => { fetchKitchens(); }, [fetchKitchens]);
  useEffect(() => { fetchManagers(); }, [fetchManagers]);

  const openAdd = () => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); };
  const openEdit = (k) => {
    setForm({ ...k, manager: k.manager?._id || '' });
    setEditId(k._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...form };
      if (!payload.manager) delete payload.manager;
      if (editId) {
        await adminAPI.updateKitchen(editId, payload);
        toast.success('Cloud kitchen updated!');
      } else {
        await adminAPI.createKitchen(payload);
        toast.success('Cloud kitchen created!');
      }
      setShowForm(false);
      setEditId(null);
      fetchKitchens();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving kitchen'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this cloud kitchen?')) return;
    try {
      await adminAPI.deleteKitchen(id);
      toast.success('Kitchen deleted');
      fetchKitchens();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const citiesForState = CITIES_BY_STATE[form.state] || [];
  const divisionsForCity = DIVISIONS_BY_CITY[form.city] || [];

  const filteredKitchens = kitchens.filter(k => {
    if (filterManager !== 'All Managers' && filterManager !== '') {
      const managerId = k.manager?._id || k.manager;
      if (managerId !== filterManager) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary-500" /> Cloud Kitchens
          </h1>
          <p className="text-gray-400 text-xs mt-0.5">Manage your cloud kitchen operations</p>
        </div>
        <button onClick={openAdd} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Cloud Kitchen
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            className="input-field pl-10 text-sm py-2"
            placeholder="Search cloud kitchens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field text-sm py-2 pr-8 max-w-[180px]"
          value={filterManager}
          onChange={(e) => setFilterManager(e.target.value)}
        >
          <option value="All Managers">All Managers</option>
          {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>
        <select
          className="input-field text-sm py-2 pr-8 max-w-[120px]"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option>All</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
        <button onClick={fetchKitchens} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 rounded-xl transition-all" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Kitchen ID', 'State', 'City', 'Division', 'Address', 'PIN', 'Manager', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={9} className="px-4 py-3"><div className="skeleton h-5 rounded" /></td></tr>
                ))
              ) : filteredKitchens.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-gray-400">
                    <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No cloud kitchens found. <button onClick={openAdd} className="text-primary-500 font-medium">Add one now</button></p>
                  </td>
                </tr>
              ) : filteredKitchens.map((k) => (
                <tr key={k._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-lg">{k.kitchenId}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{k.state}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg">{k.city}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{k.division}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">{k.address}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{k.pinCode}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{k.manager?.name || <span className="text-gray-300">—</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${k.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {k.status === 'active' ? 'Active Kitchen' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(k)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(k._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 overflow-y-auto" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl my-4 shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-display font-bold text-gray-900 text-lg">{editId ? 'Edit Cloud Kitchen' : 'Add Cloud Kitchen'}</h3>
                <p className="text-gray-400 text-xs mt-0.5">Register a new cloud kitchen facility</p>
              </div>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Kitchen ID (auto-generated) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="label text-xs">Cloud Kitchen ID *</label>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    🔒 Fixed & Non-Editable
                  </span>
                </div>
                <div className="relative">
                  <input
                    className="input-field text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                    value={kitchenId || 'Auto-generated based on location'}
                    readOnly
                    placeholder="Auto-generated based on location"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">ID is generated automatically from State, City & Division and cannot be manually edited.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* State */}
                <div>
                  <label className="label text-xs">State *</label>
                  <select
                    className="input-field text-sm py-2.5"
                    value={form.state}
                    onChange={(e) => setForm(p => ({ ...p, state: e.target.value, city: '', division: '' }))}
                    required
                  >
                    <option value="">Search or select state...</option>
                    {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className="label text-xs">City *</label>
                  <select
                    className="input-field text-sm py-2.5"
                    value={form.city}
                    onChange={(e) => setForm(p => ({ ...p, city: e.target.value, division: '' }))}
                    required
                    disabled={!form.state}
                  >
                    <option value="">{form.state ? 'Select city' : 'Select state first'}</option>
                    {citiesForState.map(c => <option key={c} value={c}>{c}</option>)}
                    {form.state && citiesForState.length === 0 && <option value={form.state + ' City'}>{form.state} (Enter manually)</option>}
                  </select>
                </div>

                {/* Division */}
                <div>
                  <label className="label text-xs">Division *</label>
                  <select
                    className="input-field text-sm py-2.5"
                    value={form.division}
                    onChange={(e) => setForm(p => ({ ...p, division: e.target.value }))}
                    required
                    disabled={!form.city}
                  >
                    <option value="">{form.city ? 'Select division' : 'Select city first'}</option>
                    {divisionsForCity.map(d => <option key={d} value={d}>{d}</option>)}
                    {form.city && divisionsForCity.length === 0 && <option value={form.city + ' Division'}>{form.city} Division</option>}
                  </select>
                </div>

                {/* PIN Code */}
                <div>
                  <label className="label text-xs">PIN Code *</label>
                  <input
                    className="input-field text-sm py-2.5"
                    placeholder="e.g., 400001"
                    value={form.pinCode}
                    maxLength={6}
                    onChange={(e) => setForm(p => ({ ...p, pinCode: e.target.value.replace(/\D/g, '') }))}
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="label text-xs">Address *</label>
                <textarea
                  className="input-field text-sm h-16 resize-none"
                  placeholder="Full address with landmark"
                  value={form.address}
                  onChange={(e) => setForm(p => ({ ...p, address: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="label text-xs"><Phone className="w-3 h-3 inline mr-1" />Phone Number</label>
                  <input className="input-field text-sm py-2.5" placeholder="+91 98765 43210" value={form.phoneNumber}
                    onChange={(e) => setForm(p => ({ ...p, phoneNumber: e.target.value }))} />
                </div>

                {/* Email */}
                <div>
                  <label className="label text-xs"><Mail className="w-3 h-3 inline mr-1" />Email</label>
                  <input type="email" className="input-field text-sm py-2.5" placeholder="kitchen@foodrush.com" value={form.email}
                    onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} />
                </div>

                {/* Capacity */}
                <div>
                  <label className="label text-xs">Capacity (meals/day)</label>
                  <input type="number" className="input-field text-sm py-2.5" value={form.capacity}
                    onChange={(e) => setForm(p => ({ ...p, capacity: e.target.value }))} />
                </div>

                {/* Operating Hours */}
                <div>
                  <label className="label text-xs">Operating Hours</label>
                  <input className="input-field text-sm py-2.5" placeholder="09:00 - 22:00" value={form.operatingHours}
                    onChange={(e) => setForm(p => ({ ...p, operatingHours: e.target.value }))} />
                </div>

                {/* Manager */}
                <div>
                  <label className="label text-xs">Assigned Manager</label>
                  <select className="input-field text-sm py-2.5" value={form.manager || ''}
                    onChange={(e) => setForm(p => ({ ...p, manager: e.target.value }))}>
                    <option value="">No Manager Assigned</option>
                    {managers.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="label text-xs">Status</label>
                  <div className="flex items-center gap-3 mt-2">
                    <button type="button"
                      onClick={() => setForm(p => ({ ...p, status: p.status === 'active' ? 'inactive' : 'active' }))}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${form.status === 'active' ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${form.status === 'active' ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                    <span className={`text-sm font-medium ${form.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                      {form.status === 'active' ? 'Active Kitchen' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="label text-xs">Notes</label>
                <textarea className="input-field text-sm h-14 resize-none" placeholder="Optional notes..." value={form.notes}
                  onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1 text-sm">
                  {formLoading ? 'Saving...' : editId ? 'Update Kitchen' : 'Add Kitchen'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
