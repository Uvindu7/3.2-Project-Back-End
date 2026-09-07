const express = require('express');
const router = express.Router();
const { getAllUsers, deleteUser, getAllReviews } = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', auth, admin, getAllUsers);

// @route   DELETE api/admin/users/:id
// @desc    Delete a user
// @access  Private/Admin
router.delete('/users/:id', auth, admin, deleteUser);

// @route   GET api/admin/reviews
// @desc    Get all reviews
// @access  Private/Admin
router.get('/reviews', auth, admin, getAllReviews);

module.exports = router;
