import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Search, X } from 'lucide-react';
import { restaurantAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { resolveRestaurantLogoUrl, getRestaurantLogoFallback } from '../../utils/restaurantImage';

const EMPTY_FORM = { name: '', description: '', phone: '', email: '', address: '', city: '', cuisine: '', openingTime: '09:00', closingTime: '22:00', deliveryFee: 30, minimumOrder: 100, deliveryTime: '30-45', priceForTwo: 400, isVeg: false, discount: '', status: 'active', featured: false };

export default function AdminRestaurants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setForm(EMPTY_FORM);
      setEditId(null);
      setShowForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data } = await restaurantAPI.getAllAdmin({ limit: 50, ...(search ? { search } : {}) });
      setRestaurants(data.restaurants);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRestaurants(); }, [search]);

  const openEdit = (r) => {
    setForm({ ...r, cuisine: r.cuisine?.join(', ') || '' });
    setEditId(r._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (key !== 'logo' && key !== 'coverImage') formData.append(key, val);
      });
      if (form.logoFile) formData.append('logo', form.logoFile);
      if (form.coverImageFile) formData.append('coverImage', form.coverImageFile);

      if (editId) {
        await restaurantAPI.update(editId, formData);
        toast.success('Restaurant updated!');
      } else {
        await restaurantAPI.create(formData);
        toast.success('Restaurant created!');
      }
      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      fetchRestaurants();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving restaurant'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this restaurant and all its menu items?')) return;
    try {
      await restaurantAPI.delete(id);
      toast.success('Restaurant deleted');
      fetchRestaurants();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const toggleStatus = async (r) => {
    try {
      await restaurantAPI.update(r._id, { status: r.status === 'active' ? 'inactive' : 'active' });
      toast.success('Status updated');
      fetchRestaurants();
    } catch (e) { toast.error('Failed to update status'); }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-display font-bold text-gray-900">Restaurants</h1>
        <button onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowForm(true); }} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Restaurant
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input className="input-field pl-10 text-sm py-2.5" placeholder="Search restaurants..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Restaurant', 'City', 'Cuisine', 'Rating', 'Delivery', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? Array(5).fill(0).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>
              )) : restaurants.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-orange-50 border border-gray-100 flex-shrink-0">
                        <img
                          src={resolveRestaurantLogoUrl(r)}
                          alt={r.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getRestaurantLogoFallback(r, e.currentTarget.src);
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{r.name}</p>
                        {r.featured && <span className="badge-orange text-xs">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{r.city}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate">{r.cuisine?.join(', ')}</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-700 font-bold text-xs px-2 py-0.5 rounded-lg">⭐ {r.rating?.toFixed(1)}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">₹{r.deliveryFee} · {r.deliveryTime}min</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(r)} className="flex items-center gap-1">
                      {r.status === 'active' ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                      <span className={`text-xs font-medium ${r.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>{r.status}</span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && restaurants.length === 0 && (
          <div className="text-center py-10 text-gray-400">
            <p>No restaurants found. <button onClick={() => { setForm(EMPTY_FORM); setShowForm(true); }} className="text-primary-500 font-medium">Add one now</button></p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-gray-900 text-lg">{editId ? 'Edit Restaurant' : 'Add Restaurant'}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              {[['name', 'Restaurant Name', 'col-span-2', true], ['description', 'Description', 'col-span-2', true], ['phone', 'Phone', 'col-span-1', true], ['email', 'Email', 'col-span-1', true], ['address', 'Address', 'col-span-2', true], ['city', 'City', 'col-span-1', true], ['cuisine', 'Cuisine (comma-separated)', 'col-span-1', true], ['deliveryFee', 'Delivery Fee (₹)', 'col-span-1', false], ['minimumOrder', 'Min. Order (₹)', 'col-span-1', false], ['deliveryTime', 'Delivery Time (e.g. 30-45)', 'col-span-1', false], ['priceForTwo', 'Price for Two (₹)', 'col-span-1', false], ['discount', 'Discount Text', 'col-span-2', false]].map(([key, label, span, req]) => (
                <div key={key} className={span}>
                  <label className="label text-xs">{label}</label>
                  {key === 'description' ? (
                    <textarea className="input-field text-sm h-16 resize-none" value={form[key] || ''} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} required={req} />
                  ) : (
                    <input type={['deliveryFee', 'minimumOrder', 'priceForTwo'].includes(key) ? 'number' : 'text'} className="input-field text-sm py-2.5" value={form[key] || ''} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} required={req} />
                  )}
                </div>
              ))}
              <div>
                <label className="label text-xs">Status</label>
                <select className="input-field text-sm py-2.5" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex items-center gap-3 mt-4">
                <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />
                <label htmlFor="featured" className="text-sm text-gray-700">Featured restaurant</label>
              </div>
              <div>
                <label className="label text-xs">Logo</label>
                <input type="file" accept="image/*" className="input-field text-sm py-2" onChange={(e) => setForm((p) => ({ ...p, logoFile: e.target.files[0] }))} />
              </div>
              <div>
                <label className="label text-xs">Cover Image</label>
                <input type="file" accept="image/*" className="input-field text-sm py-2" onChange={(e) => setForm((p) => ({ ...p, coverImageFile: e.target.files[0] }))} />
              </div>
              <div className="col-span-2 flex gap-3 mt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button type="submit" disabled={formLoading} className="btn-primary flex-1 text-sm">{formLoading ? 'Saving...' : (editId ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
