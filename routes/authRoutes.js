const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, updateUser } = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerUser);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', loginUser);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getMe);

// @route   PUT api/auth/update
// @desc    Update user profile
// @access  Private
router.put('/update', auth, updateUser);

module.exports = router;
