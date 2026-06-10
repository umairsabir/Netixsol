const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes here are for admin/superadmin only
router.use(protect);
router.use(restrictTo('admin', 'superadmin'));

router.get('/stats', adminController.getDashboardStats);
router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/role', restrictTo('superadmin'), adminController.updateUserRole);

module.exports = router;
