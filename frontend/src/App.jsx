import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute, AdminRoute, AdminLoginRoute, GuestRoute } from './components/common/ProtectedRoute';

// Layouts
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';
import AdminSidebar from './components/layout/AdminSidebar';

// Customer Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const RestaurantPage = lazy(() => import('./pages/RestaurantPage'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminRestaurants = lazy(() => import('./pages/admin/AdminRestaurants'));
const AdminFoods = lazy(() => import('./pages/admin/AdminFoods'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminKitchens = lazy(() => import('./pages/admin/AdminKitchens'));
const AdminManagers = lazy(() => import('./pages/admin/AdminManagers'));
const AdminDeliveryPartners = lazy(() => import('./pages/admin/AdminDeliveryPartners'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));

// Customer Layout wrapper
const CustomerLayout = () => (
  <>
    <Navbar />
    <main className="min-h-screen">
      <Outlet />
    </main>
    <Footer />
    <BottomNav />
  </>
);

// Admin Layout wrapper
const AdminLayout = ({ children }) => (
  <AdminSidebar>{children}</AdminSidebar>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: '12px',
                background: '#1a1a2e',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '500',
                padding: '12px 16px',
              },
              success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
            }}
          />
          <Suspense fallback={<div className="min-h-screen grid place-items-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" aria-label="Loading" /></div>}>
          <Routes>
            {/* Customer Routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/restaurant/:id" element={<RestaurantPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/restaurants" element={<SearchPage />} />
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLoginRoute><AdminLogin /></AdminLoginRoute>} />
            <Route path="/admin" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminLayout><AdminAnalytics /></AdminLayout></AdminRoute>} />
            <Route path="/admin/restaurants" element={<AdminRoute><AdminLayout><AdminRestaurants /></AdminLayout></AdminRoute>} />
            <Route path="/admin/kitchens" element={<AdminRoute><AdminLayout><AdminKitchens /></AdminLayout></AdminRoute>} />
            <Route path="/admin/cloud-kitchens" element={<AdminRoute><Navigate to="/admin/kitchens" replace /></AdminRoute>} />
            <Route path="/admin/managers" element={<AdminRoute><AdminLayout><AdminManagers /></AdminLayout></AdminRoute>} />
            <Route path="/admin/cuisines" element={<AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>} />
            <Route path="/admin/meals" element={<AdminRoute><AdminLayout><AdminFoods /></AdminLayout></AdminRoute>} />
            <Route path="/admin/foods" element={<AdminRoute><AdminLayout><AdminFoods /></AdminLayout></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
            <Route path="/admin/customers" element={<AdminRoute><AdminLayout><AdminCustomers /></AdminLayout></AdminRoute>} />
            <Route path="/admin/delivery-partners" element={<AdminRoute><AdminLayout><AdminDeliveryPartners /></AdminLayout></AdminRoute>} />
            <Route path="/admin/payments" element={<AdminRoute><AdminLayout><AdminPayments /></AdminLayout></AdminRoute>} />
            <Route path="/admin/coupons" element={<AdminRoute><AdminLayout><AdminCoupons /></AdminLayout></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute><AdminLayout><AdminReviews /></AdminLayout></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminLayout><AdminSettings /></AdminLayout></AdminRoute>} />
            <Route path="/admin/*" element={<AdminRoute><Navigate to="/admin/dashboard" replace /></AdminRoute>} />

            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
