import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  return children;
};

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location.pathname, reason: 'auth_required' }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname, reason: 'admin_required' }} replace />;
  }
  return children;
};

export const AdminLoginRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return children;
};

export const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
};
