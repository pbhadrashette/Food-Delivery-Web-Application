const express = require('express');
const router = express.Router();
const {
  getDashboard, getOrders, updateOrderStatus,
  getCustomers, toggleCustomerStatus, getCustomerOrders,
  getAnalytics, getPayments,
  getKitchens, createKitchen, updateKitchen, deleteKitchen,
  getManagers, createManager, updateManager, deleteManager,
  getDeliveryPartners, createDeliveryPartner, updateDeliveryPartner,
  deleteDeliveryPartner, togglePartnerVerification,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

// Dashboard & Analytics
router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);

// Orders
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

// Customers
router.get('/customers', getCustomers);
router.put('/customers/:id/status', toggleCustomerStatus);
router.get('/customers/:id/orders', getCustomerOrders);

// Payments
router.get('/payments', getPayments);

// Cloud Kitchens
router.get('/kitchens', getKitchens);
router.post('/kitchens', createKitchen);
router.put('/kitchens/:id', updateKitchen);
router.delete('/kitchens/:id', deleteKitchen);

// Managers
router.get('/managers', getManagers);
router.post('/managers', createManager);
router.put('/managers/:id', updateManager);
router.delete('/managers/:id', deleteManager);

// Delivery Partners
router.get('/delivery-partners', getDeliveryPartners);
router.post('/delivery-partners', createDeliveryPartner);
router.put('/delivery-partners/:id', updateDeliveryPartner);
router.delete('/delivery-partners/:id', deleteDeliveryPartner);
router.put('/delivery-partners/:id/verify', togglePartnerVerification);

module.exports = router;
