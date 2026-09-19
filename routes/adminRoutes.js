const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllReviews,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats
} = require('../controllers/adminController');
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

// @route   GET api/admin/orders
// @desc    Get all orders
// @access  Private/Admin
router.get('/orders', auth, admin, getAllOrders);

// @route   PUT api/admin/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id/status', auth, admin, updateOrderStatus);

// @route   GET api/admin/dashboard-stats
// @desc    Get dashboard metrics
// @access  Private/Admin
router.get('/dashboard-stats', auth, admin, getDashboardStats);

module.exports = router;
