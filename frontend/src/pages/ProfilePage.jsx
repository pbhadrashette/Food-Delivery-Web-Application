import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Lock, MapPin, Plus, Edit2, Trash2, ShoppingBag, Heart, ArrowRight, Clock3 } from 'lucide-react';
import { userAPI, orderAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'password', label: 'Password', icon: Lock },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [addrForm, setAddrForm] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.addresses) setAddresses(user.addresses);
  }, [user]);

  useEffect(() => {
    orderAPI.getAll()
      .then(({ data }) => setRecentOrders(data.orders || []))
      .catch(() => setRecentOrders([]));
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await userAPI.updateProfile(profileForm);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
    finally { setLoading(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await userAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    if (!addrForm.fullName?.trim()) { toast.error('Full Name is required'); return; }
    const phoneClean = (addrForm.phone || '').replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(phoneClean)) { toast.error('Please enter a valid 10-digit Indian phone number (starting with 6-9)'); return; }
    if (!addrForm.houseFlat?.trim()) { toast.error('House/Flat/Building is required'); return; }
    if (!addrForm.area?.trim()) { toast.error('Area/Locality is required'); return; }
    if (!addrForm.city?.trim()) { toast.error('City is required'); return; }
    const pinClean = (addrForm.pincode || '').replace(/\D/g, '');
    if (!/^\d{6}$/.test(pinClean)) { toast.error('Please enter a valid 6-digit Indian PIN code'); return; }

    setLoading(true);
    try {
      const { _id, ...addrData } = addrForm;
      let data;
      if (addrForm._id && !addrForm._id.startsWith('new')) {
        ({ data } = await userAPI.updateAddress(addrForm._id, addrData));
      } else {
        ({ data } = await userAPI.addAddress(addrData));
      }
      setAddresses(data.addresses);
      updateUser({ ...user, addresses: data.addresses });
      toast.success('Address saved!');
      setAddrForm(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save address'); }
    finally { setLoading(false); }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      const { data } = await userAPI.deleteAddress(addrId);
      setAddresses(data.addresses);
      updateUser({ ...user, addresses: data.addresses });
      toast.success('Address deleted');
    } catch (err) { toast.error('Failed to delete address'); }
  };

  const newAddrTemplate = { _id: 'new', fullName: user?.name || '', phone: user?.phone || '', houseFlat: '', area: '', city: '', pincode: '', landmark: '', addressType: 'Home', isDefault: false };

  return (
    <div className="page-container py-6 pb-24 md:pb-8 animate-fade-in">
      <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-primary-500">Your account</p><h1 className="section-title">Welcome back, {user?.name?.split(' ')[0]}</h1><p className="section-subtitle">Manage your profile, orders and saved places.</p></div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Account active</span>
      </div>

      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Total orders', value: recentOrders.length, icon: ShoppingBag, tone: 'bg-primary-50 text-primary-600' },
          { label: 'Active orders', value: recentOrders.filter((order) => !['DELIVERED', 'CANCELLED'].includes(order.status)).length, icon: Clock3, tone: 'bg-sky-50 text-sky-600' },
          { label: 'Saved places', value: addresses.length, icon: MapPin, tone: 'bg-teal-50 text-teal-600' },
          { label: 'Favorites', value: user?.favoriteRestaurants?.length || 0, icon: Heart, tone: 'bg-rose-50 text-rose-600' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"><div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></div><p className="text-2xl font-black text-gray-900">{value}</p><p className="mt-0.5 text-xs font-medium text-gray-500">{label}</p></div>
        ))}
      </div>

      <div className="mb-7 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-2xl bg-gradient-to-br from-[#17263d] via-[#0f777c] to-primary-600 p-6 text-white shadow-lg"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-mango">Keep exploring</p><h2 className="mt-2 max-w-sm font-display text-2xl font-black">Find something delicious for tonight.</h2><p className="mt-2 max-w-sm text-sm text-white/70">Browse nearby restaurants and discover your next favorite meal.</p></div><span className="text-4xl">🍔</span></div><Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-mango px-4 py-2.5 text-sm font-bold text-[#17263d] transition hover:bg-orange-300">Browse restaurants <ArrowRight className="h-4 w-4" /></Link></div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-display font-bold text-gray-900">Recent orders</h2><p className="mt-1 text-xs text-gray-500">Your latest activity</p></div><Link to="/orders" className="text-xs font-bold text-primary-500">View all</Link></div>{recentOrders.slice(0, 2).map((order) => <div key={order._id} className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-gray-800">{order.restaurant?.name || 'Food order'}</p><p className="mt-0.5 text-xs text-gray-500">{order.status.replace(/_/g, ' ')}</p></div><span className="text-sm font-black text-gray-900">₹{order.totalAmount}</span></div>)}{recentOrders.length === 0 && <p className="mt-5 text-sm text-gray-500">No orders yet.</p>}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* User Card */}
          <div className="card p-5 mb-4 text-center">
            <div className="w-20 h-20 bg-gradient-brand rounded-full flex items-center justify-center text-white font-display font-bold text-2xl mx-auto mb-3 shadow-glow">
              {user?.profileImage ? (
                <img
                  src={user.profileImage.startsWith('http') ? user.profileImage : `${API_ORIGIN}${user.profileImage.startsWith('/') ? user.profileImage : `/${user.profileImage}`}`}
                  className="w-full h-full rounded-full object-cover"
                  alt={user?.name || 'User'}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <h3 className="font-bold text-gray-900">{user?.name}</h3>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            {user?.phone && <p className="text-gray-400 text-xs mt-1">{user.phone}</p>}
          </div>

          {/* Tabs */}
          <div className="card overflow-hidden">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-all border-l-4 ${activeTab === id ? 'text-primary-600 bg-orange-50 border-primary-500' : 'text-gray-600 hover:bg-gray-50 border-transparent'}`}>
                <Icon className="w-4 h-4" />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display font-bold text-gray-900 text-lg mb-5">Personal Information</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input-field" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input className="input-field bg-gray-50 text-gray-500 cursor-not-allowed" value={user?.email} disabled />
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input className="input-field" type="tel" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} placeholder="10-digit mobile number" />
                </div>
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saving...' : 'Save Changes'}</button>
              </form>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-display font-bold text-gray-900 text-lg mb-5">Change Password</h2>
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
                {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirmPassword', 'Confirm New Password']].map(([field, label]) => (
                  <div key={field}>
                    <label className="label">{label}</label>
                    <input type="password" className="input-field" value={pwForm[field]} onChange={(e) => setPwForm((p) => ({ ...p, [field]: e.target.value }))} />
                  </div>
                ))}
                <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Changing...' : 'Change Password'}</button>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-gray-900 text-lg">Saved Addresses</h2>
                <button onClick={() => setAddrForm(newAddrTemplate)} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add New
                </button>
              </div>

              {addrForm && (
                <div className="card p-5 mb-4 animate-slide-up">
                  <h3 className="font-bold text-gray-900 mb-4">{addrForm._id === 'new' ? 'New Address' : 'Edit Address'}</h3>
                  <form onSubmit={handleAddressSubmit}>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        ['fullName', 'Full Name', 'col-span-1', 'Enter your full name'],
                        ['phone', 'Phone Number (10 digits)', 'col-span-1', 'e.g. 9876543210'],
                        ['houseFlat', 'House / Flat / Building No.', 'col-span-2', 'Flat 402, Lotus Tower'],
                        ['area', 'Area / Locality', 'col-span-2', 'Koramangala 4th Block'],
                        ['city', 'City', 'col-span-1', 'Bangalore'],
                        ['pincode', 'Pincode (6 digits)', 'col-span-1', '560034'],
                        ['landmark', 'Landmark (Optional)', 'col-span-2', 'Near Metro Station / Water Tank'],
                      ].map(([key, label, span, placeholder]) => (
                        <div key={key} className={span}>
                          <label className="label text-xs">{label}</label>
                          <input
                            className="input-field text-sm py-2.5"
                            placeholder={placeholder}
                            value={addrForm[key] || ''}
                            onChange={(e) => setAddrForm((p) => ({ ...p, [key]: e.target.value }))}
                          />
                        </div>
                      ))}
                      <div className="col-span-2">
                        <label className="label text-xs">Address Type</label>
                        <div className="flex gap-2">
                          {['Home', 'Work', 'Other'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setAddrForm((p) => ({ ...p, addressType: t }))}
                              className={`px-4 py-1.5 rounded-xl border text-sm font-medium transition-all ${addrForm.addressType === t ? 'bg-primary-500 text-white border-primary-500' : 'border-gray-200 text-gray-600 hover:border-primary-400'}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setAddrForm(null)} className="btn-secondary text-sm py-2">Cancel</button>
                      <button type="submit" disabled={loading} className="btn-primary text-sm py-2 flex-1">{loading ? 'Saving...' : 'Save Address'}</button>
                    </div>
                  </form>
                </div>
              )}

              {addresses.length === 0 && !addrForm ? (
                <div className="card p-10 text-center">
                  <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500">No addresses saved yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 text-sm">{addr.fullName}</p>
                            <span className="badge-blue text-xs">{addr.addressType}</span>
                            {addr.isDefault && <span className="badge-green text-xs">Default</span>}
                          </div>
                          <p className="text-gray-600 text-sm">
                            {[addr.houseFlat, addr.street, addr.area, addr.landmark ? `Near ${addr.landmark}` : null, addr.city, addr.division, addr.state].filter(Boolean).join(', ')} - {addr.pincode}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">📞 {addr.phone}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => setAddrForm({ ...addr })} className="p-2 text-gray-400 hover:text-primary-500 hover:bg-orange-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteAddress(addr._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
