const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authMiddleware');

// Route tanımları
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/users/:userId', authMiddleware, authController.getUserInfo);
router.put('/update-profile/:userId', authController.updateProfile);

module.exports = router;
