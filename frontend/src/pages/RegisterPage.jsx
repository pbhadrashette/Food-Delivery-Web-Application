import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Account created! Welcome to FoodieRush 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { key: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'John Doe' },
    { key: 'email', label: 'Email Address', type: 'email', icon: Mail, placeholder: 'you@example.com' },
    { key: 'phone', label: 'Phone (Optional)', type: 'tel', icon: Phone, placeholder: '10-digit mobile' },
  ];

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow">
            <span className="text-3xl">🍔</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-2">Join FoodieRush and start ordering today!</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, label, type, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input type={type} className="input-field pl-11" placeholder={placeholder} value={form[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} required={key !== 'phone'} />
                </div>
              </div>
            ))}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input type={showPw ? 'text' : 'password'} className="input-field pl-11 pr-11" placeholder="Min. 6 characters" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} required />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 font-semibold hover:text-primary-600">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
