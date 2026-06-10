const express = require('express');
const cartController = require('../controllers/cartController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All cart routes require user authentication
router.use(protect);

router.route('/')
    .get(cartController.getCart)
    .post(cartController.addToCart)
    .patch(cartController.updateCartItem)
    .delete(cartController.clearCart);

router.post('/sync', cartController.syncCart);

router.delete('/items/:productId/:variant', cartController.removeItem);

module.exports = router;
