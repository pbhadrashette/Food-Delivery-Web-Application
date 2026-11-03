import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { loginAdmin, logout, user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectReason = location.state?.reason;

  useEffect(() => {
    if (redirectReason === 'admin_required') {
      toast.error('Access denied. Admin credentials required to access FoodRush.', { id: 'admin-denied' });
    } else if (redirectReason === 'auth_required') {
      toast('Please log in with an administrator account.', { icon: '🛡️', id: 'admin-auth-req' });
    }
  }, [redirectReason]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginAdmin(form.email, form.password);
      toast.success('Welcome, Admin! 🛡️');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-10 px-4 sm:py-12">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2.5 sm:gap-3">
            <img src="/project-logo.png" alt="" className="h-12 w-12 shrink-0 object-contain sm:h-14 sm:w-14" />
            <h1 className="font-display text-xl font-extrabold tracking-tight text-gray-900 sm:text-2xl">
              FoodRush Admin Portal
            </h1>
          </div>
          <p className="mt-3 text-center text-sm text-gray-500">Sign in with an authorized administrator account</p>
        </div>

        {/* Warning banner if redirected from protected admin route */}
        {redirectReason === 'admin_required' && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 sm:text-sm animate-fade-in">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="font-semibold">Admin Privileges Required</p>
              <p className="mt-0.5 text-xs text-red-700">FoodRush can only be accessed after signing in with an administrator account.</p>
            </div>
          </div>
        )}

        {/* Notice if currently signed in as non-admin customer */}
        {isAuthenticated && !isAdmin && (
          <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 p-3.5 text-xs text-orange-900 sm:text-sm animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-orange-600" />
                <span>Signed in as <strong>{user?.name}</strong> (Customer)</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="text-xs font-semibold text-orange-700 underline hover:text-orange-900"
              >
                Sign Out
              </button>
            </div>
            <p className="mt-1 text-xs text-orange-800">Please sign in with your admin credentials to open the dashboard.</p>
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl shadow-gray-200/70 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-email-input" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="admin-email-input"
                autoComplete="username"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="admin-password-input" className="mb-1.5 block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="admin-password-input"
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>

            <button
              type="submit"
              id="admin-login-submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-orange-600 py-3.5 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:from-primary-600 hover:to-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        {/* Return to storefront */}
        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-primary-600">
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to FoodieRush Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
