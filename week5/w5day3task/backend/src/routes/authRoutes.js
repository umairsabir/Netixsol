const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

const { protect } = require('../middlewares/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.get('/me', protect, authController.getMe);

module.exports = router;
