const express = require('express');
const orderController = require('../controllers/orderController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// Protect all order routes
router.use(protect);

router.post('/', orderController.createOrder);
router.get('/my-orders', orderController.getMyOrders);
router.patch('/:id/cancel', orderController.cancelMyOrder);

// Admin only routes
router.get('/', restrictTo('admin', 'superadmin'), orderController.getAllOrders);
router.patch('/:id/status', restrictTo('admin', 'superadmin'), orderController.updateOrderStatus);

module.exports = router;
