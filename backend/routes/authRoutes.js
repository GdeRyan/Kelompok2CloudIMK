const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// === Register ===
router.post('/register', authController.register);

// === Login ===
router.post('/login', authController.login);

// === List User ===
router.get('/users', authMiddleware, authController.listUsers);

module.exports = router;