const express = require('express');
const productController = require('../controllers/productController');
const router = express.Router();

const { protect, restrictTo } = require('../middlewares/authMiddleware');

router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);

// Admin only routes
router.use(protect);
router.use(restrictTo('admin', 'superadmin'));

router.post('/', productController.createProduct);
router.patch('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.post('/seed', productController.seedProducts);
router.post('/add-multiple', productController.addMultipleProducts);

module.exports = router;
