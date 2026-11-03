import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import { couponAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY = { code: '', description: '', discountType: 'percentage', discountValue: '', minimumOrderValue: 0, maximumDiscount: '', expiryDate: '', usageLimit: '', isActive: true };

export default function AdminCoupons() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      setForm(EMPTY);
      setEditId(null);
      setShowForm(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data } = await couponAPI.getAll();
      setCoupons(data.coupons);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const payload = { ...form };
      if (!payload.maximumDiscount) delete payload.maximumDiscount;
      if (!payload.usageLimit) delete payload.usageLimit;
      if (editId) {
        await couponAPI.update(editId, payload);
        toast.success('Coupon updated!');
      } else {
        await couponAPI.create(payload);
        toast.success('Coupon created!');
      }
      setShowForm(false);
      setEditId(null);
      fetchCoupons();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await couponAPI.delete(id);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (e) { toast.error('Failed to delete'); }
  };

  const toggleActive = async (coupon) => {
    try {
      await couponAPI.update(coupon._id, { isActive: !coupon.isActive });
      toast.success('Status updated');
      fetchCoupons();
    } catch (e) { toast.error('Failed'); }
  };

  const isExpired = (date) => new Date(date) < new Date();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-bold text-gray-900">Coupons</h1>
        <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(true); }} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(6).fill(0).map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />) :
          coupons.map((coupon) => {
            const expired = isExpired(coupon.expiryDate);
            return (
              <div key={coupon._id} className={`bg-white rounded-2xl shadow-card p-5 border-l-4 ${coupon.isActive && !expired ? 'border-primary-500' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-display font-bold text-gray-900 text-lg">{coupon.code}</span>
                    {expired && <span className="ml-2 badge-red text-xs">Expired</span>}
                    {!coupon.isActive && !expired && <span className="ml-2 badge text-xs bg-gray-100 text-gray-500">Inactive</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setForm({ ...coupon, expiryDate: coupon.expiryDate?.slice(0, 10) }); setEditId(coupon._id); setShowForm(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(coupon._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{coupon.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div><span className="text-gray-400">Discount:</span> <strong className="text-primary-600">{coupon.discountValue}{coupon.discountType === 'percentage' ? '%' : '₹'} off</strong></div>
                  <div><span className="text-gray-400">Min Order:</span> ₹{coupon.minimumOrderValue}</div>
                  <div><span className="text-gray-400">Used:</span> {coupon.usedCount}/{coupon.usageLimit || '∞'}</div>
                  <div><span className="text-gray-400">Expires:</span> {new Date(coupon.expiryDate).toLocaleDateString('en-IN')}</div>
                </div>
                <div className="mt-3 flex items-center justify-end">
                  <button onClick={() => toggleActive(coupon)} className="flex items-center gap-1 text-xs">
                    {coupon.isActive ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                    <span className={coupon.isActive ? 'text-green-600' : 'text-gray-400'}>{coupon.isActive ? 'Active' : 'Inactive'}</span>
                  </button>
                </div>
              </div>
            );
          })
        }
        {!loading && coupons.length === 0 && (
          <div className="col-span-3 text-center py-10 text-gray-400">No coupons. <button onClick={() => setShowForm(true)} className="text-primary-500">Create one</button></div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">{editId ? 'Edit Coupon' : 'Create Coupon'}</h3>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label">Code *</label>
                <input className="input-field uppercase" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} required placeholder="SAVE20" />
              </div>
              <div>
                <label className="label">Description *</label>
                <input className="input-field" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Discount Type</label>
                  <select className="input-field text-sm py-2.5" value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="label text-xs">Value *</label>
                  <input type="number" className="input-field text-sm py-2.5" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} required />
                </div>
                <div>
                  <label className="label text-xs">Min. Order (₹)</label>
                  <input type="number" className="input-field text-sm py-2.5" value={form.minimumOrderValue} onChange={(e) => setForm((p) => ({ ...p, minimumOrderValue: e.target.value }))} />
                </div>
                <div>
                  <label className="label text-xs">Max. Discount (₹)</label>
                  <input type="number" className="input-field text-sm py-2.5" value={form.maximumDiscount} onChange={(e) => setForm((p) => ({ ...p, maximumDiscount: e.target.value }))} placeholder="No limit" />
                </div>
                <div>
                  <label className="label text-xs">Expiry Date *</label>
                  <input type="date" className="input-field text-sm py-2.5" value={form.expiryDate} onChange={(e) => setForm((p) => ({ ...p, expiryDate: e.target.value }))} required />
                </div>
                <div>
                  <label className="label text-xs">Usage Limit</label>
                  <input type="number" className="input-field text-sm py-2.5" value={form.usageLimit} onChange={(e) => setForm((p) => ({ ...p, usageLimit: e.target.value }))} placeholder="Unlimited" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
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
