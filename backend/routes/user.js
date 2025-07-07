const express = require('express');
const authenticate = require('../middlewares/auth');
const { getUserProfile, updateUserProfile } = require('../controllers/user');

const router = express.Router();

// Get user profile
router.get('/profile', authenticate, getUserProfile);

// Update user profile
router.put('/profile', authenticate, updateUserProfile);

module.exports = router;