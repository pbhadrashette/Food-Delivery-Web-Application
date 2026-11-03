import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor - attach token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 & 403
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const path = window.location.pathname;

    if (status === 401 || (status === 403 && path.startsWith('/admin'))) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      if (path.startsWith('/admin') && path !== '/admin/login') {
        window.location.href = '/admin/login';
      } else if (!path.includes('/login') && !path.startsWith('/admin')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  adminLogin: (data) => API.post('/auth/admin/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me'),
};

// Users
export const userAPI = {
  getProfile: () => API.get('/users/profile'),
  updateProfile: (data) => API.put('/users/profile', data),
  changePassword: (data) => API.put('/users/change-password', data),
  addAddress: (data) => API.post('/users/addresses', data),
  updateAddress: (id, data) => API.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => API.delete(`/users/addresses/${id}`),
  toggleFavRestaurant: (id) => API.post(`/users/favorites/restaurants/${id}`),
  toggleFavFood: (id) => API.post(`/users/favorites/foods/${id}`),
};

// Restaurants
export const restaurantAPI = {
  getAll: (params) => API.get('/restaurants', { params }),
  getAllAdmin: (params) => API.get('/restaurants/manage', { params }),
  getOne: (id) => API.get(`/restaurants/${id}`),
  search: (params) => API.get('/restaurants/search', { params }),
  create: (data) => API.post('/restaurants', data),
  update: (id, data) => API.put(`/restaurants/${id}`, data),
  delete: (id) => API.delete(`/restaurants/${id}`),
};

// Foods
export const foodAPI = {
  getAll: (params) => API.get('/foods', { params }),
  getAllAdmin: (params) => API.get('/foods/manage', { params }),
  getOne: (id) => API.get(`/foods/${id}`),
  create: (data) => API.post('/foods', data),
  update: (id, data) => API.put(`/foods/${id}`, data),
  delete: (id) => API.delete(`/foods/${id}`),
};

// Categories
export const categoryAPI = {
  getAll: () => API.get('/categories'),
  getAllAdmin: () => API.get('/categories/all'),
  create: (data) => API.post('/categories', data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};
export const cuisineAPI = categoryAPI;

// Cart
export const cartAPI = {
  get: () => API.get('/cart'),
  add: (data) => API.post('/cart', data),
  update: (itemId, data) => API.put(`/cart/${itemId}`, data),
  remove: (itemId) => API.delete(`/cart/${itemId}`),
  clear: () => API.delete('/cart'),
};

// Orders
export const orderAPI = {
  create: (data) => API.post('/orders', data),
  getAll: (params) => API.get('/orders', { params }),
  getOne: (id) => API.get(`/orders/${id}`),
  cancel: (id, data) => API.put(`/orders/${id}/cancel`, data),
};

// Coupons
export const couponAPI = {
  getActive: () => API.get('/coupons/active'),
  validate: (data) => API.post('/coupons/validate', data),
  getAll: () => API.get('/coupons'),
  create: (data) => API.post('/coupons', data),
  update: (id, data) => API.put(`/coupons/${id}`, data),
  delete: (id) => API.delete(`/coupons/${id}`),
};

// Cloud Kitchens (public)
export const kitchenAPI = {
  getAll: (params) => API.get('/kitchens', { params }),
};

// Reviews
export const reviewAPI = {
  getPublic: () => API.get('/reviews/public'),
  create: (data) => API.post('/reviews', data),
  getForRestaurant: (restaurantId) => API.get(`/reviews/${restaurantId}`),
  getAll: (params) => API.get('/reviews', { params }),
  delete: (id) => API.delete(`/reviews/${id}`),
};

// Admin
export const adminAPI = {
  getDashboard: () => API.get('/admin/dashboard'),
  getAnalytics: () => API.get('/admin/analytics'),

  // Orders
  getOrders: (params) => API.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => API.put(`/admin/orders/${id}/status`, data),

  // Customers
  getCustomers: (params) => API.get('/admin/customers', { params }),
  toggleCustomerStatus: (id) => API.put(`/admin/customers/${id}/status`),
  getCustomerOrders: (id) => API.get(`/admin/customers/${id}/orders`),

  // Payments
  getPayments: (params) => API.get('/admin/payments', { params }),

  // Cloud Kitchens
  getKitchens: (params) => API.get('/admin/kitchens', { params }),
  createKitchen: (data) => API.post('/admin/kitchens', data),
  updateKitchen: (id, data) => API.put(`/admin/kitchens/${id}`, data),
  deleteKitchen: (id) => API.delete(`/admin/kitchens/${id}`),

  // Managers
  getManagers: (params) => API.get('/admin/managers', { params }),
  createManager: (data) => API.post('/admin/managers', data),
  updateManager: (id, data) => API.put(`/admin/managers/${id}`, data),
  deleteManager: (id) => API.delete(`/admin/managers/${id}`),

  // Delivery Partners
  getDeliveryPartners: (params) => API.get('/admin/delivery-partners', { params }),
  createDeliveryPartner: (data) => API.post('/admin/delivery-partners', data),
  updateDeliveryPartner: (id, data) => API.put(`/admin/delivery-partners/${id}`, data),
  deleteDeliveryPartner: (id) => API.delete(`/admin/delivery-partners/${id}`),
  togglePartnerVerification: (id) => API.put(`/admin/delivery-partners/${id}/verify`),
};

export default API;
